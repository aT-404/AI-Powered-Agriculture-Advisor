import os
import logging
from google import genai
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)

class DiagnosisResult(BaseModel):
    is_crop: bool
    is_healthy: bool
    disease_name: Optional[str]
    severity: Optional[str]
    treatment: Optional[str]
    confidence: float

class VisionDiagnosisService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY is not set. Vision Diagnosis will not work.")
            
    def diagnose_image(self, image_path: str) -> dict:
        if not self.client:
            raise ValueError("GEMINI_API_KEY is not configured on the server.")
            
        try:
            # Upload file using the Files API
            myfile = self.client.files.upload(file=image_path)
            
            prompt = (
                "You are an expert plant pathologist and agronomist. "
                "Analyze this image and identify if it is a crop/plant. "
                "If it is a crop, determine if it is healthy or diseased. "
                "If diseased, identify the disease name, its severity (Low, Medium, High), "
                "and recommend a treatment plan (fertilizers, pesticides, or organic remedies). "
                "Respond strictly according to the requested JSON schema."
            )
            
            result = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[myfile, prompt],
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': DiagnosisResult,
                },
            )
            
            # Delete the file from Gemini servers after processing
            try:
                self.client.files.delete(name=myfile.name)
            except Exception as e:
                logger.warning(f"Failed to delete file from Gemini: {e}")
                
            return result.text # Since response_mime_type is JSON, text contains JSON string.
            
        except Exception as e:
            logger.exception(f"Gemini vision diagnosis failed: {e}")
            raise

vision_diagnosis_service = VisionDiagnosisService()
