from create_txt import StorageAgentState, init, find_missing_txt_files, create_txt_content, create_txt_files
from langchain_core.messages import HumanMessage

from IPython.display import Image, display
from langchain_core.runnables.graph import MermaidDrawMethod
from langgraph.graph import StateGraph, END

# Workflow
storage_workflow = StateGraph(StorageAgentState)
storage_workflow.add_node("init", init)
storage_workflow.add_node("find_missing_txt_files", find_missing_txt_files)
storage_workflow.add_node("create_txt_content", create_txt_content)
storage_workflow.add_node("create_txt_files", create_txt_files)

storage_workflow.add_edge("init", "find_missing_txt_files")
storage_workflow.add_edge("find_missing_txt_files", "create_txt_content")
storage_workflow.add_edge("create_txt_content", "create_txt_files")
storage_workflow.add_edge("create_txt_files", END)
storage_workflow.set_entry_point("init")
storage_graph = storage_workflow.compile()

if __name__ == "__main__":

    display(
        Image(
            storage_graph.get_graph().draw_mermaid_png(
                draw_method=MermaidDrawMethod.API,
            )
        )
    )

    input_data = {"question": HumanMessage(content=" ")}
    storage_graph.invoke(input=input_data)