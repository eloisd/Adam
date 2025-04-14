/**
 * Module pour la génération de questionnaires à choix multiples (QCM)
 */

import dotenv from 'dotenv';
dotenv.config();

import { ChatPromptTemplate } from 'langchain/prompts';
import { AIMessage } from 'langchain/schema/messages';
import { ChatOpenAI } from 'langchain/chat_models/openai';

import { 
  MCQ_GENERATOR_TEMPLATE, 
  MCQ_EVALUATION_TEMPLATE, 
  RESPONSE_JSON_MCQ 
} from './prompt';
import { AgentState } from './agentState';

/**
 * Génère un QCM basé sur le contenu du sujet et évalue sa qualité
 * @param state État actuel de l'agent
 * @returns État mis à jour avec le QCM généré et son évaluation
 */
export async function generate_mcq(state: AgentState): Promise<AgentState> {
  console.log("Entering generate_mcq");
  
  // Extraction des données de l'état
  const text = state.related_subject_content;
  const number = 3;
  const tone = "difficult";
  const subject = state.related_subject;
  const rephrased_question = state.rephrased_question;
  const language = state.language;
  
  // Initialisation du modèle LLM
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });
  
  // Préparation des templates de prompts
  const quiz_generator_prompt = ChatPromptTemplate.fromTemplate(MCQ_GENERATOR_TEMPLATE);
  const quiz_evaluation_prompt = ChatPromptTemplate.fromTemplate(MCQ_EVALUATION_TEMPLATE);
  
  try {
    // Génération du QCM
    const mcq_response = await llm.invoke(
      await quiz_generator_prompt.formatMessages({
        text: text, 
        number: number, 
        tone: tone, 
        subject: subject, 
        response_json: JSON.stringify(RESPONSE_JSON_MCQ), 
        question: rephrased_question, 
        language: language
      })
    );
    
    const generated_mcq = mcq_response.content.trim();
    
    // Ajout du QCM aux messages
    if (!state.messages_ || !Array.isArray(state.messages_)) {
      state.messages_ = [];
    }
    state.messages_.push(new AIMessage(generated_mcq));

    // Évaluation du QCM généré
    const review_response = await llm.invoke(
      await quiz_evaluation_prompt.formatMessages({
        tone: tone, 
        subject: subject, 
        quiz: generated_mcq, 
        language: language
      })
    );
    
    const generated_review = review_response.content.trim();
    
    // Ajout de l'évaluation aux messages
    state.messages_.push(new AIMessage(generated_review));

    console.log(`generate_mcq: rephrased_question: ${state.rephrased_question}`);
    console.log(`generate_mcq: Generated response: ${generated_mcq}`);
    console.log(`generate_mcq: Generated review: ${generated_review}`);
  } catch (error) {
    console.error(`Error generating MCQ: ${error}`);
    
    // En cas d'erreur, fournir un message par défaut
    if (!state.messages_ || !Array.isArray(state.messages_)) {
      state.messages_ = [];
    }
    state.messages_.push(new AIMessage(
      "Je n'ai pas pu générer un QCM pour le moment. Veuillez réessayer ultérieurement."
    ));
  }
  
  return state;
}

// Exporter la fonction par défaut pour une utilisation plus facile
export default generate_mcq;