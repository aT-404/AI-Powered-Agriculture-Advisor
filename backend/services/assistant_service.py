import os
import logging
from google import genai

logger = logging.getLogger(__name__)

class AssistantService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY is not set. Assistant will not work.")
            
    def get_response(self, message: str, history: list = None) -> str:
        if not self.client:
            raise ValueError("GEMINI_API_KEY is not configured on the server.")
            
        try:
            # Build history if provided
            contents = []
            if history:
                for h in history:
                    contents.append({"role": h["role"], "parts": [{"text": h["text"]}]})
            
            contents.append({"role": "user", "parts": [{"text": message}]})
            
            # System instructions
            system_instruction = (
                "You are an expert agricultural assistant named 'AgriAI'. "
                "You help farmers by providing advice on crop selection, disease management, "
                "weather impacts, and general farming best practices. "
                "Keep your answers concise, practical, and easy to understand for a farmer. "
                "Do not use overly complex academic jargon unless necessary."
            )
            
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config={
                    'system_instruction': system_instruction
                }
            )
            
            return response.text
        except Exception as e:
            logger.exception(f"Assistant generation failed: {e}")
            raise

assistant_service = AssistantService()
