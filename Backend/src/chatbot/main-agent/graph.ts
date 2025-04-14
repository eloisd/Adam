/**
 * Ce module implémente le workflow du graphe pour le chatbot Adam.
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  BaseMessage, 
  HumanMessage, 
  AIMessage, 
  SystemMessage 
} from 'langchain/schema/messages';
import { Document } from 'langchain/document';
import { StateGraph, START, END } from 'langgraph/graph';
import { MemorySaver } from 'langgraph/checkpoint/memory';
import { ToolNode } from 'langgraph/prebuilt';
import { ChatPromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';

import { AgentState } from './agentState';
import { 
  retrieve, 
  retrieval_grader, 
  proceed_router, 
  generate_answer, 
  refine_question, 
  cannot_answer 
} from './rag';
import { generate_mcq } from './mcq';
import { generate_qa } from './qa';
import { about_chatbot } from './about_chatbot';
import { 
  agent, 
  TOOLS, 
  tool_router, 
  find_relevant_docs, 
  exercise_router, 
  off_topic_response 
} from './tools_manager';

/**
 * Reformule la question de l'utilisateur et réinitialise l'état
 * @param state État actuel de l'agent
 * @returns État mis à jour
 */
export function question_rewriter(state: AgentState): AgentState {
  console.log(`Entering question_rewriter with following state: ${JSON.stringify(state)}`);

  // Réinitialisation des variables d'état sauf 'question' et 'messages_'
  state.documents = [];
  state.related_subject = "";
  state.related_subject_content = "";
  state.language = "French";
  state.topic = "Deeplearning";
  state.path_txt = "../../data_txt";
  state.subject = [];
  state.tool_used = "";
  state.rephrased_question = "";
  state.proceed_to_generate = false;
  state.rephrase_count = 0;
  
  // Lecture des sujets disponibles à partir du répertoire
  try {
    const files = fs.readdirSync(state.path_txt);
    for (const filename of files) {
      if (filename.toLowerCase().endsWith('.txt')) {
        state.subject.push(path.parse(filename).name);
      }
    }
  } catch (error) {
    console.error(`Error reading directory: ${error}`);
  }
  
  // Initialisation des listes de messages si elles n'existent pas
  if (!state.messages_ || !Array.isArray(state.messages_)) {
    state.messages_ = [];
  }
  if (!state.messages || !Array.isArray(state.messages)) {
    state.messages = [];
  }
  
  // Ajout de la question actuelle aux messages s'ils n'existent pas déjà
  if (!state.messages_.includes(state.question)) {
    state.messages_.push(state.question);
  }
  if (!state.messages.includes(state.question)) {
    state.messages.push(state.question);
  }

  // Si nous avons un historique de conversation, reformuler la question
  if (state.messages_.length > 1) {
    const conversation = state.messages_.slice(0, -1);
    const current_question = state.question.content;
    
    const messages = [
      new SystemMessage(
        "You are a helpful assistant that rephrases the user's question to be a standalone question optimized for retrieval. And give just this rephrased question as answer."
      )
    ];
    
    messages.push(...conversation);
    messages.push(new HumanMessage(current_question));
    
    const rephrase_prompt = ChatPromptTemplate.fromMessages(messages);
    const llm = new ChatOpenAI({ modelName: "gpt-4o-mini" });
    
    // Ce code est asynchrone en TypeScript, mais comme la fonction Python est synchrone,
    // nous simulons ici un comportement synchrone
    // Dans un vrai code TypeScript, vous devriez utiliser async/await
    llm.invoke(rephrase_prompt.format({}))
      .then(response => {
        const better_question = response.content.trim();
        console.log(`question_rewriter: Rephrased question: ${better_question}`);
        state.rephrased_question = better_question;
      })
      .catch(error => {
        console.error(`Error in question rephrasing: ${error}`);
        state.rephrased_question = state.question.content;
      });
  } else {
    state.rephrased_question = state.question.content;
  }
  
  return state;
}

/**
 * Crée et configure le graphe de workflow pour le chatbot
 * @returns Le graphe compilé
 */
export function createGraph() {
  const checkpointer_rag = new MemorySaver();
  const workflow_rag = new StateGraph(AgentState);
  const tool_node = new ToolNode(TOOLS);

  // Ajout des nœuds
  workflow_rag.addNode("question_rewriter", question_rewriter);
  workflow_rag.addNode("off_topic_response", off_topic_response);
  workflow_rag.addNode("about_chatbot", about_chatbot);
  workflow_rag.addNode("agent", agent);
  workflow_rag.addNode("tools", tool_node);

  workflow_rag.addNode("retrieve", retrieve);
  workflow_rag.addNode("retrieval_grader", retrieval_grader);
  workflow_rag.addNode("generate_answer", generate_answer);
  workflow_rag.addNode("refine_question", refine_question);
  workflow_rag.addNode("cannot_answer", cannot_answer);

  workflow_rag.addNode("find_relevant_docs", find_relevant_docs);
  workflow_rag.addNode("generate_mcq", generate_mcq);
  workflow_rag.addNode("generate_qa", generate_qa);

  // Ajout des arêtes
  workflow_rag.addEdge(START, "question_rewriter");
  workflow_rag.addEdge("question_rewriter", "agent");
  workflow_rag.addEdge("agent", "tools");
  workflow_rag.addConditionalEdges(
    "tools",
    tool_router,
    {
      "retrieve": "retrieve",
      "find_relevant_docs": "find_relevant_docs",
      "off_topic_response": "off_topic_response",
      "about_chatbot": "about_chatbot",
      "END": END
    }
  );

  workflow_rag.addEdge("retrieve", "retrieval_grader");
  workflow_rag.addConditionalEdges(
    "retrieval_grader",
    proceed_router,
    {
      "generate_answer": "generate_answer",
      "cannot_answer": "cannot_answer",
      "refine_question": "refine_question",
    },
  );
  workflow_rag.addEdge("refine_question", "retrieve");
  workflow_rag.addEdge("generate_answer", END);
  workflow_rag.addEdge("cannot_answer", END);

  workflow_rag.addConditionalEdges(
    "find_relevant_docs",
    exercise_router,
    {
      "generate_mcq": "generate_mcq",
      "generate_qa": "generate_qa",
    },
  );
  workflow_rag.addEdge("generate_mcq", END);
  workflow_rag.addEdge("generate_qa", END);

  workflow_rag.addEdge("about_chatbot", END);
  workflow_rag.addEdge("off_topic_response", END);
  workflow_rag.setEntryPoint("question_rewriter");
  
  const graph = workflow_rag.compile({ checkpointer: checkpointer_rag });

  return graph;
}

// Code pour exécuter le graphe si ce fichier est exécuté directement
if (require.main === module) {
  const graph = createGraph();
  
  // Exemple d'invocation du graphe avec une question
  const memory_content_1_rag = "Qu'est-ce que le graph neural network GNN?";
  const input_data = { 
    question: new HumanMessage(memory_content_1_rag) 
  };
  
  graph.invoke(input_data, { 
    configurable: { thread_id: "5" } 
  }).then(result => {
    console.log("Result:", result);
  }).catch(error => {
    console.error("Error:", error);
  });

  /*
  // Autres exemples d'utilisation (commentés)
  
  // Q&A query
  const qa_query = "Make me an question to develop about pooling in CNN?";
  const qa_input = { question: new HumanMessage(qa_query) };
  graph.invoke(qa_input, { configurable: { thread_id: "1" }});

  // MCQ query
  const mcq_query = "Make me an mcq about perceptron?";
  const mcq_input = { question: new HumanMessage(mcq_query) };
  graph.invoke(mcq_input, { configurable: { thread_id: "2" }});

  // Off topic query
  const off_topic_content_rag = "How is the weather?";
  const off_topic_input = { question: new HumanMessage(off_topic_content_rag) };
  graph.invoke(off_topic_input, { configurable: { thread_id: "3" }});

  // No relevant docs found
  const no_docs_cotent_rag = "In the feald of GNN, What is deepGCN?";
  const no_docs_input = { question: new HumanMessage(no_docs_cotent_rag) };
  graph.invoke(no_docs_input, { configurable: { thread_id: "4" }});

  // Memory follow-up
  const memory_content_2_rag = "Can you give me a use case of it?";
  const memory_input_2 = { question: new HumanMessage(memory_content_2_rag) };
  graph.invoke(memory_input_2, { configurable: { thread_id: "5" }});

  // About chatbot query
  const about_chatbot_query = "Hi Adam, what do tou do?";
  const about_input = { question: new HumanMessage(about_chatbot_query) };
  graph.invoke(about_input, { configurable: { thread_id: "3" }});
  */
}