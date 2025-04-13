from typing import TypedDict, List, Literal, Sequence, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from langchain.schema import Document

class AgentState(TypedDict):
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