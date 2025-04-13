from dotenv import load_dotenv

load_dotenv()

from prompt import RAG_TEMPLATE, DOCUMENT_GRADER_PROMPT, QUESTION_REFINER_PROMPT
from agent_state import AgentState


from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

def retrieve(state: AgentState):
    print("Entering retrieve")
    state["tool_used"] = state["messages"][-1].name

    # embedding_function = OpenAIEmbeddings(model="text-embedding-3-small", dimensions=1536)
    # db = Chroma.from_documents(chunks, embedding_function)
    # retriever = db.as_retriever(search_kwargs={"k": 10})

    # documents = retriever.invoke(state["rephrased_question"])
    # print(f"retrieve: Retrieved {len(documents)} documents")
    # state["documents"] = documents
    return state

class GradeDocument(BaseModel):
    score: str = Field(
        description="Document is relevant to the question? If yes -> 'Yes' if not -> 'No'"
    )


def retrieval_grader(state: AgentState):
    print("Entering retrieval_grader")
    system_message = SystemMessage(
        content="""You are a grader assessing the relevance of a retrieved document to a user question.
Only answer with 'Yes' or 'No'.

If the document contains information relevant to the user's question, respond with 'Yes'.
Otherwise, respond with 'No'."""
    )

    llm = ChatOpenAI(model="gpt-4o-mini")
    structured_llm = llm.with_structured_output(GradeDocument)

    relevant_docs = []
    for doc in state["documents"]:
        human_message = HumanMessage(
            content=f"User question: {state['rephrased_question']}\n\nRetrieved document:\n{doc.page_content}"
        )
        grade_prompt = ChatPromptTemplate.from_messages([system_message, human_message])
        grader_llm = grade_prompt | structured_llm
        result = grader_llm.invoke({})
        print(
            f"Grading document: {doc.page_content[:30]}... Result: {result.score.strip()}"
        )
        if result.score.strip().lower() == "yes":
            relevant_docs.append(doc)
    state["documents"] = relevant_docs
    state["proceed_to_generate"] = len(relevant_docs) > 0
    print(f"retrieval_grader: proceed_to_generate = {state['proceed_to_generate']}")
    return state


def proceed_router(state: AgentState):
    print("Entering proceed_router")
    rephrase_count = state.get("rephrase_count", 0)
    if state.get("proceed_to_generate", False):
        print("Routing to generate_answer")
        return "generate_answer"
    elif rephrase_count >= 2:
        print("Maximum rephrase attempts reached. Cannot find relevant documents.")
        return "cannot_answer"
    else:
        print("Routing to refine_question")
        return "refine_question"


def refine_question(state: AgentState):
    print("Entering refine_question")
    rephrase_count = state.get("rephrase_count", 0)
    if rephrase_count >= 2:
        print("Maximum rephrase attempts reached")
        return state
    question_to_refine = state["rephrased_question"]
    system_message = SystemMessage(
        content="""You are a helpful assistant that slightly refines the user's question to improve retrieval results.
Provide a slightly adjusted version of the question."""
    )
    human_message = HumanMessage(
        content=f"Original question: {question_to_refine}\n\nProvide a slightly refined question."
    )
    refine_prompt = ChatPromptTemplate.from_messages([system_message, human_message])
    llm = ChatOpenAI(model="gpt-4o-mini")
    prompt = refine_prompt.format()
    response = llm.invoke(prompt)
    refined_question = response.content.strip()
    print(f"refine_question: Refined question: {refined_question}")
    state["rephrased_question"] = refined_question
    state["rephrase_count"] = rephrase_count + 1
    return state


def generate_answer(state: AgentState):
    print("Entering generate_answer")
    if "messages_" not in state or state["messages_"] is None:
        raise ValueError("State must include 'messages_' before generating an answer.")

    chat_history = state["messages_"]
    documents = state["documents"]
    rephrased_question = state["rephrased_question"]
    llm = ChatOpenAI(model="gpt-4o-mini")

    rag_prompt = ChatPromptTemplate.from_template(rag_template)
    rag_chain = rag_prompt | llm
    response = rag_chain.invoke(
        {"chat_history": chat_history, "context": documents, "question": rephrased_question}
    )

    generation = response.content.strip()

    state["messages_"].append(AIMessage(content=generation))
    print(f"generate_answer: Generated response: {generation}")
    return state


def cannot_answer(state: AgentState):
    print("Entering cannot_answer")
    if "messages_" not in state or state["messages_"] is None:
        state["messages_"] = []
    state["messages_"].append(
        AIMessage(
            content="I'm sorry, but I cannot find the information you're looking for."
        )
    )
    return state


