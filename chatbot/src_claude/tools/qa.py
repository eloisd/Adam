"""
This module contains implementations for Q&A question generation.
"""

import json
import traceback
from typing import Dict, List, Any, Union
import pandas as pd

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage

class QAGenerator:
    """
    Generator for Question & Answer pairs for student development.
    """
    
    def __init__(
        self,
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.7,
    ):
        """
        Initialize the QA generator.
        
        Args:
            model_name: The model to use for generation
            temperature: Temperature for generation
        """
        self.model_name = model_name
        self.temperature = temperature
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)

    def generate_qa(
        self,
        text: str,
        question: str,
        number: int = 3,
        subject: str = "deep learning",
        tone: str = "difficult",
        language: str = "French",
        response_json_format: Dict = None
    ) -> Dict:
        """
        Generate Q&A pairs based on the provided text.
        
        Args:
            text: The source text to generate questions from
            question: The specific question/request from the user
            number: Number of Q&A pairs to generate
            subject: Subject area
            tone: Difficulty level
            language: Language for generation
            response_json_format: Template for the response format
            
        Returns:
            Dictionary containing generated Q&A pairs
        """
        from src.prompt import QA_GENERATOR_TEMPLATE, RESPONSE_JSON_QA
        
        if response_json_format is None:
            response_json_format = RESPONSE_JSON_QA
        
        # Create prompt
        prompt = ChatPromptTemplate.from_template(QA_GENERATOR_TEMPLATE)
        
        # Invoke the model
        response = prompt.format(
            text=text,
            number=number,
            subject=subject,
            tone=tone,
            response_json=json.dumps(response_json_format),
            question=question,
            language=language
        )
        
        result = self.llm.invoke(response)
        
        # Clean the response if needed
        raw_qa = result.content
        
        # Try to parse the response into JSON
        try:
            # If the response has proper JSON formatting
            if "{" in raw_qa and "}" in raw_qa:
                # Extract JSON content (handle various formats)
                if "```json" in raw_qa:
                    json_str = raw_qa.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_qa:
                    json_str = raw_qa.split("```")[1].strip()
                else:
                    # Find the first occurrence of { and the last occurrence of }
                    start = raw_qa.find("{")
                    end = raw_qa.rfind("}") + 1
                    json_str = raw_qa[start:end].strip()
                
                qa_dict = json.loads(json_str)
                return qa_dict
            else:
                return {"error": "Failed to parse QA response", "raw_response": raw_qa}
        except Exception as e:
            print(f"Error parsing QA response: {e}")
            traceback.print_exc()
            return {"error": str(e), "raw_response": raw_qa}

    def evaluate_qa(
        self,
        quiz: str,
        subject: str = "deep learning",
        tone: str = "difficult",
        language: str = "French"
    ) -> str:
        """
        Evaluate the quality of generated Q&A pairs.
        
        Args:
            quiz: The Q&A quiz to evaluate
            subject: Subject area
            tone: Difficulty level
            language: Language for evaluation
            
        Returns:
            Evaluation text
        """
        from src.prompt import QA_EVALUATION_TEMPLATE
        
        # Create prompt
        prompt = ChatPromptTemplate.from_template(QA_EVALUATION_TEMPLATE)
        
        # Invoke the model
        response = prompt.format(
            tone=tone,
            subject=subject,
            quiz=quiz,
            language=language
        )
        
        result = self.llm.invoke(response)
        return result.content

    def get_table_data(self, qa_dict: Dict) -> List[Dict]:
        """
        Convert Q&A dictionary to tabular format.
        
        Args:
            qa_dict: Dictionary containing Q&A pairs
            
        Returns:
            List of dictionaries suitable for creating a pandas DataFrame
        """
        qa_table_data = []
        
        try:
            # Iterate over the quiz dictionary and extract the required information
            for key, value in qa_dict.items():
                question = value["question"]
                answer = value["correct"]
                
                qa_table_data.append({"Question": question, "Answer": answer})
            
            return qa_table_data
        
        except Exception as e:
            traceback.print_exception(type(e), e, e.__traceback__)
            return []

    def qa_to_dataframe(self, qa_dict: Dict) -> pd.DataFrame:
        """
        Convert Q&A dictionary to pandas DataFrame.
        
        Args:
            qa_dict: Dictionary containing Q&A pairs
            
        Returns:
            Pandas DataFrame representation of the Q&A pairs
        """
        table_data = self.get_table_data(qa_dict)
        if table_data:
            df = pd.DataFrame(table_data)
            df.index = df.index + 1  # Start index from 1 instead of 0
            return df
        return pd.DataFrame()