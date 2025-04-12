"""
Main entry point for the Adam chatbot application.
"""
from dotenv import load_dotenv

load_dotenv()

import os
import argparse
from typing import Dict, Any, List
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage

from .tools_manager import ToolsManager
from .graph import ChatbotGraph
from .tools.rag import RAG

def initialize_tools(
    data_dir: str = "data_txt",
    rag_model: str = "gpt-4o-mini",
    agent_model: str = "gpt-4o-mini",
    embedding_model: str = "text-embedding-3-small",
    embedding_dimensions: int = 1536,
    temperature: float = 0.7,
):
    """
    Initialize the tools required for the chatbot.
    
    Args:
        data_dir: Directory containing text data
        rag_model: Model for RAG
        agent_model: Model for the agent/router
        embedding_model: Model for embeddings
        embedding_dimensions: Embedding dimensions
        temperature: Temperature for generation
        
    Returns:
        ToolsManager and RAG objects
    """
    # Initialize tools manager
    tools_manager = ToolsManager(
        data_dir=data_dir,
        rag_model=rag_model,
        agent_model=agent_model,
        embedding_model=embedding_model,
        embedding_dimensions=embedding_dimensions,
        temperature=temperature
    )
    
    # Initialize RAG
    rag = RAG(
        data_dir=data_dir,
        model_name=rag_model,
        embedding_model=embedding_model,
        dimensions=embedding_dimensions
    )
    
    return tools_manager, rag

def initialize_graph(
    tools_manager: ToolsManager,
    rag_model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    data_dir: str = "data_txt"
):
    """
    Initialize the chatbot graph.
    
    Args:
        tools_manager: The tools manager
        rag_model: Model for RAG
        temperature: Temperature for generation
        data_dir: Directory containing text data
        
    Returns:
        ChatbotGraph object
    """
    graph = ChatbotGraph(
        tools_manager=tools_manager,
        rag_model=rag_model,
        temperature=temperature,
        data_dir=data_dir
    )
    
    return graph

def process_message(
    graph: ChatbotGraph,
    message: str,
    thread_id: int = None
) -> Dict[str, Any]:
    """
    Process a message through the chatbot graph.
    
    Args:
        graph: The chatbot graph
        message: The user message
        thread_id: Optional thread ID for conversation management
        
    Returns:
        Result after processing through the graph
    """
    # Create input for the graph
    input_data = {"question": HumanMessage(content=message)}
    
    # Invoke the graph
    result = graph.invoke(input_data, thread_id)
    
    return result

def get_response(result: Dict[str, Any]) -> str:
    """
    Extract response from the result.
    
    Args:
        result: Result from processing through the graph
        
    Returns:
        Response text
    """
    if "messages_" in result and result["messages_"]:
        # Get the last AI message
        messages = result["messages_"]
        for msg in reversed(messages):
            if hasattr(msg, "content") and msg.type == "ai":
                return msg.content
    
    return "I'm sorry, I couldn't generate a response."

def main():
    """Main function for the Adam chatbot."""
    # Load environment variables
    load_dotenv()
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Adam Chatbot")
    parser.add_argument("--data_dir", type=str, default="data_txt", help="Directory containing text data")
    parser.add_argument("--rag_model", type=str, default="gpt-4o-mini", help="Model for RAG")
    parser.add_argument("--agent_model", type=str, default="gpt-4o-mini", help="Model for the agent/router")
    parser.add_argument("--embedding_model", type=str, default="text-embedding-3-small", help="Model for embeddings")
    parser.add_argument("--embedding_dimensions", type=int, default=1536, help="Embedding dimensions")
    parser.add_argument("--temperature", type=float, default=0.7, help="Temperature for generation")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
    args = parser.parse_args()
    
    # Initialize tools and graph
    tools_manager, rag = initialize_tools(
        data_dir=args.data_dir,
        rag_model=args.rag_model,
        agent_model=args.agent_model,
        embedding_model=args.embedding_model,
        embedding_dimensions=args.embedding_dimensions,
        temperature=args.temperature
    )
    
    graph = initialize_graph(
        tools_manager=tools_manager,
        rag_model=args.rag_model,
        temperature=args.temperature,
        data_dir=args.data_dir
    )
    
    # Run in interactive mode if requested
    if args.interactive:
        print("Welcome to Adam Chatbot! Type 'exit' to quit.")
        thread_id = 1
        
        while True:
            # Get user input
            user_input = input("\nYou: ")
            
            # Exit if requested
            if user_input.lower() in ["exit", "quit", "bye"]:
                print("\nGoodbye!")
                break
            
            # Process message
            result = process_message(graph, user_input, thread_id)
            
            # Get and print response
            response = get_response(result)
            print(f"\nAdam: {response}")
    
    return graph

if __name__ == "__main__":
    main()