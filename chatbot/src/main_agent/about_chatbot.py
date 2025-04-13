from dotenv import load_dotenv

load_dotenv()

from prompt import ADAM_PRESENTATION, ABOUT_ADAM_ANSWER_TEMPLATE
from agent_state import AgentState

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage

from langchain_openai import ChatOpenAI

def about_chatbot(state: AgentState):
    # """Catch all Questions related to the chatbot or Adam."""
    print("Entering about_chatbot")
    state["tool_used"] = state["messages"][-1].name
    llm = ChatOpenAI(
        model="gpt-4o-mini",
    )
    language = state["language"]
    rephrased_question = state["rephrased_question"]
    if "messages_" not in state or state["messages_"] is None:
        state["messages_"] = []
    
    about_adam_answer_prompt = ChatPromptTemplate.from_template(ABOUT_ADAM_ANSWER_TEMPLATE)
    adam_chain = about_adam_answer_prompt | llm
    response = adam_chain.invoke(
        {"adam_presentation": ADAM_PRESENTATION,  "question": rephrased_question, "language": language}
    )
    answer_about_adam = response.content.strip()
    state["messages_"].append(AIMessage(content=answer_about_adam))
    print(f"about_chatbot: Generated response: {answer_about_adam}")
    return state