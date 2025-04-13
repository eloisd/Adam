
from agent_state import AgentState
from prompt import SUBJECT_FINDER_PROMPT

import os
from langchain_community.document_loaders import TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from pydantic import BaseModel, Field
from langchain_core.tools import tool

from langchain_openai import ChatOpenAI



class SpecifySubject(BaseModel):
    score: str = Field(
        description="Question: Among the following subjects, which one is relevant to the question? Give the related subject."
    )


def find_relevant_docs(state: AgentState):
    print("Entering find_relevant_docs")
    state["tool_used"] = state["messages"][-1].name
    question = state["rephrased_question"]
    subjects = "" 
    for i,doc in enumerate(state["subject"]):
        subjects += str(doc)+"\n"
    print("subjects:",subjects)
    system_message = SystemMessage(content=SUBJECT_FINDER_PROMPT)

    human_message = HumanMessage(
        content=f"User question: {state['rephrased_question']}"
    )
    grade_prompt = ChatPromptTemplate.from_messages([system_message, human_message])
    llm = ChatOpenAI(model="gpt-4o-mini")
    structured_llm = llm.with_structured_output(SpecifySubject)
    grader_llm = grade_prompt | structured_llm
    result = grader_llm.invoke({})
    state["related_subject"] = result.score.strip()
    print(f"question_classifier: related_subject = {state['related_subject']}")

    loader = TextLoader(os.path.join(state["path_txt"],str(state['related_subject']+".txt")))
    text = loader.load()
    text = text[0].page_content
    # print("text:",text)
    state["related_subject_content"] = text
    return state

def exercise_router(state: AgentState):
    print("Entering exercise_router")
    print("state['tool_used'] = ",state["tool_used"])
    if state["tool_used"] == "mcq_tool":
        print("Routing to generate_mcq")
        return "generate_mcq"
    elif state["tool_used"] == "qa_tool":
        print("Routing to generate_qa")
        return "generate_qa"
    

def off_topic_response(state: AgentState):
    # """Catch all Questions NOT related to the chatbot or deeplearning"""
    print("Entering off_topic_response")
    state["tool_used"] = state["messages"][-1].name
    if "messages_" not in state or state["messages_"] is None:
        state["messages_"] = []
    state["messages_"].append(AIMessage(content="I can't respond to that!"))
    return state

@tool
def retriever_tool(state: AgentState):
    """Only Simple question-answering tool. About the deeplearning topic """
    print("Entering retriever_tool")
    return f"retrieve: Retrieved {len(documents)} documents"

@tool
def off_topic_response_tool(state: AgentState):
    """Catch all Questions NOT related to the chatbot or deeplearning"""
    print("Entering off_topic_response_tool")
    print("state['tool_used'] = ",state["tool_used"])
    return "Forbidden - do not respond to the user"

@tool
def about_chatbot_tool(state: AgentState):
    """Catch all Questions related to the chatbot or Adam.
    For getting information about the chatbot (Adam), like the purpose of the chatbot. What does Adam do?
    The chatbot is named Adam."""
    print("Entering about_chatbot_tool")
    return "Adam is a chatbot that answers questions about deep learning"

@tool
def mcq_tool(state: AgentState):
    """Only MCQ creation, generation, about the deeplearning topic """
    print("Entering mcq_tool")
    state["tool_used"] = "retrieve_for_MCQ"
    documents = retriever.invoke(state["rephrased_question"])
    print(f"retrieve_for_MCQ: Retrieved {len(documents)} documents")
    state["documents"] = documents
    return state

@tool
def qa_tool(state: AgentState):
    """Only exercise question to develop creation, generation, about the deeplearning topic """
    print("Entering qa_tool")
    state["tool_used"] = "retrieve_for_QA"
    documents = retriever.invoke(state["rephrased_question"])
    print(f"retrieve_for_QA: Retrieved {len(documents)} documents")
    state["documents"] = documents
    return state

TOOLS = [retriever_tool, mcq_tool, qa_tool, about_chatbot_tool, off_topic_response_tool]

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

def agent(state):
    print("Entering agent")
    message = HumanMessage(
        content=f"User question: {state['rephrased_question']}"
    )

    messages = state["messages"]
    print(f"messages = {messages}")
    messages = ChatPromptTemplate.from_messages(messages)
    messages = messages.format()
    model = ChatOpenAI(model="gpt-4o-mini")
    model = model.bind_tools(TOOLS)
    response = model.invoke(messages)
    # state["tool_used"] = response.additional_kwargs['tool_calls'][0]['function']['name']
    # print(f"Agent: {state["tool_used"]}")
    return {"messages": [response]}
    # return state


def tool_router(state: AgentState):
    print("Entering tool_router")
    state["tool_used"] = state["messages"][-1].name
    print("state['tool_used'] = ",state["tool_used"])
    if state["tool_used"] == "mcq_tool" or state["tool_used"] == "qa_tool":
        print("Routing to find_relevant_docs")
        return "find_relevant_docs"
    # elif state["tool_used"] == "qa_tool":
    #     print("Routing to retrieve_for_QA")
    #     return "retrieve_for_Q&A"
    elif state["tool_used"] == "retriever_tool": # or state["tool_used"] == ""
        print("Routing to retrieve")
        return "retrieve"
    elif state["tool_used"] == "about_chatbot_tool":
        print("Routing to about_chatbot")
        return "about_chatbot"
    elif state["tool_used"] == "off_topic_response_tool":
        print("Routing to off_topic_response")
        return "off_topic_response"
    else:
        return "END"

