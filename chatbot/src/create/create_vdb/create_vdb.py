"""
This module creates the vector database from the text files in the data directory.
"""
from dotenv import load_dotenv

load_dotenv()

import re
from langchain_openai import ChatOpenAI
from typing import Any, List
from langchain_text_splitters import TextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader, UnstructuredMarkdownLoader, TextLoader
from langchain.schema import Document
from prompt import LLM_SPLITTER_PROMPT

class GPTSplitter(TextSplitter):
    def __init__(self, model_name: str = "gpt-4o-mini", **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.model = ChatOpenAI(model=model_name)
        # self.model = llm5

        self.prompt = ChatPromptTemplate.from_template(LLM_SPLITTER_PROMPT)
        self.output_parser = StrOutputParser()
        self.chain = (
            {"text": RunnablePassthrough()}
            | self.prompt
            | self.model
            | self.output_parser
        )

    def split_text(self, text: str) -> List[str]:
        response = self.chain.invoke({"text": text})
        # Use regex to split properly by <<< and >>> markers
        chunks = re.findall(r'<<<(.*?)>>>', response, re.DOTALL)
        return [chunk.strip() for chunk in chunks]

def chunker(dir_txt = "../../../data_txt"):
    # Spécifier explicitement PyPDFLoader pour les fichiers PDF
    # loader = DirectoryLoader("./data_pdf", glob="**/*.pdf", loader_cls=PyPDFLoader)
    # loader = DirectoryLoader("./data_md", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader)
    loader = DirectoryLoader(dir_txt, glob="**/*.txt")
    docs = loader.load()

    # raw_data = "\n".join([doc.page_content for doc in docs])

    gpt_splitter = GPTSplitter()
    gpt_docs = gpt_splitter.split_text(docs)
    chunks = [Document(page_content=chunk, metadata={'source': 'data_txt/deeplearning.txt'}) for chunk in gpt_docs]

    return chunks



import os
import argparse
import sqlite3
from typing import List
from langchain.schema import Document
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.chroma import Chroma

def load_documents(data_dir: str) -> List[Document]:
    """
    Load documents from data directory.
    
    Args:
        data_dir: Directory containing text files
        
    Returns:
        List of loaded documents
    """
    loader = DirectoryLoader(data_dir, glob="**/*.txt", loader_cls=TextLoader)
    documents = loader.load()
    print(f"Loaded {len(documents)} documents")
    return documents

def split_documents(documents: List[Document], use_gpt: bool = True) -> List[Document]:
    """
    Split documents into chunks.
    
    Args:
        documents: Documents to split
        use_gpt: Whether to use GPT for splitting
        
    Returns:
        List of document chunks
    """
    print("use gpt text spliter:", use_gpt)
    if use_gpt:
        splitter = GPTSplitter()
        chunks = []
        
        for doc in documents:
            doc_chunks = splitter.split_text(doc.page_content)
            for chunk in doc_chunks:
                chunks.append(
                    Document(page_content=chunk, metadata=doc.metadata)
                )
        print(f"Created {len(chunks)} chunks using GPT")
        return chunks
    else:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunks = text_splitter.split_documents(documents)
        print(f"Created {len(chunks)} chunks using RecursiveCharacterTextSplitter")
        return chunks

def create_vector_store(documents: List[Document], persist_dir: str = None):
    """
    Create the vector store from documents.
    
    Args:
        documents: Documents to index
        persist_dir: Directory to persist the vector store to
        
    Returns:
        The created vector store
    """
    embedding_function = OpenAIEmbeddings(
        model="text-embedding-3-small", 
        dimensions=1536
    )
    
    db = Chroma.from_documents(
        documents=documents,
        embedding=embedding_function,
        persist_directory=persist_dir
    )
    
    if persist_dir:
        db.persist()
        print(f"Vector store persisted to {persist_dir}")
    
    return db

def create_sqlite_metadata(documents: List[Document], db_path: str = "metadata.db"):
    """
    Create SQLite database to store document metadata.
    
    Args:
        documents: Documents to store metadata for
        db_path: Path to the SQLite database file
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            content TEXT,
            metadata TEXT
        )
    ''')
    
    # Insert data
    for doc in documents:
        cursor.execute(
            "INSERT INTO documents (source, content, metadata) VALUES (?, ?, ?)",
            (
                doc.metadata.get('source', ''),
                doc.page_content,
                str(doc.metadata)
            )
        )
    
    conn.commit()
    conn.close()
    print(f"Metadata stored in SQLite database at {db_path}")

def main():
    """Main function to create the vector database."""
    parser = argparse.ArgumentParser(description="Create vector database from text files")
    parser.add_argument("--data_dir", type=str, default="../data_txt", help="Directory containing text files")
    parser.add_argument("--persist_dir", type=str, default="chroma_db", help="Directory to persist the vector store to")
    parser.add_argument("--db_path", type=str, default="metadata.db", help="Path to SQLite database")
    parser.add_argument("--use_gpt", default="True", action="store_true", help="Use GPT for document splitting")
    args = parser.parse_args()

    # Create directories if they don't exist
    os.makedirs(args.persist_dir, exist_ok=True)
    
    # Load documents
    documents = load_documents(args.data_dir)

    # Split documents
    chunks = split_documents(documents, args.use_gpt)
    
    # Create vector store
    db = create_vector_store(chunks, args.persist_dir)
    
    # Create SQLite metadata
    create_sqlite_metadata(chunks, args.db_path)
    
    print(f"Vector database created with {len(chunks)} chunks")

if __name__ == "__main__":
    main()