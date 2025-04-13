"""
This module contains the tools manager that handles the routing of user queries
to the appropriate tools.
"""

import os
from typing import List, Dict, Any, Callable, Optional, Union, Literal
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.schema import Document
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from langchain.tools.retriever import create_retriever_tool

from tools.rag import RAG
from tools.mcq import MCQGenerator
from tools.qa import QAGenerator
from tools.about_chatbot import AboutAdam
from prompt import SUBJECT_FINDER_PROMPT

class ToolsManager:
    """
    Manages the tools available for the chatbot and routes requests to the appropriate tool.
    """
    
    def __init__(
        self,
        data_dir: str = "data_txt",
        rag_model: str = "gpt-4o-mini",
        agent_model: str = "gpt-4o-mini",
        embedding_model: str = "text-embedding-3-small",
        embedding_dimensions: int = 1536,
        temperature: float = 0.7,
    ):
        """
        Initialize the ToolsManager.
        
        Args:
            data_dir: Directory containing text data
            rag_model: Model for RAG
            agent_model: Model for the agent/router
            embedding_model: Model for embeddings
            embedding_dimensions: Embedding dimensions
            temperature: Temperature for generation
        """
        self.data_dir = data_dir
        self.rag_model = rag_model
        self.agent_model = agent_model
        self.embedding_model = embedding_model
        self.embedding_dimensions = embedding_dimensions
        self.temperature = temperature
        
        # Initialize tools
        self.rag = RAG(
            data_dir=data_dir,
            model_name=rag_model,
            embedding_model=embedding_model,
            dimensions=embedding_dimensions
        )
        
        self.mcq_generator = MCQGenerator(
            model_name=rag_model,
            temperature=temperature
        )
        
        self.qa_generator = QAGenerator(
            model_name=rag_model,
            temperature=temperature
        )
        
        self.about_adam = AboutAdam(
            model_name=rag_model,
            temperature=temperature
        )
        
        self.agent_llm = ChatOpenAI(model=agent_model)
        self.tools = self._create_tools()
        self.tool_node = ToolNode(self.tools)
        
        # Get subjects from data directory
        self.subjects = self._get_subjects()
    
    def _get_subjects(self) -> List[str]:
        """
        Get list of subjects from the data directory file names.
        
        Returns:
            List of subject names
        """
        subjects = []
        for filename in os.listdir(self.data_dir):
            if filename.lower().endswith('.txt'):
                subjects.append(os.path.splitext(filename)[0])
        return subjects
    
    def _create_tools(self) -> List:
        """
        Create tools for the agent.
        
        Returns:
            List of tools
        """
        @tool
        def retriever_tool(state: Dict[str, Any]) -> str:
            """Only Simple question-answering tool. About the deeplearning topic"""
            return "Retrieving information..."

        @tool
        def off_topic_response_tool(state: Dict[str, Any]) -> str:
            """Catch all Questions NOT related to the chatbot or deeplearning"""
            return "Forbidden - do not respond to the user"

        @tool
        def about_chatbot_tool(state: Dict[str, Any]) -> str:
            """
            Catch all Questions related to the chatbot or Adam.
            For getting information about the chatbot (Adam), like the purpose of the chatbot. 
            What does Adam do? The chatbot is named Adam.
            """
            return "Adam is a chatbot that answers questions about deep learning"

        @tool
        def mcq_tool(state: Dict[str, Any]) -> Dict[str, Any]:
            """Only MCQ creation, generation, about the deeplearning topic"""
            state["tool_used"] = "retrieve_for_MCQ"
            return state

        @tool
        def qa_tool(state: Dict[str, Any]) -> Dict[str, Any]:
            """Only exercise question to develop creation, generation, about the deeplearning topic"""
            state["tool_used"] = "retrieve_for_QA"
            return state

        return [retriever_tool, mcq_tool, qa_tool, about_chatbot_tool, off_topic_response_tool]
    
    def agent(self, state: Dict[str, Any]) -> Dict[str, List[BaseMessage]]:
        """
        Process input through the agent to determine which tool to use.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with agent response
        """
        rephrased_question = state.get('rephrased_question', '')
        message = HumanMessage(content=f"User question: {rephrased_question}")
        
        # Get current messages
        messages = state.get('messages', [])
        
        # Format messages for the model
        prompt_messages = ChatPromptTemplate.from_messages(messages)
        formatted_messages = prompt_messages.format()
        
        # Bind tools to the model
        model_with_tools = self.agent_llm.bind_tools(self.tools)
        
        # Get response
        response = model_with_tools.invoke(formatted_messages)
        
        return {"messages": [response]}
    
    # def should_continue(self, state: Dict[str, Any]) -> Union[Literal["tools"], Literal["END"]]:
    #     """
    #     Determine if processing should continue or end.
        
    #     Args:
    #         state: Current state
            
    #     Returns:
    #         Next step ("tools" or "END")
    #     """
    #     messages = state.get("messages", [])
    #     if not messages:
    #         return "END"
            
    #     last_message = messages[-1]
    #     if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
    #         return "tools"
    #     else:
    #         return "END"
    
    def tool_router(self, state: Dict[str, Any]) -> str:
        """
        Route to the appropriate tool based on the tool_used field.
        
        Args:
            state: Current state
            
        Returns:
            Name of the next node to execute
        """
        tool_used = state.get("tool_used", "")
        if tool_used in ["mcq_tool", "qa_tool"]:
            return "find_relevant_docs"
        elif tool_used == "retriever_tool":
            return "retrieve"
        elif tool_used == "about_chatbot_tool":
            return "about_chatbot"
        elif tool_used == "off_topic_response_tool":
            return "off_topic_response"
        else:
            return "END"
    
    def exercise_router(self, state: Dict[str, Any]) -> str:
        """
        Route to the appropriate exercise generator based on the tool_used field.
        
        Args:
            state: Current state
            
        Returns:
            Name of the next node to execute
        """
        tool_used = state.get("tool_used", "")
        if tool_used == "mcq_tool":
            return "generate_mcq"
        elif tool_used == "qa_tool":
            return "generate_qa"
        else:
            return "END"
    
    def find_relevant_docs(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find relevant documents based on the user query.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with relevant documents
        """
        # Set tool used in state
        state["tool_used"] = state.get("messages", [])[-1].name if state.get("messages") else ""
        
        # Get question and subjects
        question = state.get("rephrased_question", "")
        subjects_str = "\n".join(self.subjects)
        
        # Create prompt for finding relevant subject
        system_message = ChatPromptTemplate.from_template(SUBJECT_FINDER_PROMPT).format(subjects=subjects_str)
        human_message = f"User question: {question}"
        
        # Query LLM to determine relevant subject
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": human_message}
        ]
        
        response = self.agent_llm.invoke(messages)
        related_subject = response.content.strip()
        
        # Save result in state
        state["related_subject"] = related_subject
        
        # Load content for the related subject
        try:
            subject_path = os.path.join(self.data_dir, f"{related_subject}.txt")
            with open(subject_path, "r") as f:
                text = f.read()
            state["related_subject_content"] = text
        except Exception as e:
            print(f"Error loading subject content: {e}")
            state["related_subject_content"] = "Content not available"
        
        return state
    
    def generate_mcq(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate MCQs based on the state.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with generated MCQs
        """
        text = state.get("related_subject_content", "")
        number = 3
        tone = "difficult"
        subject = state.get("related_subject", "Deep Learning")
        rephrased_question = state.get("rephrased_question", "")
        language = state.get("language", "French")
        
        # Generate MCQs
        generated_mcq = self.mcq_generator.generate_mcq(
            text=text,
            question=rephrased_question,
            number=number,
            tone=tone,
            subject=subject,
            language=language
        )
        
        # Convert to string if it's a dict
        if isinstance(generated_mcq, dict):
            generated_mcq = str(generated_mcq)
        
        # Add to messages
        if "messages_" not in state:
            state["messages_"] = []
        
        state["messages_"].append(AIMessage(content=generated_mcq))
        
        # Generate review
        review = self.mcq_generator.evaluate_mcq(
            quiz=generated_mcq,
            tone=tone,
            subject=subject,
            language=language
        )
        
        state["messages_"].append(AIMessage(content=review))
        
        return state
    
    def generate_qa(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate Q&A pairs based on the state.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with generated Q&A pairs
        """
        text = state.get("related_subject_content", "")
        number = 3
        tone = "difficult"
        subject = state.get("related_subject", "Deep Learning")
        rephrased_question = state.get("rephrased_question", "")
        language = state.get("language", "French")
        
        # Generate Q&A pairs
        generated_qa = self.qa_generator.generate_qa(
            text=text,
            question=rephrased_question,
            number=number,
            tone=tone,
            subject=subject,
            language=language
        )
        
        # Convert to string if it's a dict
        if isinstance(generated_qa, dict):
            generated_qa = str(generated_qa)
        
        # Add to messages
        if "messages_" not in state:
            state["messages_"] = []
        
        state["messages_"].append(AIMessage(content=generated_qa))
        
        # Generate review
        review = self.qa_generator.evaluate_qa(
            quiz=generated_qa,
            tone=tone,
            subject=subject,
            language=language
        )
        
        state["messages_"].append(AIMessage(content=review))
        
        return state
    
    def about_chatbot(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Answer questions about the Adam chatbot.
        
        Args:
            state: Current state
            
        Returns:
            Updated state with information about Adam
        """
        # Set tool used in state
        state["tool_used"] = state.get("messages", [])[-1].name if state.get("messages") else ""
        
        # Get language and question
        language = state.get("language", "French")
        rephrased_question = state.get("rephrased_question", "")
        
        # Generate answer about Adam
        answer = self.about_adam.answer_question(
            question=rephrased_question,
            language=language
        )
        
        # Add to messages
        if "messages_" not in state:
            state["messages_"] = []
        
        state["messages_"].append(AIMessage(content=answer))
        
        return state