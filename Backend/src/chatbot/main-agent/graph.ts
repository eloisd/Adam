import { Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CompiledGraph, END, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ConfigService } from "@nestjs/config";
import { RagSService } from "./rag";
import { McqService } from "./mcq";
import { QaService } from "./qa";
import { AboutChatbotService } from "./about_chatbot";
import { ToolsManagerService } from "./tools_manager";
import { AgentState } from "./agent_state";

@Injectable()
export class GraphService implements OnModuleInit {
  private graph: CompiledGraph<any>;
  private llm: ChatOpenAI;

  constructor(
    private configService: ConfigService,
    private ragService: RagSService,
    private mcqService: McqService,
    private qaService: QaService,
    private aboutChatbotService: AboutChatbotService,
    private toolsManagerService: ToolsManagerService,
  ) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: this.configService.get<string>("OPENAI_API_KEY"),
    });
  }

  onModuleInit() {
    this.graph = this.createGraph();
  }

  /**
   * Rewrites the user question and resets the state
   * @param state Current agent state
   * @returns Updated state
   */
  async questionRewriter(
    state: typeof AgentState.State,
  ): Promise<Partial<typeof AgentState.State>> {
    console.log(
      `Entering questionRewriter with following state: ${JSON.stringify(state)}`,
    );

    // Reset state variables except 'question' and 'messages_'
    state.documents = [];
    state.related_subject = "";
    state.related_subject_content = "";
    state.language = "French";
    state.topic = "Deeplearning";
    state.path_txt =
      this.configService.get<string>("PATH_TXT") || "../../data_txt";
    state.subject = [];
    state.tool_used = "";
    state.rephrased_question = "";
    state.proceed_to_generate = false;
    state.rephrase_count = 0;

    // Read available subjects from directory
    try {
      const files = fs.readdirSync(state.path_txt);
      for (const filename of files) {
        if (filename.toLowerCase().endsWith(".txt")) {
          state.subject.push(path.parse(filename).name);
        }
      }
    } catch (error) {
      console.error(`Error reading directory: ${error}`);
    }

    // Initialize message lists if they don't exist
    if (!state.messages_ || !Array.isArray(state.messages_)) {
      state.messages_ = [];
    }
    if (!state.messages || !Array.isArray(state.messages)) {
      state.messages = [];
    }

    // Add the current question to messages if not already included
    if (!state.messages_.some((msg) => msg === state.question)) {
      state.messages_.push(state.question);
    }
    if (!state.messages.some((msg) => msg === state.question)) {
      state.messages.push(state.question);
    }

    // If we have a conversation history, rephrase the question
    try {
      if (state.messages_.length > 1) {
        const conversation = state.messages_.slice(0, -1);

        const messages = [
          new SystemMessage(
            "You are a helpful assistant that rephrases the user's question to be a standalone question optimized for retrieval. And give just this rephrased question as answer.",
          ),
        ];

        messages.push(...conversation);
        messages.push(state.question);

        const rephrase_prompt = ChatPromptTemplate.fromMessages(messages);

        const promptMessages = await rephrase_prompt.formatMessages({});
        const response = await this.llm.invoke(promptMessages);
        const better_question = response.text.trim();

        console.log(`questionRewriter: Rephrased question: ${better_question}`);
        state.rephrased_question = better_question;
      } else {
        state.rephrased_question = state.question.text;
      }
    } catch (error) {
      console.error(`Error in question rephrasing: ${error}`);
      state.rephrased_question = state.question.text;
    }

    return state;
  }

  /**
   * Creates and configures the workflow graph for the chatbot
   * @returns The compiled graph
   */
  createGraph() {
    const checkpointer_rag = new MemorySaver();
    const tool_node = new ToolNode(this.toolsManagerService.getTools());

    const workflow_rag = new StateGraph(AgentState)
      // Add nodes
      .addNode("question_rewriter", this.questionRewriter.bind(this))
      .addNode(
        "off_topic_response",
        this.toolsManagerService.offTopicResponse.bind(
          this.toolsManagerService,
        ),
      )
      .addNode(
        "about_chatbot",
        this.aboutChatbotService.aboutChatbot.bind(this.aboutChatbotService),
      )
      .addNode(
        "agent",
        this.toolsManagerService.agent.bind(this.toolsManagerService),
      )
      .addNode("tools", tool_node)

      .addNode("retrieve", this.ragService.retrieve.bind(this.ragService))
      .addNode(
        "retrieval_grader",
        this.ragService.retrievalGrader.bind(this.ragService),
      )
      .addNode(
        "generate_answer",
        this.ragService.generateAnswer.bind(this.ragService),
      )
      .addNode(
        "refine_question",
        this.ragService.refineQuestion.bind(this.ragService),
      )
      .addNode(
        "cannot_answer",
        this.ragService.cannotAnswer.bind(this.ragService),
      )

      .addNode(
        "find_relevant_docs",
        this.toolsManagerService.findRelevantDocs.bind(
          this.toolsManagerService,
        ),
      )
      .addNode(
        "generate_mcq",
        this.mcqService.generateMcq.bind(this.mcqService),
      )
      .addNode("generate_qa", this.qaService.generateQa.bind(this.qaService));

    // Add edges
    workflow_rag.addEdge(START, "question_rewriter");
    workflow_rag.addEdge("question_rewriter", "agent");
    workflow_rag.addEdge("agent", "tools");
    workflow_rag.addConditionalEdges(
      "tools",
      this.toolsManagerService.toolRouter.bind(this.toolsManagerService),
      {
        retrieve: "retrieve",
        find_relevant_docs: "find_relevant_docs",
        off_topic_response: "off_topic_response",
        about_chatbot: "about_chatbot",
        END: END,
      },
    );

    workflow_rag.addEdge("retrieve", "retrieval_grader");
    workflow_rag.addConditionalEdges(
      "retrieval_grader",
      this.ragService.proceedRouter.bind(this.ragService),
      {
        generate_answer: "generate_answer",
        cannot_answer: "cannot_answer",
        refine_question: "refine_question",
      },
    );
    workflow_rag.addEdge("refine_question", "retrieve");
    workflow_rag.addEdge("generate_answer", END);
    workflow_rag.addEdge("cannot_answer", END);

    workflow_rag.addConditionalEdges(
      "find_relevant_docs",
      this.toolsManagerService.exerciseRouter.bind(this.toolsManagerService),
      {
        generate_mcq: "generate_mcq",
        generate_qa: "generate_qa",
      },
    );
    workflow_rag.addEdge("generate_mcq", END);
    workflow_rag.addEdge("generate_qa", END);

    workflow_rag.addEdge("about_chatbot", END);
    workflow_rag.addEdge("off_topic_response", END);

    return workflow_rag.compile({ checkpointer: checkpointer_rag });
  }

  /**
   * Processes a user query through the chatbot graph
   * @param question The user's question
   * @param topic_id
   * @returns The result of processing the question
   */
  async processQuery(question: string, topic_id: string) {
    try {
      const input_data = {
        question: new HumanMessage(question),
      };

      return this.graph.invoke(input_data, {
        configurable: { thread_id: topic_id },
      });
    } catch (error) {
      console.error("Error processing query:", error);
      throw error;
    }
  }
}