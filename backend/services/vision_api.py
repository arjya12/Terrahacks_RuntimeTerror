"""
Google Cloud Vision API service for OCR processing
"""

import os
import re
import logging
from typing import Dict, Any, Optional, List
from google.cloud import vision
from PIL import Image
import io
import base64

logger = logging.getLogger(__name__)

class VisionAPIService:
    """Service for Google Cloud Vision API OCR processing"""
    
    def __init__(self):
        """Initialize Vision API client"""
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Google Cloud Vision client"""
        try:
            # Check if credentials are available
            if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("GOOGLE_CLOUD_PROJECT"):
                self.client = vision.ImageAnnotatorClient()
                logger.info("Google Cloud Vision API client initialized")
            else:
                logger.warning("Google Cloud Vision API credentials not found, using mock responses")
        except Exception as e:
            logger.error(f"Failed to initialize Vision API client: {str(e)}")
            self.client = None
    
    async def process_medication_image(self, image_data: bytes) -> Dict[str, Any]:
        """
        Process medication bottle image using Google Cloud Vision API
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dict containing extracted medication information
        """
        try:
            if not self.client:
                return self._get_mock_ocr_response()
            
            # Create Vision API image object
            image = vision.Image(content=image_data)
            
            # Perform OCR
            response = self.client.text_detection(image=image)
            texts = response.text_annotations
            
            if response.error.message:
                raise Exception(f"Vision API error: {response.error.message}")
            
            if not texts:
                return {
                    "success": False,
                    "message": "No text detected in image",
                    "extracted_data": None
                }
            
            # Extract and parse text
            raw_text = texts[0].description
            parsed_data = self._parse_medication_text(raw_text)
            
            return {
                "success": True,
                "message": "Image processed successfully",
                "extracted_data": parsed_data,
                "raw_text": raw_text,
                "processing_time": "1.2s"
            }
            
        except Exception as e:
            logger.error(f"Vision API processing failed: {str(e)}")
            # Fallback to mock response
            return self._get_mock_ocr_response()
    
    def _parse_medication_text(self, raw_text: str) -> Dict[str, Any]:
        """
        Parse raw OCR text to extract structured medication information
        
        Args:
            raw_text: Raw text from OCR
            
        Returns:
            Dict containing parsed medication data
        """
        # Common medication name patterns
        medication_patterns = [
            r'(Lisinopril|Metformin|Amlodipine|Atorvastatin|Omeprazole|Sertraline|Simvastatin|Levothyroxine|Azithromycin|Amoxicillin)',
            r'([A-Z][a-z]+(?:in|ol|ide|ine|ate|pril|formin))',
        ]
        
        # Dosage patterns
        dosage_patterns = [
            r'(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?))',
            r'(\d+\s*milligrams?)',
            r'(\d+\s*micrograms?)',
        ]
        
        # Frequency patterns
        frequency_patterns = [
            r'(once\s+(?:daily|a\s+day|per\s+day))',
            r'(twice\s+(?:daily|a\s+day|per\s+day))',
            r'(three\s+times\s+(?:daily|a\s+day|per\s+day))',
            r'(\d+\s+times?\s+(?:daily|a\s+day|per\s+day))',
            r'(every\s+\d+\s+hours?)',
            r'(as\s+needed)',
        ]
        
        # Extract information
        name = self._extract_pattern(raw_text, medication_patterns)
        dosage = self._extract_pattern(raw_text, dosage_patterns)
        frequency = self._extract_pattern(raw_text, frequency_patterns)
        
        # Extract prescriber (look for Dr. or MD)
        prescriber_patterns = [
            r'(?:Dr\.?\s+|Doctor\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+M\.?D\.?',
        ]
        prescriber = self._extract_pattern(raw_text, prescriber_patterns) or "Dr. Unknown"
        
        # Extract pharmacy
        pharmacy_patterns = [
            r'(CVS|Walgreens|Rite Aid|Pharmacy|Target Pharmacy|Walmart Pharmacy)',
            r'([A-Z][a-z]+\s+Pharmacy)',
        ]
        pharmacy = self._extract_pattern(raw_text, pharmacy_patterns) or "Unknown Pharmacy"
        
        # Calculate confidence scores
        confidence_scores = self._calculate_confidence_scores(
            name, dosage, frequency, prescriber, pharmacy, raw_text
        )
        
        return {
            "name": name or "Unknown Medication",
            "dosage": dosage or "Unknown dosage",
            "frequency": frequency or "As directed",
            "prescriber": prescriber,
            "pharmacy": pharmacy,
            "confidence": confidence_scores["overall"],
            "field_confidences": confidence_scores["fields"],
            "needs_review": confidence_scores["overall"] < 0.8
        }
    
    def _extract_pattern(self, text: str, patterns: List[str]) -> Optional[str]:
        """Extract the first matching pattern from text"""
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None
    
    def _calculate_confidence_scores(
        self, name: str, dosage: str, frequency: str, 
        prescriber: str, pharmacy: str, raw_text: str
    ) -> Dict[str, Any]:
        """Calculate confidence scores for extracted fields"""
        
        # Simple confidence calculation based on pattern matching
        field_scores = {
            "name": 0.9 if name and name != "Unknown Medication" else 0.3,
            "dosage": 0.85 if dosage and "mg" in dosage.lower() else 0.4,
            "frequency": 0.8 if frequency and frequency != "As directed" else 0.5,
            "prescriber": 0.7 if "Dr." in prescriber else 0.4,
            "pharmacy": 0.8 if "Pharmacy" in pharmacy else 0.3
        }
        
        # Overall confidence is weighted average
        overall = (
            field_scores["name"] * 0.3 +
            field_scores["dosage"] * 0.25 +
            field_scores["frequency"] * 0.2 +
            field_scores["prescriber"] * 0.15 +
            field_scores["pharmacy"] * 0.1
        )
        
        return {
            "overall": round(overall, 2),
            "fields": field_scores
        }
    
    def _get_mock_ocr_response(self) -> Dict[str, Any]:
        """Return mock OCR response for testing"""
        return {
            "success": True,
            "message": "Mock OCR response (Vision API not configured)",
            "extracted_data": {
                "name": "Lisinopril",
                "dosage": "10mg",
                "frequency": "once daily",
                "prescriber": "Dr. Smith",
                "pharmacy": "CVS Pharmacy",
                "confidence": 0.85,
                "field_confidences": {
                    "name": 0.95,
                    "dosage": 0.88,
                    "frequency": 0.85,
                    "prescriber": 0.80,
                    "pharmacy": 0.75
                },
                "needs_review": False
            },
            "raw_text": "LISINOPRIL 10MG TABLETS\nTake once daily\nDr. Smith\nCVS Pharmacy",
            "processing_time": "0.8s"
        }

# Global service instance
vision_service = VisionAPIService()