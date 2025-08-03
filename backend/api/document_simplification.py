"""
Document Simplification API Endpoints for MedReconcile Pro
Handles medical document uploads and AI-powered simplification
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import json
import base64

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator

from ..services.gemini_api import (
    gemini_api_service, 
    DocumentType, 
    SimplificationLevel,
    SimplificationResult
)

logger = logging.getLogger(__name__)

# Create router for document simplification endpoints
router = APIRouter(prefix="/documents", tags=["document_simplification"])

# Request/Response Models
class SimplificationRequest(BaseModel):
    """Request model for document simplification"""
    text: str = Field(..., min_length=10, max_length=50000, description="Medical document text to simplify")
    document_type: DocumentType = Field(default=DocumentType.GENERAL_MEDICAL, description="Type of medical document")
    simplification_level: SimplificationLevel = Field(default=SimplificationLevel.INTERMEDIATE, description="Target reading level")
    patient_context: Optional[Dict[str, Any]] = Field(default=None, description="Patient context for personalization")
    
    @validator("text")
    def validate_text_content(cls, v):
        """Validate that text contains meaningful content"""
        if not v or v.strip() == "":
            raise ValueError("Document text cannot be empty")
        if len(v.strip()) < 10:
            raise ValueError("Document text must be at least 10 characters long")
        return v.strip()

class SimplificationResponse(BaseModel):
    """Response model for document simplification"""
    success: bool
    simplification_id: str
    original_text: str
    simplified_text: str
    metadata: Dict[str, Any]
    processing_info: Dict[str, Any]
    timestamp: str

class DocumentUploadResponse(BaseModel):
    """Response model for document upload"""
    success: bool
    document_id: str
    filename: str
    file_size: int
    file_type: str
    extracted_text: str
    message: str
    timestamp: str

class SimplificationHistoryResponse(BaseModel):
    """Response model for simplification history"""
    success: bool
    total_count: int
    simplifications: List[Dict[str, Any]]
    
# Utility Functions
def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from uploaded file"""
    try:
        # For now, assume text files. In production, would handle PDF, DOCX, etc.
        if filename.lower().endswith('.txt'):
            return file_content.decode('utf-8')
        elif filename.lower().endswith('.json'):
            # Handle JSON format (for testing)
            data = json.loads(file_content.decode('utf-8'))
            return data.get('text', str(data))
        else:
            # Try to decode as text
            return file_content.decode('utf-8', errors='ignore')
    except Exception as e:
        logger.error(f"Failed to extract text from file {filename}: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract text from file: {str(e)}"
        )

def generate_simplification_id() -> str:
    """Generate unique simplification ID"""
    from uuid import uuid4
    return f"simp_{uuid4().hex[:12]}"

def generate_document_id() -> str:
    """Generate unique document ID"""
    from uuid import uuid4
    return f"doc_{uuid4().hex[:12]}"

# API Endpoints

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(..., description="Medical document file to upload"),
    document_type: DocumentType = Form(default=DocumentType.GENERAL_MEDICAL),
    user_id: Optional[str] = Form(default=None)
):
    """
    Upload a medical document for processing
    
    Accepts various file formats and extracts text content for simplification.
    Supported formats: .txt, .json (for testing), and other text-based formats.
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file size (limit to 10MB)
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum size is 10MB."
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file provided")
        
        # Extract text from file
        extracted_text = extract_text_from_file(file_content, file.filename)
        
        if len(extracted_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Document must contain at least 10 characters of text"
            )
        
        # Generate document ID
        document_id = generate_document_id()
        
        # In production, would save to database
        logger.info(f"Document uploaded: {document_id}, size: {file_size} bytes, type: {document_type}")
        
        return DocumentUploadResponse(
            success=True,
            document_id=document_id,
            filename=file.filename,
            file_size=file_size,
            file_type=file.content_type or "unknown",
            extracted_text=extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
            message="Document uploaded and text extracted successfully",
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process uploaded document: {str(e)}"
        )

@router.post("/simplify", response_model=SimplificationResponse)
async def simplify_document(request: SimplificationRequest, user_id: Optional[str] = None):
    """
    Simplify medical document text using AI
    
    Takes medical document text and returns a simplified version
    tailored to the specified reading level and patient context.
    """
    try:
        # Validate request
        if len(request.text.strip()) > 50000:
            raise HTTPException(
                status_code=400,
                detail="Document text too long. Maximum length is 50,000 characters."
            )
        
        # Call Gemini API service
        logger.info(f"Starting simplification for {len(request.text)} characters, type: {request.document_type}, level: {request.simplification_level}")
        
        result = await gemini_api_service.simplify_medical_document(
            text=request.text,
            document_type=request.document_type,
            simplification_level=request.simplification_level,
            patient_context=request.patient_context
        )
        
        # Generate simplification ID
        simplification_id = generate_simplification_id()
        
        # Prepare response
        response = SimplificationResponse(
            success=True,
            simplification_id=simplification_id,
            original_text=result.original_text,
            simplified_text=result.simplified_text,
            metadata={
                "confidence_score": result.confidence_score,
                "reading_level": result.reading_level,
                "document_type": result.document_type,
                "key_terms_explained": result.key_terms_explained,
                "word_count_reduction": result.word_count_reduction,
                "original_word_count": len(result.original_text.split()),
                "simplified_word_count": len(result.simplified_text.split())
            },
            processing_info={
                "processing_time": result.processing_time,
                "simplification_level": request.simplification_level.value,
                "patient_context_used": request.patient_context is not None,
                "user_id": user_id
            },
            timestamp=result.timestamp
        )
        
        logger.info(f"Simplification completed: {simplification_id}, confidence: {result.confidence_score}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to simplify document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to simplify document: {str(e)}"
        )

@router.post("/simplify-file", response_model=SimplificationResponse)
async def simplify_uploaded_file(
    file: UploadFile = File(...),
    document_type: DocumentType = Form(default=DocumentType.GENERAL_MEDICAL),
    simplification_level: SimplificationLevel = Form(default=SimplificationLevel.INTERMEDIATE),
    patient_age: Optional[int] = Form(default=None),
    patient_education_level: Optional[str] = Form(default=None),
    user_id: Optional[str] = Form(default=None)
):
    """
    Upload and simplify a document in one step
    
    Combines document upload and simplification into a single endpoint
    for convenience and efficiency.
    """
    try:
        # Upload and extract text
        file_content = await file.read()
        extracted_text = extract_text_from_file(file_content, file.filename or "unknown")
        
        # Build patient context
        patient_context = {}
        if patient_age:
            patient_context["age"] = patient_age
        if patient_education_level:
            patient_context["education_level"] = patient_education_level
        
        # Create simplification request
        simplification_request = SimplificationRequest(
            text=extracted_text,
            document_type=document_type,
            simplification_level=simplification_level,
            patient_context=patient_context if patient_context else None
        )
        
        # Simplify the document
        return await simplify_document(simplification_request, user_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to simplify uploaded file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process and simplify uploaded file: {str(e)}"
        )

@router.get("/simplifications/{simplification_id}")
async def get_simplification_result(simplification_id: str, user_id: Optional[str] = None):
    """
    Retrieve a specific simplification result by ID
    
    Returns the full simplification result including original text,
    simplified text, and all metadata.
    """
    try:
        # In production, would query database by simplification_id
        # For now, return mock data
        
        if not simplification_id.startswith("simp_"):
            raise HTTPException(status_code=400, detail="Invalid simplification ID format")
        
        # Mock result
        mock_result = {
            "simplification_id": simplification_id,
            "original_text": "Patient presents with acute myocardial infarction...",
            "simplified_text": "The patient had a heart attack...",
            "metadata": {
                "confidence_score": 0.9,
                "reading_level": "6th Grade Level",
                "document_type": "general_medical",
                "key_terms_explained": ["myocardial infarction", "acute"],
                "word_count_reduction": 25.5
            },
            "created_at": "2024-12-20T10:30:00Z",
            "user_id": user_id
        }
        
        return JSONResponse(content={
            "success": True,
            "result": mock_result
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve simplification result: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve simplification result: {str(e)}"
        )

@router.get("/history", response_model=SimplificationHistoryResponse)
async def get_simplification_history(
    user_id: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    document_type: Optional[DocumentType] = None
):
    """
    Get simplification history for a user
    
    Returns a paginated list of previous simplifications with metadata.
    Can be filtered by document type.
    """
    try:
        if limit > 100:
            limit = 100  # Cap at 100 results
        
        # In production, would query database
        # For now, return mock data
        mock_history = await gemini_api_service.get_simplification_history(user_id or "default_user", limit)
        
        # Filter by document type if specified
        if document_type:
            mock_history = [h for h in mock_history if h["document_type"] == document_type.value]
        
        # Apply offset
        total_count = len(mock_history)
        paginated_history = mock_history[offset:offset + limit]
        
        return SimplificationHistoryResponse(
            success=True,
            total_count=total_count,
            simplifications=paginated_history
        )
        
    except Exception as e:
        logger.error(f"Failed to retrieve simplification history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve simplification history: {str(e)}"
        )

@router.get("/document-types")
async def get_supported_document_types():
    """
    Get list of supported document types for simplification
    
    Returns available document types with descriptions.
    """
    try:
        document_types = []
        for doc_type in DocumentType:
            description_map = {
                DocumentType.LAB_RESULTS: "Laboratory test results and blood work reports",
                DocumentType.DISCHARGE_SUMMARY: "Hospital discharge summaries and care instructions",
                DocumentType.MEDICATION_INSTRUCTIONS: "Prescription instructions and medication guides",
                DocumentType.RADIOLOGY_REPORT: "X-ray, MRI, CT scan, and other imaging reports",
                DocumentType.PATHOLOGY_REPORT: "Biopsy and tissue examination results",
                DocumentType.CONSULTATION_NOTE: "Specialist consultation notes and recommendations",
                DocumentType.GENERAL_MEDICAL: "General medical documents and health information"
            }
            
            document_types.append({
                "type": doc_type.value,
                "name": doc_type.value.replace("_", " ").title(),
                "description": description_map.get(doc_type, "Medical document")
            })
        
        return JSONResponse(content={
            "success": True,
            "document_types": document_types
        })
        
    except Exception as e:
        logger.error(f"Failed to get document types: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve document types: {str(e)}"
        )

@router.get("/simplification-levels")
async def get_simplification_levels():
    """
    Get available simplification levels
    
    Returns the different reading levels available for document simplification.
    """
    try:
        levels = []
        for level in SimplificationLevel:
            level_info = {
                SimplificationLevel.BASIC: {
                    "name": "Basic",
                    "reading_level": "8th Grade",
                    "description": "Suitable for most adults, some medical terms explained"
                },
                SimplificationLevel.INTERMEDIATE: {
                    "name": "Intermediate", 
                    "reading_level": "6th Grade",
                    "description": "Clear explanations of medical terms, easier to read"
                },
                SimplificationLevel.SIMPLE: {
                    "name": "Simple",
                    "reading_level": "4th Grade", 
                    "description": "Very simple language, short sentences, extensive explanations"
                }
            }
            
            info = level_info.get(level, {})
            levels.append({
                "level": level.value,
                **info
            })
        
        return JSONResponse(content={
            "success": True,
            "simplification_levels": levels
        })
        
    except Exception as e:
        logger.error(f"Failed to get simplification levels: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve simplification levels: {str(e)}"
        )

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for document simplification service"""
    try:
        # Test Gemini API service connection (mock)
        service_status = "operational"
        
        return JSONResponse(content={
            "success": True,
            "service": "document_simplification",
            "status": service_status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "features": {
                "document_upload": True,
                "text_simplification": True,
                "multiple_document_types": True,
                "reading_level_options": True,
                "simplification_history": True
            }
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "service": "document_simplification", 
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )