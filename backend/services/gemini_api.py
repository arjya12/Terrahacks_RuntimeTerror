"""
Google Gemini API Service for MedReconcile Pro
Handles medical document simplification using Google's Gemini AI model
"""

import logging
import json
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)

class SimplificationLevel(str, Enum):
    """Document simplification difficulty levels"""
    BASIC = "basic"           # 8th grade reading level
    INTERMEDIATE = "intermediate"  # 6th grade reading level
    SIMPLE = "simple"         # 4th grade reading level

class DocumentType(str, Enum):
    """Types of medical documents that can be simplified"""
    LAB_RESULTS = "lab_results"
    DISCHARGE_SUMMARY = "discharge_summary"
    MEDICATION_INSTRUCTIONS = "medication_instructions"
    RADIOLOGY_REPORT = "radiology_report"
    PATHOLOGY_REPORT = "pathology_report"
    CONSULTATION_NOTE = "consultation_note"
    GENERAL_MEDICAL = "general_medical"

class SimplificationResult:
    """Represents the result of document simplification"""
    
    def __init__(self,
                 original_text: str,
                 simplified_text: str,
                 confidence_score: float,
                 reading_level: str,
                 processing_time: float,
                 word_count_reduction: float,
                 key_terms_explained: List[str],
                 document_type: str = "general_medical"):
        self.original_text = original_text
        self.simplified_text = simplified_text
        self.confidence_score = confidence_score
        self.reading_level = reading_level
        self.processing_time = processing_time
        self.word_count_reduction = word_count_reduction
        self.key_terms_explained = key_terms_explained
        self.document_type = document_type
        self.timestamp = datetime.utcnow().isoformat() + "Z"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary format"""
        return {
            "original_text": self.original_text,
            "simplified_text": self.simplified_text,
            "confidence_score": self.confidence_score,
            "reading_level": self.reading_level,
            "processing_time": self.processing_time,
            "word_count_reduction": self.word_count_reduction,
            "key_terms_explained": self.key_terms_explained,
            "document_type": self.document_type,
            "timestamp": self.timestamp,
            "original_word_count": len(self.original_text.split()),
            "simplified_word_count": len(self.simplified_text.split())
        }

class GeminiAPIService:
    """Service for interacting with Google Gemini API for medical document simplification"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the Gemini API service"""
        self.api_key = api_key  # Would be loaded from environment variables
        self.session = None
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model_name = "gemini-1.5-flash"
        
        # Pre-defined prompts for different document types
        self.simplification_prompts = self._load_simplification_prompts()
        
    async def _get_session(self) -> httpx.AsyncClient:
        """Get or create HTTP session"""
        if not self.session:
            self.session = httpx.AsyncClient(
                timeout=60.0,
                headers={
                    "Content-Type": "application/json"
                }
            )
        return self.session
    
    async def simplify_medical_document(self,
                                      text: str,
                                      document_type: DocumentType = DocumentType.GENERAL_MEDICAL,
                                      simplification_level: SimplificationLevel = SimplificationLevel.INTERMEDIATE,
                                      patient_context: Optional[Dict[str, Any]] = None) -> SimplificationResult:
        """
        Simplify a medical document using Google Gemini API
        
        Args:
            text: The original medical document text
            document_type: Type of medical document
            simplification_level: Target reading difficulty level
            patient_context: Additional context about the patient (age, education level, etc.)
            
        Returns:
            SimplificationResult with the simplified text and metadata
        """
        start_time = datetime.utcnow()
        
        try:
            # Try Gemini API first
            result = await self._call_gemini_api(text, document_type, simplification_level, patient_context)
            
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            result.processing_time = processing_time
            
            logger.info(f"Successfully simplified document using Gemini API in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.warning(f"Gemini API failed: {str(e)}, falling back to rule-based simplification")
            
            # Fallback to rule-based simplification
            result = await self._fallback_simplification(text, document_type, simplification_level)
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            result.processing_time = processing_time
            
            return result
    
    async def _call_gemini_api(self,
                              text: str,
                              document_type: DocumentType,
                              simplification_level: SimplificationLevel,
                              patient_context: Optional[Dict[str, Any]] = None) -> SimplificationResult:
        """Call the actual Gemini API"""
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
        
        session = await self._get_session()
        
        # Build the prompt based on document type and simplification level
        prompt = self._build_simplification_prompt(text, document_type, simplification_level, patient_context)
        
        # Prepare the API request
        url = f"{self.base_url}/models/{self.model_name}:generateContent"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,  # Low temperature for consistent, factual output
                "topP": 0.8,
                "topK": 40,
                "maxOutputTokens": 2048,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_MEDICAL",
                    "threshold": "BLOCK_NONE"  # Allow medical content
                }
            ]
        }
        
        response = await session.post(
            url,
            json=payload,
            params={"key": self.api_key}
        )
        
        if response.status_code != 200:
            raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
        
        result_data = response.json()
        
        # Extract the simplified text from the response
        if "candidates" not in result_data or not result_data["candidates"]:
            raise Exception("No candidates in Gemini API response")
        
        candidate = result_data["candidates"][0]
        if "content" not in candidate or "parts" not in candidate["content"]:
            raise Exception("Invalid response structure from Gemini API")
        
        simplified_text = candidate["content"]["parts"][0]["text"]
        
        # Calculate metrics
        original_words = len(text.split())
        simplified_words = len(simplified_text.split())
        word_count_reduction = ((original_words - simplified_words) / original_words) * 100 if original_words > 0 else 0
        
        # Extract key terms that were explained (would be enhanced with actual parsing)
        key_terms = self._extract_explained_terms(text, simplified_text)
        
        return SimplificationResult(
            original_text=text,
            simplified_text=simplified_text,
            confidence_score=0.9,  # High confidence for Gemini API
            reading_level=self._get_reading_level_description(simplification_level),
            processing_time=0.0,  # Will be set by caller
            word_count_reduction=word_count_reduction,
            key_terms_explained=key_terms,
            document_type=document_type.value
        )
    
    async def _fallback_simplification(self,
                                     text: str,
                                     document_type: DocumentType,
                                     simplification_level: SimplificationLevel) -> SimplificationResult:
        """Fallback rule-based simplification when Gemini API is unavailable"""
        
        # Basic rule-based simplification
        simplified_text = self._apply_simplification_rules(text, simplification_level)
        
        # Calculate metrics
        original_words = len(text.split())
        simplified_words = len(simplified_text.split())
        word_count_reduction = ((original_words - simplified_words) / original_words) * 100 if original_words > 0 else 0
        
        # Mock key terms for fallback
        key_terms = ["medical terminology", "clinical abbreviations", "dosage instructions"]
        
        return SimplificationResult(
            original_text=text,
            simplified_text=simplified_text,
            confidence_score=0.6,  # Lower confidence for rule-based
            reading_level=self._get_reading_level_description(simplification_level),
            processing_time=0.0,  # Will be set by caller
            word_count_reduction=word_count_reduction,
            key_terms_explained=key_terms,
            document_type=document_type.value
        )
    
    def _build_simplification_prompt(self,
                                   text: str,
                                   document_type: DocumentType,
                                   simplification_level: SimplificationLevel,
                                   patient_context: Optional[Dict[str, Any]] = None) -> str:
        """Build the prompt for Gemini API based on document type and requirements"""
        
        base_prompt = self.simplification_prompts.get(document_type.value, self.simplification_prompts["general_medical"])
        
        # Add reading level requirements
        reading_level_instructions = {
            SimplificationLevel.BASIC: "Use an 8th grade reading level with some medical terms explained.",
            SimplificationLevel.INTERMEDIATE: "Use a 6th grade reading level with clear explanations of medical terms.",
            SimplificationLevel.SIMPLE: "Use a 4th grade reading level with simple words and short sentences."
        }
        
        # Build context from patient information
        context_info = ""
        if patient_context:
            age = patient_context.get("age")
            education = patient_context.get("education_level")
            if age:
                context_info += f"Patient age: {age}. "
            if education:
                context_info += f"Education level: {education}. "
        
        prompt = f"""
{base_prompt}

READING LEVEL REQUIREMENT: {reading_level_instructions[simplification_level]}

PATIENT CONTEXT: {context_info if context_info else "General patient population."}

ORIGINAL MEDICAL DOCUMENT:
{text}

SIMPLIFIED VERSION:
Please provide a simplified version that maintains all important medical information while making it easier to understand. Focus on:
1. Replacing complex medical terms with simpler alternatives
2. Adding brief explanations for necessary medical terminology
3. Breaking down complex sentences into shorter, clearer ones
4. Organizing information in a logical, easy-to-follow structure
5. Maintaining accuracy of all medical facts and instructions
"""
        
        return prompt
    
    def _apply_simplification_rules(self, text: str, level: SimplificationLevel) -> str:
        """Apply basic rule-based simplification as a fallback"""
        
        # Simple replacement dictionary for common medical terms
        replacements = {
            "hypertension": "high blood pressure",
            "diabetes mellitus": "diabetes",
            "myocardial infarction": "heart attack",
            "cerebrovascular accident": "stroke",
            "pneumonia": "lung infection",
            "gastroenteritis": "stomach flu",
            "hyperlipidemia": "high cholesterol",
            "bradycardia": "slow heart rate",
            "tachycardia": "fast heart rate",
            "dyspnea": "shortness of breath",
            "cephalgia": "headache",
            "pyrexia": "fever",
            "nausea": "feeling sick to your stomach",
            "vomiting": "throwing up",
            "diarrhea": "loose bowel movements",
            "constipation": "difficulty having bowel movements",
            "edema": "swelling",
            "urticaria": "hives or skin rash",
            "pruritus": "itching",
            "vertigo": "dizziness",
            "syncope": "fainting",
            "palpitations": "feeling your heartbeat",
            "angina": "chest pain",
            "dysphagia": "difficulty swallowing"
        }
        
        simplified = text
        
        # Apply replacements
        for medical_term, simple_term in replacements.items():
            simplified = simplified.replace(medical_term, simple_term)
        
        # Add explanations for remaining complex terms
        if level == SimplificationLevel.SIMPLE:
            # For simple level, add more explanations
            simplified += "\n\nKey Terms Explained:\n"
            simplified += "• If you see medical words you don't understand, ask your doctor or nurse to explain them.\n"
            simplified += "• It's important to follow all instructions exactly as written.\n"
            simplified += "• If you have questions or concerns, contact your healthcare provider."
        
        return simplified
    
    def _extract_explained_terms(self, original: str, simplified: str) -> List[str]:
        """Extract medical terms that were explained in the simplification"""
        # This is a mock implementation - in a real system, this would use NLP
        # to identify medical terms that were replaced or explained
        
        common_medical_terms = [
            "hypertension", "diabetes", "myocardial infarction", "pneumonia",
            "gastroenteritis", "hyperlipidemia", "dyspnea", "edema"
        ]
        
        explained_terms = []
        for term in common_medical_terms:
            if term in original.lower() and term not in simplified.lower():
                explained_terms.append(term)
        
        return explained_terms[:5]  # Return top 5 for brevity
    
    def _get_reading_level_description(self, level: SimplificationLevel) -> str:
        """Get human-readable description of reading level"""
        descriptions = {
            SimplificationLevel.BASIC: "8th Grade Level",
            SimplificationLevel.INTERMEDIATE: "6th Grade Level", 
            SimplificationLevel.SIMPLE: "4th Grade Level"
        }
        return descriptions.get(level, "Unknown Level")
    
    def _load_simplification_prompts(self) -> Dict[str, str]:
        """Load pre-defined prompts for different document types"""
        return {
            "lab_results": """
You are a medical communication expert specializing in simplifying laboratory results for patients.
Your goal is to make lab results understandable while maintaining accuracy and helping patients 
understand what their results mean for their health.
            """,
            
            "discharge_summary": """
You are a medical communication expert specializing in simplifying hospital discharge summaries.
Your goal is to help patients understand their hospital stay, treatment received, and what they 
need to do after leaving the hospital.
            """,
            
            "medication_instructions": """
You are a medical communication expert specializing in simplifying medication instructions.
Your goal is to make medication directions clear and easy to follow, ensuring patient safety
and medication adherence.
            """,
            
            "radiology_report": """
You are a medical communication expert specializing in simplifying radiology and imaging reports.
Your goal is to help patients understand what imaging tests were done and what the results show
about their health.
            """,
            
            "pathology_report": """
You are a medical communication expert specializing in simplifying pathology reports.
Your goal is to explain biopsy and tissue examination results in a way that patients can 
understand while being sensitive to potentially concerning findings.
            """,
            
            "consultation_note": """
You are a medical communication expert specializing in simplifying specialist consultation notes.
Your goal is to help patients understand what the specialist found and what treatment plan
was recommended.
            """,
            
            "general_medical": """
You are a medical communication expert specializing in simplifying medical documents for patients.
Your goal is to make complex medical information accessible and understandable while maintaining
accuracy and completeness of important health information.
            """
        }
    
    async def get_simplification_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent simplification history for a user (mock implementation)"""
        # In a real implementation, this would query a database
        mock_history = [
            {
                "id": "simp_001",
                "document_type": "lab_results",
                "simplified_at": "2024-12-20T10:30:00Z",
                "reading_level": "6th Grade Level",
                "confidence_score": 0.92,
                "word_count_reduction": 35.5
            },
            {
                "id": "simp_002", 
                "document_type": "medication_instructions",
                "simplified_at": "2024-12-19T15:45:00Z",
                "reading_level": "4th Grade Level",
                "confidence_score": 0.88,
                "word_count_reduction": 42.1
            }
        ]
        
        return mock_history[:limit]
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()
            self.session = None

# Global service instance
gemini_api_service = GeminiAPIService()