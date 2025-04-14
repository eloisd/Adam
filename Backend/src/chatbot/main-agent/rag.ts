import { Injectable } from "@nestjs/common";
import { RAG_TEMPLATE } from "./prompt";
import { z } from "zod";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { Document } from "langchain/document";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ConfigService } from "@nestjs/config";
import AgentState from "./agent_state";
import { ChromaDbService } from "../vector-store/chromadb/chromadb.service";

// Definition of the document grading schema
const GradeDocumentSchema = z.object({
  score: z
    .string()
    .describe(
      "Document is relevant to the question? If yes -> 'Yes' if not -> 'No'",
    ),
});

type GradeDocument = z.infer<typeof GradeDocumentSchema>;

@Injectable()
export class RagSService {
  private readonly llm: ChatOpenAI;

  constructor(
    private configService: ConfigService,
    private chromaService: ChromaDbService,
  ) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: this.configService.get<string>("OPENAI_API_KEY"),
    });
  }

  async retrieve(
    state: typeof AgentState.State,
  ): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering retrieve");
    state.tool_used = state.messages[state.messages.length - 1].name!!;

    // Note: Actual document retrieval implementation would go here
    // This is where you would integrate with a vector database like Chroma, etc.

    // Placeholder for retrieval implementation
    // const embedding_function = new OpenAIEmbeddings({
    //   modelName: "text-embedding-3-small",
    //   dimensions: 1536
    // });
    // const db = await Chroma.fromDocuments(chunks, embedding_function);
    // const retriever = db.asRetriever({ k: 10 });
    // const documents = await retriever.invoke(state.rephrased_question);

    console.log(`retrieve: Retrieved documents placeholder`);
    // state.documents would be populated here

    const retriever = this.chromaService.getRetriever(10);
    state.documents = await retriever.invoke(state.rephrased_question);

    return state;
  }

  async retrievalGrader(
    state: typeof AgentState.State,
  ): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering retrievalGrader");

    const system_message = new SystemMessage(
      "You are a grader assessing the relevance of a retrieved document to a user question.\n" +
        "Only answer with 'Yes' or 'No'.\n\n" +
        "If the document contains information relevant to the user's question, respond with 'Yes'.\n" +
        "Otherwise, respond with 'No'.",
    );

    const structuredLlm = this.llm.withStructuredOutput(GradeDocumentSchema);
    const relevant_docs: Document[] = [];

    for (const doc of state.documents) {
      const human_message = new HumanMessage(
        `User question: ${state.rephrased_question}\n\nRetrieved document:\n${doc.pageContent}`,
      );

      const grade_prompt = ChatPromptTemplate.fromMessages([
        system_message,
        human_message,
      ]);
      const grader_llm = grade_prompt.pipe(structuredLlm);

      try {
        const result = (await grader_llm.invoke({})) as GradeDocument;

        console.log(
          `Grading document: ${doc.pageContent.substring(0, 30)}... Result: ${result.score.trim()}`,
        );

        if (result.score.trim().toLowerCase() === "yes") {
          relevant_docs.push(doc);
        }
      } catch (error) {
        console.error(`Error grading document: ${error}`);
      }
    }

    state.documents = relevant_docs;
    state.proceed_to_generate = relevant_docs.length > 0;
    console.log(
      `retrievalGrader: proceed_to_generate = ${state.proceed_to_generate}`,
    );

    return state;
  }

  proceedRouter(state: typeof AgentState.State): string {
    console.log("Entering proceedRouter");

    const rephrase_count = state.rephrase_count || 0;

    if (state.proceed_to_generate) {
      console.log("Routing to generateAnswer");
      return "generate_answer";
    } else if (rephrase_count >= 2) {
      console.log(
        "Maximum rephrase attempts reached. Cannot find relevant documents.",
      );
      return "cannot_answer";
    } else {
      console.log("Routing to refineQuestion");
      return "refine_question";
    }
  }

  async refineQuestion(
    state: typeof AgentState.State,
  ): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering refineQuestion");

    const rephrase_count = state.rephrase_count || 0;
    if (rephrase_count >= 2) {
      console.log("Maximum rephrase attempts reached");
      return state;
    }

    try {
      const question_to_refine = state.rephrased_question;
      const system_message = new SystemMessage(
        "You are a helpful assistant that slightly refines the user's question to improve retrieval results.\n" +
          "Provide a slightly adjusted version of the question.",
      );

      const human_message = new HumanMessage(
        `Original question: ${question_to_refine}\n\nProvide a slightly refined question.`,
      );

      const refine_prompt = ChatPromptTemplate.fromMessages([
        system_message,
        human_message,
      ]);

      const promptMessages = await refine_prompt.formatMessages({});
      const response = await this.llm.invoke(promptMessages);
      const refined_question = response.text.trim();

      console.log(`refineQuestion: Refined question: ${refined_question}`);
      state.rephrased_question = refined_question;
      state.rephrase_count = rephrase_count + 1;
    } catch (error) {
      console.error(`Error refining question: ${error}`);
    }

    return state;
  }

  async generateAnswer(
    state: typeof AgentState.State,
  ): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering generateAnswer");

    if (!state.messages_) {
      throw new Error(
        "State must include 'messages_' before generating an answer.",
      );
    }

    try {
      const chat_history = state.messages_;
      const documents = state.documents;
      const rephrased_question = state.rephrased_question;

      const rag_prompt = ChatPromptTemplate.fromTemplate(RAG_TEMPLATE);
      const rag_chain = rag_prompt.pipe(this.llm);

      const response = await rag_chain.invoke({
        chat_history: chat_history,
        context: documents,
        question: rephrased_question,
      });

      const generation = response.text.trim();

      state.messages_.push(new AIMessage(generation));
      console.log(`generateAnswer: Generated response: ${generation}`);
    } catch (error) {
      console.error(`Error generating answer: ${error}`);
      state.messages_.push(
        new AIMessage(
          "I'm sorry, I encountered a problem while generating an answer. Please try again.",
        ),
      );
    }

    return state;
  }

  async cannotAnswer(
    state: typeof AgentState.State,
  ): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering cannotAnswer");

    if (!state.messages_) {
      state.messages_ = [];
    }

    state.messages_.push(
      new AIMessage(
        "I'm sorry, but I cannot find the information you're looking for.",
      ),
    );

    return state;
  }
}