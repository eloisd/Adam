"""
This module implements the graph workflow for the Adam chatbot.
"""
from typing import List, Dict, Any, TypedDict, Sequence, Annotated, Literal, Optional, Union
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from langchain.schema import Document
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from tools_manager import ToolsManager
from prompt import QUESTION_REFINER_PROMPT, DOCUMENT_GRADER_PROMPT

class AgentState(TypedDict):
    """
    State definition for the agent workflow.
    """
    messages_: List[BaseMessage]
    messages: Annotated[Sequence[BaseMessage], add_messages]
    documents: List[Document]
    related_subject: str
    related_subject_content: str
    language: str
    topic: str
    path_txt: str
    subject: List[str]
    tool_used: str
    rephrased_question: str
    proceed_to_generate: bool
    rephrase_count: int
    question: HumanMessage

class GradeDocument(BaseModel):
    """
    Model for document grading results.
    """
    score: str = Field(
        description="Document is relevant to the question? If yes -> 'Yes' if not -> 'No'"
    )

class ChatbotGraph:
    """
    Main class for constructing and managing the chatbot workflow graph.
    """
    
    def __init__(
        self,
        tools_manager: ToolsManager,
        rag_model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        data_dir: str = "../data_txt"
    ):
        """
        Initialize the chatbot graph.
        
        Args:
            tools_manager: Manager for tools
            rag_model: Model for RAG and other operations
            temperature: Temperature for generation
            data_dir: Directory containing text data
        """
        self.tools_manager = tools_manager
        self.rag_model = rag_model
        self.temperature = temperature
        self.data_dir = data_dir
        self.llm = ChatOpenAI(model=rag_model, temperature=temperature)
        
        # Create the graph
        self.workflow = self._create_workflow()
        self.checkpointer = MemorySaver()
        self.graph = self.workflow.compile(checkpointer=self.checkpointer)
    
    def _create_workflow(self) -> StateGraph:
        """
        Create the workflow graph.
        
        Returns:
            The workflow graph
        """
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("question_rewriter", self.question_rewriter)
        workflow.add_node("off_topic_response", self.off_topic_response)
        workflow.add_node("about_chatbot", self.tools_manager.about_chatbot)
        workflow.add_node("agent", self.tools_manager.agent)
        workflow.add_node("tools", self.tools_manager.tool_node)
        
        workflow.add_node("retrieve", self.retrieve)
        workflow.add_node("retrieval_grader", self.retrieval_grader)
        workflow.add_node("generate_answer", self.generate_answer)
        workflow.add_node("refine_question", self.refine_question)
        workflow.add_node("cannot_answer", self.cannot_answer)
        
        workflow.add_node("find_relevant_docs", self.tools_manager.find_relevant_docs)
        workflow.add_node("generate_mcq", self.tools_manager.generate_mcq)
        workflow.add_node("generate_qa", self.tools_manager.generate_qa)
        
        # Add edges
        workflow.add_edge("question_rewriter", "agent")
        workflow.add_edge("agent", "tools")
        
        workflow.add_conditional_edges(
            "tools", 
            self.tools_manager.tool_router,
            {
                "retrieve": "retrieve", 
                "find_relevant_docs": "find_relevant_docs",
                "off_topic_response": "off_topic_response",
                "about_chatbot": "about_chatbot",
                "END": END
            }
        )
        
        # Retrieve for simple questions
        workflow.add_edge("retrieve", "retrieval_grader")
        workflow.add_conditional_edges(
            "retrieval_grader",
            self.proceed_router,
            {
                "generate_answer": "generate_answer",
                "cannot_answer": "cannot_answer",
                "refine_question": "refine_question",
            },
        )
        workflow.add_edge("refine_question", "retrieve")
        workflow.add_edge("generate_answer", END)
        workflow.add_edge("cannot_answer", END)
        
        # Exercise generation
        workflow.add_conditional_edges(
            "find_relevant_docs",
            self.tools_manager.exercise_router,
            {
                "generate_mcq": "generate_mcq",
                "generate_qa": "generate_qa",
            },
        )
        workflow.add_edge("generate_mcq", END)
        workflow.add_edge("generate_qa", END)
        
        # Other paths
        workflow.add_edge("about_chatbot", END)
        workflow.add_edge("off_topic_response", END)
        
        # Set entry point
        workflow.set_entry_point("question_rewriter")
        
        return workflow
    
    def question_rewriter(self, state: AgentState) -> AgentState:
        """
        Rewrite or clean up the user's question.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with rewritten question
        """
        # Reset state variables except for 'question' and 'messages_'
        state["documents"] = []
        state["related_subject"] = ""
        state["related_subject_content"] = ""
        state["language"] = "French"
        state["topic"] = "Deeplearning"
        state["path_txt"] = "../data_txt"
        state["subject"] = []
        state["tool_used"] = ""
        state["rephrased_question"] = ""
        state["proceed_to_generate"] = False
        state["rephrase_count"] = 0
        
        # Initialize subjects list from the data directory
        import os
        for filename in os.listdir(state["path_txt"]):
            if filename.lower().endswith('.txt'):
                state["subject"].append(os.path.splitext(filename)[0])
        
        # Initialize message history if it doesn't exist
        if "messages_" not in state or state["messages_"] is None:
            state["messages_"] = []
        if "messages" not in state or state["messages"] is None:
            state["messages"] = []
        
        # Add current question to messages if not already there
        if state["question"] not in state["messages_"]:
            state["messages_"].append(state["question"])
        if state["question"] not in state["messages"]:
            state["messages"].append(state["question"])
        
        # Rephrase the question if there's conversation history
        if len(state["messages_"]) > 1:
            # Get conversation history excluding the current question
            conversation = state["messages_"][:-1]
            current_question = state["question"].content
            
            # Create system prompt for question rephrasing
            messages = [
                SystemMessage(
                    content="You are a helpful assistant that rephrases the user's question to be a standalone question optimized for retrieval. And give just this rephrased question as answer."
                )
            ]
            
            # Add conversation history
            messages.extend(conversation)
            
            # Add current question
            messages.append(HumanMessage(content=current_question))
            
            # Create and format prompt
            rephrase_prompt = ChatPromptTemplate.from_messages(messages)
            prompt = rephrase_prompt.format()
            
            # Get response
            response = self.llm.invoke(prompt)
            better_question = response.content.strip()
            
            # Update state
            state["rephrased_question"] = better_question
        else:
            # Use the original question if there's no conversation history
            state["rephrased_question"] = state["question"].content
        
        return state
    
    def retrieve(self, state: AgentState) -> AgentState:
        """
        Retrieve relevant documents based on the question.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with retrieved documents
        """
        # Update tool used in state
        state["tool_used"] = state["messages"][-1].name if "messages" in state and state["messages"] else ""
        
        # Retrieve documents
        if hasattr(self.tools_manager.rag, 'retriever') and self.tools_manager.rag.retriever:
            documents = self.tools_manager.rag.retriever.invoke(state["rephrased_question"])
            state["documents"] = documents
        else:
            state["documents"] = []
        
        return state
    
    def retrieval_grader(self, state: AgentState) -> AgentState:
        """
        Grade the relevance of retrieved documents.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with graded documents
        """
        # Create system message for document grading
        system_message = SystemMessage(content=DOCUMENT_GRADER_PROMPT)
        
        # Create structured output model
        structured_llm = self.llm.with_structured_output(GradeDocument)
        
        # Grade each document
        relevant_docs = []
        for doc in state["documents"]:
            # Create human message with question and document
            human_message = HumanMessage(
                content=f"User question: {state['rephrased_question']}\n\nRetrieved document:\n{doc.page_content}"
            )
            
            # Create and format prompt
            grade_prompt = ChatPromptTemplate.from_messages([system_message, human_message])
            grader_llm = grade_prompt | structured_llm
            
            # Get grading result
            result = grader_llm.invoke({})
            
            # Add to relevant docs if rated as relevant
            if result.score.strip().lower() == "yes":
                relevant_docs.append(doc)
        
        # Update state
        state["documents"] = relevant_docs
        state["proceed_to_generate"] = len(relevant_docs) > 0
        
        return state
    
    def proceed_router(self, state: AgentState) -> str:
        """
        Determine whether to generate an answer, refine the question, or give up.
        
        Args:
            state: Current state
            
        Returns:
            Next step to take
        """
        rephrase_count = state.get("rephrase_count", 0)
        
        if state.get("proceed_to_generate", False):
            return "generate_answer"
        elif rephrase_count >= 2:
            return "cannot_answer"
        else:
            return "refine_question"
    
    def refine_question(self, state: AgentState) -> AgentState:
        """
        Refine the question to improve retrieval results.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with refined question
        """
        # Check if max rephrase attempts reached
        rephrase_count = state.get("rephrase_count", 0)
        if rephrase_count >= 2:
            return state
        
        # Get the question to refine
        question_to_refine = state["rephrased_question"]
        
        # Create system message for question refinement
        system_message = SystemMessage(content=QUESTION_REFINER_PROMPT)
        
        # Create human message with the question to refine
        human_message = HumanMessage(
            content=f"Original question: {question_to_refine}\n\nProvide a slightly refined question."
        )
        
        # Create and format prompt
        refine_prompt = ChatPromptTemplate.from_messages([system_message, human_message])
        prompt = refine_prompt.format()
        
        # Get refined question
        response = self.llm.invoke(prompt)
        refined_question = response.content.strip()
        
        # Update state
        state["rephrased_question"] = refined_question
        state["rephrase_count"] = rephrase_count + 1
        
        return state
    
    def generate_answer(self, state: AgentState) -> AgentState:
        """
        Generate an answer based on retrieved documents.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with generated answer
        """
        # Ensure messages history exists
        if "messages_" not in state or state["messages_"] is None:
            raise ValueError("State must include 'messages_' before generating an answer.")
        
        # Get chat history, documents, and question
        chat_history = state["messages_"]
        documents = state["documents"]
        rephrased_question = state["rephrased_question"]
        
        # Create RAG chain
        rag_chain = self.tools_manager.rag.create_rag_chain()
        
        # Generate response
        response = rag_chain.invoke({
            "chat_history": chat_history,
            "context": documents,
            "question": rephrased_question
        })
        
        # Extract and clean up generated text
        generation = response.content.strip()
        
        # Add to message history
        state["messages_"].append(AIMessage(content=generation))
        
        return state
    
    def cannot_answer(self, state: AgentState) -> AgentState:
        """
        Handle the case when the system cannot find an answer.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with cannot-answer message
        """
        # Ensure messages history exists
        if "messages_" not in state or state["messages_"] is None:
            state["messages_"] = []
        
        # Add cannot-answer message
        state["messages_"].append(
            AIMessage(
                content="I'm sorry, but I cannot find the information you're looking for."
            )
        )
        
        return state
    
    def off_topic_response(self, state: AgentState) -> AgentState:
        """
        Handle off-topic questions.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with off-topic response
        """
        # Update tool used in state
        state["tool_used"] = state["messages"][-1].name if "messages" in state and state["messages"] else ""
        
        # Ensure messages history exists
        if "messages_" not in state or state["messages_"] is None:
            state["messages_"] = []
        
        # Add off-topic message
        state["messages_"].append(AIMessage(content="I can't respond to that!"))
        
        return state
    
    def invoke(self, user_input: Dict[str, Any], thread_id: int = None) -> Dict[str, Any]:
        """
        Invoke the graph with user input.
        
        Args:
            user_input: User input dictionary
            thread_id: Optional thread ID for conversation management
            
        Returns:
            Result after processing through the graph
        """
        config = {}
        if thread_id is not None:
            config = {"configurable": {"thread_id": thread_id}}
        
        return self.graph.invoke(input=user_input, config=config)