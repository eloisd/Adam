import { Annotation } from "@langchain/langgraph";
import { 
  BaseMessage, 
  HumanMessage, 
  AIMessage, 
  SystemMessage 
} from "langchain/schema/messages";
import { Document as DocumentInterface } from "langchain/document";

/**
 * Définit l'état de l'agent du chatbot avec les annotations LangGraph
 */
export const AgentState = Annotation.Root({
  // Liste des messages dans l'historique complet de la conversation
  messages_: Annotation<BaseMessage[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  
  // Liste des messages avec capacité d'ajout (similaire à add_messages en Python)
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => {
      // Si y est défini, on le prend, sinon on garde x ou on initialise un tableau vide
      if (y) return y;
      if (x) return x;
      return [];
    }
  }),
  
  // Documents récupérés ou fournis à l'agent
  documents: Annotation<DocumentInterface[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  
  // Sujet identifié comme pertinent pour la conversation
  related_subject: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  
  // Contenu associé au sujet pertinent
  related_subject_content: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  
  // Langue utilisée dans la conversation
  language: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "French",
  }),
  
  // Thème principal de la conversation
  topic: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "Deeplearning",
  }),
  
  // Chemin vers le fichier texte associé
  path_txt: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "../../data_txt",
  }),
  
  // Liste des sujets disponibles
  subject: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  
  // Outil utilisé par l'agent
  tool_used: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  
  // Question reformulée par l'agent
  rephrased_question: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  
  // Indique si l'agent doit procéder à la génération de contenu
  proceed_to_generate: Annotation<boolean>({
    reducer: (x, y) => y ?? x ?? false,
  }),
  
  // Compteur de reformulations effectuées
  rephrase_count: Annotation<number>({
    reducer: (x, y) => y ?? x ?? 0,
  }),
  
  // Question originale de l'utilisateur
  question: Annotation<HumanMessage>({
    reducer: (x, y) => y ?? x ?? new HumanMessage(""),
  }),
});

// Type pour représenter l'état de l'agent
export type AgentStateType = typeof AgentState.T;

/**
 * Fonction utilitaire pour créer un état initial de l'agent
 * @returns Un nouvel état d'agent avec des valeurs par défaut
 */
export function createInitialAgentState(): AgentStateType {
  return {
    messages_: [],
    messages: [],
    documents: [],
    related_subject: "",
    related_subject_content: "",
    language: "French",
    topic: "Deeplearning",
    path_txt: "../../data_txt",
    subject: [],
    tool_used: "",
    rephrased_question: "",
    proceed_to_generate: false,
    rephrase_count: 0,
    question: new HumanMessage("")
  };
}

/**
 * Type pour les fonctions qui mettent à jour l'état de l'agent
 */
export type AgentStateUpdater = (
  state: AgentStateType
) => Promise<AgentStateType> | AgentStateType;

// Export par défaut pour faciliter l'utilisation
export default AgentState;