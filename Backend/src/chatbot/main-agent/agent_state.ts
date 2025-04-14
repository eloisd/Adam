import { 
    BaseMessage, 
    HumanMessage, 
    AIMessage, 
    SystemMessage 
  } from 'langchain/schema/messages';
  import { Document } from 'langchain/document';
  
  /**
   * Interface pour l'état de l'agent du chatbot.
   * Cette interface définit la structure des données maintenues par l'agent pendant les conversations.
   */
  export interface AgentState {
    /** Liste des messages dans l'historique de conversation */
    messages_: Array<BaseMessage>;
    
    /** Séquence de messages avec capacité d'ajout */
    messages: Array<BaseMessage>; // Note: L'annotation Annotated avec add_messages n'a pas d'équivalent direct en TypeScript
    
    /** Documents récupérés ou fournis à l'agent */
    documents: Array<Document>;
    
    /** Sujet identifié comme pertinent pour la conversation */
    related_subject: string;
    
    /** Contenu associé au sujet pertinent */
    related_subject_content: string;
    
    /** Langue utilisée dans la conversation */
    language: string;
    
    /** Thème principal de la conversation */
    topic: string;
    
    /** Chemin vers le fichier texte associé */
    path_txt: string;
    
    /** Liste des sujets disponibles */
    subject: Array<string>;
    
    /** Outil utilisé par l'agent */
    tool_used: string;
    
    /** Question reformulée par l'agent */
    rephrased_question: string;
    
    /** Indique si l'agent doit procéder à la génération de contenu */
    proceed_to_generate: boolean;
    
    /** Compteur de reformulations effectuées */
    rephrase_count: number;
    
    /** Question originale de l'utilisateur */
    question: HumanMessage;
  }
  
  /**
   * Fonction utilitaire pour créer un état initial de l'agent.
   * @returns Un nouvel état d'agent avec des valeurs par défaut
   */
  export function createInitialAgentState(): AgentState {
    return {
      messages_: [],
      messages: [],
      documents: [],
      related_subject: "",
      related_subject_content: "",
      language: "fr", // Valeur par défaut: français
      topic: "",
      path_txt: "",
      subject: [],
      tool_used: "",
      rephrased_question: "",
      proceed_to_generate: false,
      rephrase_count: 0,
      question: new HumanMessage("")
    };
  }
  
  /**
   * Type pour les fonctions qui mettent à jour l'état de l'agent.
   * Équivalent TypeScript des "outils" langchain.
   */
  export type AgentStateUpdater = (state: AgentState) => Promise<AgentState> | AgentState;