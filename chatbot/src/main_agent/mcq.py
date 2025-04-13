"""
This module contains implementations for Multiple Choice Question (MCQ) generation.
"""

import json
import traceback
from typing import Dict, List, Any, Union
import pandas as pd

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage

class MCQGenerator:
    """
    Generator for Multiple Choice Questions (MCQs).
    """
    
    def __init__(
        self,
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.7,
    ):
        """
        Initialize the MCQ generator.
        
        Args:
            model_name: The model to use for generation
            temperature: Temperature for generation
        """
        self.model_name = model_name
        self.temperature = temperature
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)

    def generate_mcq(
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
        Generate MCQs based on the provided text.
        
        Args:
            text: The source text to generate questions from
            question: The specific question/request from the user
            number: Number of MCQs to generate
            subject: Subject area
            tone: Difficulty level
            language: Language for generation
            response_json_format: Template for the response format
            
        Returns:
            Dictionary containing generated MCQs
        """
        from src.prompt import MCQ_GENERATOR_TEMPLATE, RESPONSE_JSON_MCQ
        
        if response_json_format is None:
            response_json_format = RESPONSE_JSON_MCQ
        
        # Create prompt
        prompt = ChatPromptTemplate.from_template(MCQ_GENERATOR_TEMPLATE)
        
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
        raw_mcq = result.content
        
        # Try to parse the response into JSON
        try:
            # If the response has proper JSON formatting
            if "{" in raw_mcq and "}" in raw_mcq:
                # Extract JSON content (handle various formats)
                if "```json" in raw_mcq:
                    json_str = raw_mcq.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_mcq:
                    json_str = raw_mcq.split("```")[1].strip()
                else:
                    # Find the first occurrence of { and the last occurrence of }
                    start = raw_mcq.find("{")
                    end = raw_mcq.rfind("}") + 1
                    json_str = raw_mcq[start:end].strip()
                
                mcq_dict = json.loads(json_str)
                return mcq_dict
            else:
                return {"error": "Failed to parse MCQ response", "raw_response": raw_mcq}
        except Exception as e:
            print(f"Error parsing MCQ response: {e}")
            traceback.print_exc()
            return {"error": str(e), "raw_response": raw_mcq}

    def evaluate_mcq(
        self,
        quiz: str,
        subject: str = "deep learning",
        tone: str = "difficult",
        language: str = "French"
    ) -> str:
        """
        Evaluate the quality of generated MCQs.
        
        Args:
            quiz: The quiz to evaluate
            subject: Subject area
            tone: Difficulty level
            language: Language for evaluation
            
        Returns:
            Evaluation text
        """
        from src.prompt import MCQ_EVALUATION_TEMPLATE
        
        # Create prompt
        prompt = ChatPromptTemplate.from_template(MCQ_EVALUATION_TEMPLATE)
        
        # Invoke the model
        response = prompt.format(
            tone=tone,
            subject=subject,
            quiz=quiz,
            language=language
        )
        
        result = self.llm.invoke(response)
        return result.content

    def get_table_data(self, quiz_dict: Dict) -> List[Dict]:
        """
        Convert quiz dictionary to tabular format.
        
        Args:
            quiz_dict: Dictionary containing MCQs
            
        Returns:
            List of dictionaries suitable for creating a pandas DataFrame
        """
        quiz_table_data = []
        
        try:
            # Iterate over the quiz dictionary and extract the required information
            for key, value in quiz_dict.items():
                mcq = value["mcq"]
                options = " || ".join(
                    [
                        f"{option}-> {option_value}" 
                        for option, option_value in value["options"].items()
                    ]
                )
                
                correct = value["correct"]
                quiz_table_data.append({"MCQ": mcq, "Choices": options, "Correct": correct})
            
            return quiz_table_data
        
        except Exception as e:
            traceback.print_exception(type(e), e, e.__traceback__)
            return []

    def mcq_to_dataframe(self, quiz_dict: Dict) -> pd.DataFrame:
        """
        Convert quiz dictionary to pandas DataFrame.
        
        Args:
            quiz_dict: Dictionary containing MCQs
            
        Returns:
            Pandas DataFrame representation of the MCQs
        """
        table_data = self.get_table_data(quiz_dict)
        if table_data:
            df = pd.DataFrame(table_data)
            df.index = df.index + 1  # Start index from 1 instead of 0
            return df
        return pd.DataFrame()