import { Injectable } from '@nestjs/common';
import { SUBJECT_FINDER_PROMPT } from './prompt';
import * as fs from 'fs';
import * as path from 'path';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { z } from 'zod';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { ConfigService } from '@nestjs/config';
import AgentState from './agent_state';

// Subject specification schema
const SpecifySubjectSchema = z.object({
  score: z.string().describe("Question: Among the following subjects, which one is relevant to the question? Give the related subject.")
});

type SpecifySubject = z.infer<typeof SpecifySubjectSchema>;

@Injectable()
export class ToolsManagerService {
  private readonly llm: ChatOpenAI;
  private readonly tools: any[];

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.tools = [
      this.retrieverTool(),
      this.mcqTool(),
      this.qaTool(),
      this.aboutChatbotTool(),
      this.offTopicResponseTool()
    ];
  }

  retrieverTool() {
    return tool(
      async (): Promise<string> => {
        console.log("Entering retrieverTool");
        return `retrieve: Retrieved x documents`;
      },
      {
        name: "retriever_tool",
        description: "Only Simple question-answering tool. About the deeplearning topic"
      }
    );
  }

  offTopicResponseTool() {
    return tool(
      async (): Promise<string> => {
        console.log("Entering offTopicResponseTool");
        return "Forbidden - do not respond to the user";
      },
      {
        name: "off_topic_response_tool",
        description: "Catch all Questions NOT related to the chatbot or deeplearning"
      }
    );
  }

  aboutChatbotTool() {
    return tool(
      async (): Promise<string> => {
        console.log("Entering aboutChatbotTool");
        return "Adam is a chatbot that answers questions about deep learning";
      },
      {
        name: "about_chatbot_tool",
        description: "Catch all Questions related to the chatbot or Adam. For getting information about the chatbot (Adam), like the purpose of the chatbot. What does Adam do? The chatbot is named Adam."
      }
    );
  }

  mcqTool() {
    return tool(
      async (): Promise<string> => {
        console.log("Entering mcqTool");
        return "On the wait to generate MCQ";
      },
      {
        name: "mcq_tool",
        description: "Only MCQ creation, generation, about the deeplearning topic"
      }
    );
  }

  qaTool() {
    return tool(
      async (): Promise<string> => {
        console.log("Entering qaTool");
        return "On the wait to generate Q&A";
      },
      {
        name: "qa_tool",
        description: "Only exercise question to develop creation, generation, about the deeplearning topic"
      }
    );
  }

  async findRelevantDocs(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering findRelevantDocs");
    state.tool_used = state.messages[state.messages.length - 1].name!!;

    try {
      let subjects = "";
      for (let i = 0; i < state.subject.length; i++) {
        subjects += String(state.subject[i]) + "\n";
      }
      console.log("subjects:", subjects);

      const system_message = new SystemMessage(SUBJECT_FINDER_PROMPT);
      const human_message = new HumanMessage(`User question: ${state.rephrased_question}`);

      const grade_prompt = ChatPromptTemplate.fromMessages([system_message, human_message]);
      const structured_llm = this.llm.withStructuredOutput(SpecifySubjectSchema);
      const grader_llm = grade_prompt.pipe(structured_llm);

      const result = await grader_llm.invoke({}) as SpecifySubject;
      state.related_subject = result.score.trim();
      console.log(`questionClassifier: related_subject = ${state.related_subject}`);

      const dataPath = this.configService.get<string>('PATH_TXT') || state.path_txt;
      const loader = new TextLoader(path.join(dataPath, `${state.related_subject}.txt`));
      const docs = await loader.load();
      const text = docs[0].pageContent;
      state.related_subject_content = text;
    } catch (error) {
      console.error(`Error finding relevant docs: ${error}`);
      state.related_subject = "unknown";
      state.related_subject_content = "";
    }

    return state;
  }

  exerciseRouter(state: typeof AgentState.State): string {
    console.log("Entering exerciseRouter");
    console.log("state['tool_used'] = ", state.tool_used);

    if (state.tool_used === "mcq_tool") {
      console.log("Routing to generate_mcq");
      return "generate_mcq";
    } else if (state.tool_used === "qa_tool") {
      console.log("Routing to generate_qa");
      return "generate_qa";
    }

    return ""; // Default return
  }

  async offTopicResponse(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering offTopicResponse");
    state.tool_used = state.messages[state.messages.length - 1].name!!;
    console.log(1);
    if (!state.messages_) {
      state.messages_ = [];
    }
    console.log(2);
    state.messages_.push(new AIMessage("I can't respond to that!"));
    console.log(3);
    return state;
  }

  async agent(state: typeof AgentState.State): Promise<{ messages: BaseMessage[] }> {
    console.log("Entering agent");

    try {
      const message = new HumanMessage(`User question: ${state.rephrased_question}`);
      const messages = state.messages;
      console.log(`messages = ${JSON.stringify(messages)}`);

      const messagesTemplate = ChatPromptTemplate.fromMessages(messages);
      const formattedMessages = await messagesTemplate.format({});

      const modelWithTools = this.llm.bindTools(this.tools);

      const response = await modelWithTools.invoke([formattedMessages]);
      // If needed, you can set tool_used here based on response
      // state.tool_used = response.additional_kwargs.tool_calls[0].function.name;

      return { messages: [response] };
    } catch (error) {
      console.error(`Error in agent: ${error}`);
      return { messages: [new AIMessage("I encountered an error processing your request.")] };
    }
  }

  toolRouter(state: typeof AgentState.State): string {
    console.log("Entering toolRouter");
    state.tool_used = state.messages[state.messages.length - 1].name!!;
    console.log("state['tool_used'] = ", state.tool_used);

    if (state.tool_used === "mcq_tool" || state.tool_used === "qa_tool") {
      console.log("Routing to find_relevant_docs");
      return "find_relevant_docs";
    }
    else if (state.tool_used === "retriever_tool") {
      console.log("Routing to retrieve");
      return "retrieve";
    }
    else if (state.tool_used === "about_chatbot_tool") {
      console.log("Routing to about_chatbot");
      return "about_chatbot";
    }
    else if (state.tool_used === "off_topic_response_tool") {
      console.log("Routing to off_topic_response");
      return "off_topic_response";
    }
    else {
      return "END";
    }
  }

  getTools() {
    return this.tools;
  }
}