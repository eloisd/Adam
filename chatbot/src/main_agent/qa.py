from dotenv import load_dotenv

load_dotenv()

from prompt import QA_GENERATOR_TEMPLATE, QA_EVALUATION_TEMPLATE, RESPONSE_JSON_QA
from agent_state import AgentState

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage

from langchain_openai import ChatOpenAI

def generate_qa(state: AgentState):
    print("Entering generate_qa")
    text = state["related_subject_content"]
    number = 3
    tone = "difficult"        
    subject = state["related_subject"]
    rephrased_question = state["rephrased_question"]
    language = state["language"]
    llm = ChatOpenAI(
        model="gpt-4o-mini",
    )
    qa_generator_prompt = ChatPromptTemplate.from_template(QA_GENERATOR_TEMPLATE)
    qa_evaluation_prompt = ChatPromptTemplate.from_template(QA_EVALUATION_TEMPLATE)
    qa_chain = qa_generator_prompt | llm
    response = qa_chain.invoke(
        {"text": text, "number": number, "tone": tone, "subject": subject, "response_json": RESPONSE_JSON_QA, "question": rephrased_question, "language": language}
    )
    generated_qa = response.content.strip()
    state["messages_"].append(AIMessage(content=generated_qa))

    qa_review_chain = qa_evaluation_prompt | llm
    response = qa_review_chain.invoke(
        {"tone": tone, "subject": subject, "quiz": generated_qa, "language": language}
    )
    generated_review = response.content.strip()
    state["messages_"].append(AIMessage(content=generated_review))

    print(f"generate_qa: rephrased_question: {state["rephrased_question"]}")
    print(f"generate_qa: Generated Q&A: {generated_qa}")
    print(f"generate_qa: Generated review: {generated_review}")
    return state