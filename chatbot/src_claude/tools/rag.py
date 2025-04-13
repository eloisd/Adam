"""
This module contains implementations for RAG-related functionality.
"""

import os
import re
from typing import List, TypedDict, Any
import numpy as np
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain.schema import Document
from langchain_community.vectorstores.chroma import Chroma

class GPTSplitter:
    """
    Custom text splitter that uses GPT to create semantically meaningful chunks
    from documents.
    """
    
    def __init__(self, model_name: str = "gpt-4o-mini", **kwargs: Any) -> None:
        """
        Initialize the GPT Splitter

        Args:
            model_name: The model to use for splitting
            **kwargs: Additional arguments
        """
        self.model = ChatOpenAI(model=model_name)

        self.prompt = ChatPromptTemplate.from_template(
            "You are an expert in identifying semantic meaning of text. "
            "You wrap each chunk in <<<>>>.\n\n"
            "Example:\n"
            """Text: 
\"## TABLE DES MATIÈRES

1. Motivation
2. Types de graphes
3. Applications dans les graphes
4. Node embeddings
5. GNN

## HISTORIQUE DES GNN

- Les graphes attirent l'intérêt des chercheurs en mathématique et en informatique depuis très longtemps
- La première application concrète des réseaux de neurones aux graphes date de 1997 - A. Sperduti and A. Starita
- Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010)
  - Ces GNN tombaient dans la catégorie des réseaux récurrents (RecGNN)
  - Ils souffrent donc des mêmes problèmes à l'entraînement!
- Les GNN sont réellement devenus populaires suite à l'adaptation de la convolution par Bruna et al (2013) - ConvGNN
- Depuis, il existe des GNN exploitant tous les types d'unité: GAE, Transformeur, etc.\"\n"""
            """"Wrapped:\n
<<<## TABLE DES MATIÈRES \t 1. Motivation 2. Types de graphes 3. Applications dans les graphes 4. Node embeddings 5. GNN>>>
<<<## HISTORIQUE DES GNN \t - Les graphes attirent l'intérêt des chercheurs en mathématique et en informatique depuis très longtemps>>>
<<<## HISTORIQUE DES GNN \t - La première application concrète des réseaux de neurones aux graphes date de 1997 - A. Sperduti and A. Starita>>>
<<<## HISTORIQUE DES GNN \t - Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010) \t - Ces GNN tombaient dans la catégorie des réseaux récurrents (RecGNN)>>>
<<<## HISTORIQUE DES GNN \t - Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010) \t - Ils souffrent donc des mêmes problèmes à l'entraînement!>>>
<<<## HISTORIQUE DES GNN \t - Les GNN sont réellement devenus populaires suite à l'adaptation de la convolution par Bruna et al (2013) - ConvGNN>>>
<<<## HISTORIQUE DES GNN \t - Depuis, il existe des GNN exploitant tous les types d'unité: GAE, Transformeur, etc.>>>\n\n"""
            "Now, process the following text:\n\n"
            "{text}"
        )
        self.output_parser = StrOutputParser()
        self.chain = (
            {"text": RunnablePassthrough()}
            | self.prompt
            | self.model
            | self.output_parser
        )

    def split_text(self, text: str) -> List[str]:
        """
        Split the text into semantic chunks

        Args:
            text: The text to split

        Returns:
            List of text chunks
        """
        response = self.chain.invoke({"text": text})
        # Use regex to split properly by <<< and >>> markers
        chunks = re.findall(r'<<<(.*?)>>>', response, re.DOTALL)
        return [chunk.strip() for chunk in chunks]

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        Split a list of documents into chunks.

        Args:
            documents: List of documents to split

        Returns:
            List of documents with chunked content
        """
        chunked_docs = []
        for doc in documents:
            content = doc.page_content
            chunks = self.split_text(content)
            for chunk in chunks:
                chunked_docs.append(
                    Document(page_content=chunk, metadata=doc.metadata)
                )
        return chunked_docs


class RAG:
    """
    RAG (Retrieval-Augmented Generation) system for deep learning questions.
    """
    
    def __init__(self, 
                 data_dir: str = "data_txt", 
                 model_name: str = "gpt-4o-mini",
                 embedding_model: str = "text-embedding-3-small",
                 dimensions: int = 1536):
        """
        Initialize the RAG system.
        
        Args:
            data_dir: Directory containing text data
            model_name: LLM model to use for generation
            embedding_model: Model to use for embeddings
            dimensions: Dimensions for embeddings
        """
        self.data_dir = data_dir
        self.model_name = model_name
        self.embedding_model = embedding_model
        self.dimensions = dimensions
        self.llm = ChatOpenAI(model=model_name)
        self.embedding_function = OpenAIEmbeddings(
            model=embedding_model, 
            dimensions=dimensions
        )
        self.vectorstore = None
        self.retriever = None
        
    def create_vectorstore(self, documents: List[Document], persist_directory: str = None):
        """
        Create a vector store from the provided documents.
        
        Args:
            documents: List of documents to index
            persist_directory: Optional directory to persist the vector store to
        """
        self.vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embedding_function,
            persist_directory=persist_directory
        )
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 10})
        
    def retrieve_documents(self, query: str, k: int = 10) -> List[Document]:
        """
        Retrieve documents relevant to the query.
        
        Args:
            query: The search query
            k: Number of documents to retrieve
            
        Returns:
            List of relevant documents
        """
        if not self.retriever:
            raise ValueError("Vector store not initialized. Call create_vectorstore first.")
        
        return self.retriever.invoke(query)

    def create_rag_chain(self, prompt_template: str = None):
        """
        Create a RAG chain for question answering.
        
        Args:
            prompt_template: Optional custom prompt template
            
        Returns:
            The RAG chain
        """
        if not prompt_template:
            from src.prompt import RAG_PROMPT_TEMPLATE
            prompt_template = RAG_PROMPT_TEMPLATE
            
        prompt = ChatPromptTemplate.from_template(prompt_template)
        rag_chain = prompt | self.llm
        return rag_chain

    def answer_question(self, 
                        question: str, 
                        chat_history: List = None, 
                        k: int = 10) -> str:
        """
        Answer a question using RAG.
        
        Args:
            question: The question to answer
            chat_history: Optional chat history for context
            k: Number of documents to retrieve
            
        Returns:
            The generated answer
        """
        if not chat_history:
            chat_history = []
            
        if not self.retriever:
            raise ValueError("Vector store not initialized. Call create_vectorstore first.")
            
        # Retrieve relevant documents
        documents = self.retrieve_documents(question, k)
        
        # Create the chain
        rag_chain = self.create_rag_chain()
        
        # Generate the answer
        response = rag_chain.invoke({
            "chat_history": chat_history,
            "context": documents,
            "question": question
        })
        
        return response.content