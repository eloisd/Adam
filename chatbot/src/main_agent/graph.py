"""
This module implements the graph workflow for the Adam chatbot.
"""

import os
from typing import TypedDict, List, Literal, Sequence, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from langchain.schema import Document

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode

from agent_state import AgentState
from rag import retrieve, retrieval_grader, proceed_router, generate_answer, refine_question, cannot_answer
from mcq import generate_mcq
from qa import generate_qa
from about_chatbot import about_chatbot
from tools_manager import agent, TOOLS, tool_router, find_relevant_docs, exercise_router, off_topic_response

from langchain_openai import ChatOpenAI



def question_rewriter(state: AgentState):
    print(f"Entering question_rewriter with following state: {state}")

    # Reset state variables except for 'question' and 'messages_'
    state["documents"] = []
    state["related_subject"] = ""
    state["related_subject_content"] = ""
    state["language"] = "French"
    state["topic"] = "Deeplearning"
    state["path_txt"] = "../../data_txt"
    state["subject"] = []
    state["tool_used"] = ""
    state["rephrased_question"] = ""
    state["proceed_to_generate"] = False
    state["rephrase_count"] = 0
    for filename in os.listdir(state["path_txt"]):
        if filename.lower().endswith('.txt'):
            state["subject"].append(os.path.splitext(filename)[0])
    # print(f"state['subject'] = {state['subject']}")
    if "messages_" not in state or state["messages_"] is None:
        state["messages_"] = []
    if "messages" not in state or state["messages"] is None:
        state["messages"] = []
    if state["question"] not in state["messages_"]:
        state["messages_"].append(state["question"])
    if state["question"] not in state["messages"]:
        state["messages"].append(state["question"])

    if len(state["messages_"]) > 1:
        conversation = state["messages_"][:-1]
        current_question = state["question"].content
        messages = [
            SystemMessage(
                content="You are a helpful assistant that rephrases the user's question to be a standalone question optimized for retrieval. And give just this rephrased question as answer."
            )
        ]
        messages.extend(conversation)
        messages.append(HumanMessage(content=current_question))
        rephrase_prompt = ChatPromptTemplate.from_messages(messages)
        llm = ChatOpenAI(model="gpt-4o-mini")
        prompt = rephrase_prompt.format()
        response = llm.invoke(prompt)
        better_question = response.content.strip()
        print(f"question_rewriter: Rephrased question: {better_question}")
        state["rephrased_question"] = better_question
    else:
        state["rephrased_question"] = state["question"].content
    return state
def graph():
    checkpointer_rag = MemorySaver()


    workflow_rag = StateGraph(AgentState)
    tool_node = ToolNode(TOOLS)

    workflow_rag.add_node("question_rewriter", question_rewriter)
    workflow_rag.add_node("off_topic_response", off_topic_response)
    workflow_rag.add_node("about_chatbot", about_chatbot)
    workflow_rag.add_node("agent", agent)
    workflow_rag.add_node("tools", tool_node)

    workflow_rag.add_node("retrieve", retrieve)
    workflow_rag.add_node("retrieval_grader", retrieval_grader)
    workflow_rag.add_node("generate_answer", generate_answer)
    workflow_rag.add_node("refine_question", refine_question)
    workflow_rag.add_node("cannot_answer", cannot_answer)

    workflow_rag.add_node("find_relevant_docs", find_relevant_docs)
    workflow_rag.add_node("generate_mcq", generate_mcq)
    workflow_rag.add_node("generate_qa", generate_qa)


    workflow_rag.add_edge("question_rewriter", "agent")
    workflow_rag.add_edge("agent", "tools")
    workflow_rag.add_conditional_edges(
        "tools", 
        tool_router,
        {
            "retrieve": "retrieve", 
            "find_relevant_docs": "find_relevant_docs",
            "off_topic_response": "off_topic_response",
            "about_chatbot": "about_chatbot",
            "END": END
        }
    )

    workflow_rag.add_edge("retrieve", "retrieval_grader")
    workflow_rag.add_conditional_edges(
        "retrieval_grader",
        proceed_router,
        {
            "generate_answer": "generate_answer",
            "cannot_answer": "cannot_answer",
            "refine_question": "refine_question",
        },
    )
    workflow_rag.add_edge("refine_question", "retrieve")
    workflow_rag.add_edge("generate_answer", END)
    workflow_rag.add_edge("cannot_answer", END)

    workflow_rag.add_conditional_edges(
        "find_relevant_docs",
        exercise_router,
        {
            "generate_mcq": "generate_mcq",
            "generate_qa": "generate_qa",
        },
    )
    workflow_rag.add_edge("generate_mcq",END)
    workflow_rag.add_edge("generate_qa",END)

    workflow_rag.add_edge("about_chatbot",END)
    workflow_rag.add_edge("off_topic_response", END)
    workflow_rag.set_entry_point("question_rewriter")
    graph = workflow_rag.compile(checkpointer=checkpointer_rag)

    return graph

if __name__ == "__main__":

    from IPython.display import Image, display
    from langchain_core.runnables.graph import MermaidDrawMethod

    graph = graph()
    
    display(
        Image(
            graph.get_graph().draw_mermaid_png(
                draw_method=MermaidDrawMethod.API,
            )
        )
    )

    # # Q&A query
    # qa_query = "Make me an question to develop about pooling in CNN?"
    # input_data = {"question": HumanMessage(content=qa_query)}
    # graph.invoke(input=input_data, config={"configurable": {"thread_id": 1}})

    # # MCQ query
    # mcq_query = "Make me an mcq about perceptron?"
    # input_data = {"question": HumanMessage(content=mcq_query)}
    # graph.invoke(input=input_data, config={"configurable": {"thread_id": 2}})

    # # Off topic query
    # off_topic_content_rag = "How is the weather?"
    # input_data = {"question": HumanMessage(content=off_topic_content_rag)}
    # graph.invoke(input=input_data, config={"configurable": {"thread_id": 3}})

    # # No relevant docs found
    # no_docs_cotent_rag = "In the feald of GNN, What is deepGCN?"
    # input_data = {"question": HumanMessage(content=no_docs_cotent_rag)}
    # graph.invoke(input=input_data, config={"configurable": {"thread_id": 4}})

    # Rag with memory
    memory_content_1_rag = "Qu'est-ce que le graph neural network GNN?"
    input_data = {"question": HumanMessage(content=memory_content_1_rag)}
    graph.invoke(input=input_data, config={"configurable": {"thread_id": 5}})

    # memory_content_2_rag = "Can you give me a use case of it?"
    # input_data = {"question": HumanMessage(content=memory_content_2_rag)}
    # graph.invoke(input=input_data, config={"configurable": {"thread_id": 5}})

    # # about chatbot query
    # about_chatbot = "Hi Adam, what do tou do?"
    # input_data = {"question": HumanMessage(content=about_chatbot)}
    # graph.invoke(input=input_data, config={"configurable": {"thread_id": 3}})
