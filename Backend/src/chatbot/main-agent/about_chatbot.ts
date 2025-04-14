/**
 * Module pour gérer les questions relatives au chatbot Adam
 */

import dotenv from 'dotenv';
dotenv.config();

import { ChatPromptTemplate } from 'langchain/prompts';
import { AIMessage } from 'langchain/schema/messages';
import { ChatOpenAI } from 'langchain/chat_models/openai';

import { ADAM_PRESENTATION, ABOUT_ADAM_ANSWER_TEMPLATE } from './prompt';
import { AgentState } from './agentState';

/**
 * Gère les questions relatives au chatbot ou à Adam.
 * @param state État actuel de l'agent
 * @returns État mis à jour avec la réponse sur Adam
 */
export async function about_chatbot(state: AgentState): Promise<AgentState> {
  console.log("Entering about_chatbot");
  
  // Mise à jour de l'outil utilisé
  state.tool_used = state.messages[state.messages.length - 1]?.name || "";
  
  // Initialisation du modèle LLM
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });
  
  // Récupération des paramètres nécessaires
  const language = state.language;
  const rephrased_question = state.rephrased_question;
  
  // S'assurer que messages_ existe
  if (!state.messages_ || !Array.isArray(state.messages_)) {
    state.messages_ = [];
  }
  
  // Création du template de prompt et chaînage avec le LLM
  const about_adam_answer_prompt = ChatPromptTemplate.fromTemplate(ABOUT_ADAM_ANSWER_TEMPLATE);
  
  try {
    // Invoquer le LLM avec le prompt et les paramètres
    const response = await llm.invoke(
      await about_adam_answer_prompt.formatMessages({
        adam_presentation: ADAM_PRESENTATION, 
        question: rephrased_question, 
        language: language
      })
    );
    
    // Extraire le contenu de la réponse
    const answer_about_adam = response.content.trim();
    
    // Ajouter la réponse aux messages
    state.messages_.push(new AIMessage(answer_about_adam));
    
    console.log(`about_chatbot: Generated response: ${answer_about_adam}`);
  } catch (error) {
    console.error(`Error generating response about Adam: ${error}`);
    
    // En cas d'erreur, fournir une réponse par défaut
    const default_response = "Je suis ADAM, votre Adaptive Digital Academic Mentor. Je suis ici pour vous aider à apprendre, réviser et comprendre vos cours.";
    state.messages_.push(new AIMessage(default_response));
    
    console.log(`about_chatbot: Using default response due to error`);
  }
  
  return state;
}

// Exporter la fonction par défaut pour une utilisation plus facile
export default about_chatbot;