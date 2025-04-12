from typing import TypedDict, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain.schema import Document
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END


class StorageAgentState(TypedDict):
    messages: List[BaseMessage]
    base_path_txt: str
    base_path_pdf: str
    missing_txt: List[Document]
    missing_pdf: List[str]
    rephrased_documents: List[str]

import os

def init(state: StorageAgentState):
    print("Entering init")
    state["base_path_txt"] = "data_txt"
    state["base_path_pdf"] = "data_pdf"
    state["missing_txt"] = []
    state["missing_pdf"] = []
    state["rephrased_documents"] = []
    
    if "messages" not in state or state["messages"] is None:
        state["messages"] = []
    return state

def find_missing_txt_files(state: StorageAgentState):
    """
    Identifies PDF files in pdf_dir that don't have corresponding TXT files in txt_dir.
    
    Args:
        pdf_dir (str): Directory containing PDF files (default: "data_pdf")
        txt_dir (str): Directory containing TXT files (default: "data_txt")
    
    Returns:
        list: List of missing TXT filenames (without path, but with .txt extension)
    """
    print("Entering find_missing_txt_files")
    pdf_dir = state["base_path_pdf"]
    txt_dir = state["base_path_txt"]

    # Create directories if they don't exist
    os.makedirs(pdf_dir, exist_ok=True)
    os.makedirs(txt_dir, exist_ok=True)
    
    # Get list of PDF files
    pdf_files = []
    for filename in os.listdir(pdf_dir):
        if filename.lower().endswith('.pdf'):
            pdf_files.append(filename)
    
    # Get list of TXT files
    txt_files = []
    for filename in os.listdir(txt_dir):
        if filename.lower().endswith('.txt'):
            txt_files.append(filename)
    
    # Convert PDF filenames to expected TXT filenames
    expected_txt_files = [os.path.splitext(pdf)[0] + '.txt' for pdf in pdf_files]
    
    # Find missing TXT files
    counter = 0
    for i, txt in enumerate(expected_txt_files):
        if txt not in txt_files:
            i -= counter
            state["missing_txt"].append({"page_content": "", "metadata": {"path": "", "topic": "Deep Learning", "doc_type": "cours", "doc_subject": ""}})
            state["missing_txt"][i]["metadata"]["path"] = os.path.join(txt_dir, txt)
            state["missing_txt"][i]["metadata"]["doc_subject"] = os.path.splitext(txt)[0]
            state["missing_pdf"].append(os.path.join(pdf_dir,os.path.splitext(txt)[0] + '.pdf'))
        else:
            counter += 1
    print(f"Found {len(pdf_files)} PDF files in '{pdf_dir}'")
    print(f"Found {len(txt_files)} TXT files in '{txt_dir}'")
    print(f"Missing {len(state["missing_txt"])} TXT files")
    print("Missing TXT files:", state["missing_txt"])
    print("PDFs needing processing:", state["missing_pdf"])
    
    return state

def get_missing_pdf_paths(state: StorageAgentState):
    """
    Returns the full paths of PDF files that don't have corresponding TXT files.
    
    Args:
        pdf_dir (str): Directory containing PDF files (default: "data_pdf")
        txt_dir (str): Directory containing TXT files (default: "data_txt")
    
    Returns:
        list: List of full paths to PDF files that need processing
    """
    print("Entering get_missing_pdf_paths")
    pdf_dir = state["base_path_pdf"]

    missing_txt_files = state["missing_txt"]

    # Convert missing TXT filenames back to PDF filenames
    missing_pdf_files = [os.path.splitext(txt)[0] + '.pdf' for txt in missing_txt_files]

    # Create full paths
    state["missing_pdf"] = [os.path.join(pdf_dir, pdf) for pdf in missing_pdf_files]
    # for i, pdf in enumerate(missing_pdf_files):
    #     state["missing_pdf"].append({"page_content": "", "metadata": {"path": "", "topic": "Deep Learning", "doc_type": "cours", "doc_subject": ""}})
    #     state["missing_pdf"][i]["metadata"]["path"] = os.path.join(pdf_dir, pdf)
    print("PDFs needing processing:", state["missing_pdf"])

    return state

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_core.messages import HumanMessage
import base64
import os
from dotenv import load_dotenv
import fitz  # PyMuPDF
from PIL import Image
import io
import mimetypes


# Load environment variables
load_dotenv()

# Function to convert PDF to images and encode them
# def pdf_to_base64_images(pdf_path):
#     images = []
#     pdf_document = fitz.open(pdf_path)
    
#     for page_number in range(len(pdf_document)):
#         page = pdf_document.load_page(page_number)
#         pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better resolution
        
#         # Convert to PIL Image
#         img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
#         # Convert to base64
#         buffered = io.BytesIO()
#         img.save(buffered, format="PNG")
#         img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
#         images.append(img_base64)
    
#     return images

def pdf_to_base64_images(pdf_path):  # Limit pages to avoid context limits
    images = []
    pdf_document = fitz.open(pdf_path)
        
    for page_number in range(len(pdf_document)):
        page = pdf_document.load_page(page_number)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Higher resolution
        
        # Convert to PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG", quality=85)  # JPEG for better compatibility
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        images.append(img_base64)
    
    return images

def create_txt_content(state: StorageAgentState):
    for i in range(len(state["missing_pdf"])):
        # Path to your PDF
        print(f"Processing: {state["missing_txt"][i]["metadata"]['doc_subject']}")
        pdf_path = state["missing_pdf"][i]
        base64_images = pdf_to_base64_images(pdf_path)


        # Create content list with all PDF pages as images
        content= [
            {"type": "text", "text": f"Tu es expert en {state["missing_txt"][i]["metadata"]['topic']}.\n"
            f"Voici un {state["missing_txt"][i]["metadata"]['doc_type']} sur {state["missing_txt"][i]["metadata"]['doc_subject']}.\n"
            "Il y a dans ce document des images explicatives et des formules mathématiques.\n"
            "Ton but est de faire un fichier texte qui redit exactement tout ce qui est expliqué dans ce "
            "document en incluant les formules mathématiques et les explications que les images peuvent apporter.\n"
            }
        ]
        

        # Add each page as an image
        for img_base64 in base64_images:
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": img_base64
                }

                # "type": "image_url",
                # "image_url": {
                #     "url": f"data:application/pdf;base64,{base64_pdf}"
                # }

                # "type": "image_url",
                # "image_url": {
                #     "url": f"data:image/jpeg;base64,{img_base64}"
                # }
            })


        # Initialize Claude through LangChain
        llm = ChatAnthropic(
            model="claude-3-7-sonnet-20250219",
            max_tokens=9092,
        )
        # llm = ChatOpenAI(
        #     model="gpt-4o-mini",
        # )
        # llm = ChatGoogleGenerativeAI(
        #     model="models/gemini-2.0-flash-exp",
        # )
        # Create a message with the PDF pages as images
        message = HumanMessage(content=content)

        # Get response
        response = llm.invoke([message])
        print(response.content)
        state["missing_txt"][i]["page_content"] = response.content
    return state

    def create_txt_files(state: StorageAgentState):
    print("Entering create_txt_files")
    for i in range(len(state["missing_pdf"])):
        with open(state["missing_txt"][i]["metadata"]["path"], "w") as f:
            f.write(state["missing_txt"][i]["page_content"])

    return state

