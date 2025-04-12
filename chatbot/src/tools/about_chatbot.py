"""
This module contains implementations for answering questions about the Adam chatbot.
"""

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

class AboutAdam:
    """
    Handler for questions about the Adam chatbot.
    """
    
    def __init__(
        self,
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.7,
    ):
        """
        Initialize the AboutAdam handler.
        
        Args:
            model_name: The model to use for generation
            temperature: Temperature for generation
        """
        self.model_name = model_name
        self.temperature = temperature
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)
    
    def answer_question(
        self,
        question: str,
        language: str = "French",
        adam_presentation: str = None
    ) -> str:
        """
        Answer a question about Adam.
        
        Args:
            question: The question about Adam
            language: Language for the response
            adam_presentation: Custom presentation text (uses default if None)
            
        Returns:
            Response about Adam
        """
        if adam_presentation is None:
            from src.prompt import ADAM_PRESENTATION
            adam_presentation = ADAM_PRESENTATION
        
        # Create prompt
        prompt_template = """You are Adam and tell about yourself, 
answer to the user's questions: {question},
in this language: {language}, 
Here is your everything about you: {adam_presentation}"""
        
        prompt = ChatPromptTemplate.from_template(prompt_template)
        
        # Invoke the model
        response = prompt.format(
            adam_presentation=adam_presentation,
            question=question,
            language=language
        )
        
        result = self.llm.invoke(response)
        return result.content