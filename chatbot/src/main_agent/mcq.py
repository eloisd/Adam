from dotenv import load_dotenv

load_dotenv()

from prompt import MCQ_GENERATOR_TEMPLATE, MCQ_EVALUATION_TEMPLATE, RESPONSE_JSON_MCQ
from agent_state import AgentState

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage

from langchain_openai import ChatOpenAI

def generate_mcq(state: AgentState):
    print("Entering generate_mcq")
    text = state["related_subject_content"]
    number = 3
    tone = "difficult"
    subject = state["related_subject"]
    rephrased_question = state["rephrased_question"]
    language = state["language"]
    llm = ChatOpenAI(
        model="gpt-4o-mini",
    )
    quiz_generator_prompt = ChatPromptTemplate.from_template(MCQ_GENERATOR_TEMPLATE)
    quiz_evaluation_prompt = ChatPromptTemplate.from_template(MCQ_EVALUATION_TEMPLATE)
    mcq_chain = quiz_generator_prompt | llm
    response = mcq_chain.invoke(
        {"text": text, "number": number, "tone": tone, "subject": subject, "response_json": RESPONSE_JSON_MCQ, "question": rephrased_question, "language": language}
    )
    generated_mcq = response.content.strip()
    state["messages_"].append(AIMessage(content=generated_mcq))

    mcq_review_chain = quiz_evaluation_prompt | llm
    response = mcq_review_chain.invoke(
        {"tone": tone, "subject": subject, "quiz": generated_mcq, "language": language}
    )
    generated_review = response.content.strip()
    state["messages_"].append(AIMessage(content=generated_review))

    print(f"generate_mcq: rephrased_question: {state["rephrased_question"]}")
    print(f"generate_mcq: Generated response: {generated_mcq}")
    print(f"generate_mcq: Generated review: {generated_review}")
    return state