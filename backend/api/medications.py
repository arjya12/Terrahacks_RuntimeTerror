"""
Medication management API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

from middleware.clerk_auth import get_current_user, require_provider
from models.medication import Medication, MedicationCreate, MedicationUpdate, MedicationStatus, MedicationSource
from services.vision_api import vision_service
from services.rxnav_api import rxnav_service

logger = logging.getLogger(__name__)

medications_router = APIRouter(prefix="/medications", tags=["medications"])


@medications_router.get("/", response_model=List[Dict[str, Any]])
async def get_user_medications(
    status_filter: Optional[str] = None,
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get all medications for the current user
    
    Args:
        status_filter: Optional filter by medication status (active, inactive, discontinued)
    """
    user_id = user_data["user_id"]
    
    # Mock medication data - in real implementation, query from MongoDB
    mock_medications = [
        {
            "id": "med_001",
            "user_id": user_id,
            "name": "Lisinopril",
            "generic_name": "Lisinopril",
            "dosage": "10mg",
            "frequency": "once daily",
            "route": "oral",
            "prescriber": "Dr. Smith",
            "pharmacy": "CVS Pharmacy",
            "status": "active",
            "source": "ocr_scan",
            "confidence": 0.95,
            "notes": "Take in the morning",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        },
        {
            "id": "med_002",
            "user_id": user_id,
            "name": "Metformin",
            "generic_name": "Metformin",
            "dosage": "500mg",
            "frequency": "twice daily",
            "route": "oral",
            "prescriber": "Dr. Johnson",
            "pharmacy": "Walgreens",
            "status": "active",
            "source": "manual_entry",
            "confidence": 1.0,
            "notes": "Take with meals",
            "created_at": "2024-01-20T14:22:00Z",
            "updated_at": "2024-01-20T14:22:00Z"
        },
        {
            "id": "med_003",
            "user_id": user_id,
            "name": "Atorvastatin",
            "generic_name": "Atorvastatin",
            "dosage": "20mg",
            "frequency": "once daily",
            "route": "oral",
            "prescriber": "Dr. Chen",
            "pharmacy": "CVS Pharmacy",
            "status": "discontinued",
            "source": "ocr_scan",
            "confidence": 0.88,
            "notes": "Stopped due to side effects",
            "created_at": "2024-01-10T09:15:00Z",
            "updated_at": "2024-01-25T16:45:00Z"
        }
    ]
    
    # Apply status filter if provided
    if status_filter:
        mock_medications = [med for med in mock_medications if med["status"] == status_filter]
    
    logger.info(f"Retrieved {len(mock_medications)} medications for user {user_id}")
    return mock_medications


@medications_router.post("/", response_model=Dict[str, Any])
async def create_medication(
    medication_data: Dict[str, Any],
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new medication entry
    """
    try:
        user_id = user_data["user_id"]
        
        # Validate required fields
        required_fields = ["name", "dosage", "frequency", "prescriber", "pharmacy"]
        for field in required_fields:
            if field not in medication_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Validate medication name using RxNav API
        validation_result = await rxnav_service.validate_medication(medication_data["name"])
        
        # Create medication with user context and validation results
        new_medication = {
            "id": f"med_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "user_id": user_id,
            "clerk_user_id": user_id,
            "name": medication_data["name"],
            "generic_name": medication_data.get("generic_name"),
            "dosage": medication_data["dosage"],
            "frequency": medication_data["frequency"],
            "route": medication_data.get("route", "oral"),
            "prescriber": medication_data["prescriber"],
            "pharmacy": medication_data["pharmacy"],
            "status": medication_data.get("status", "active"),
            "source": medication_data.get("source", "manual_entry"),
            "confidence": medication_data.get("confidence", 1.0),
            "notes": medication_data.get("notes"),
            "rxcui": validation_result.get("rxcui") if validation_result.get("valid") else None,
            "validation_status": "validated" if validation_result.get("valid") else "unvalidated",
            "validation_warnings": [] if validation_result.get("valid") else [validation_result.get("message", "Unknown validation issue")],
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # In real implementation: save to MongoDB
        logger.info(f"Created medication {new_medication['id']} for user {user_id}")
        
        return {
            "success": True,
            "message": "Medication created successfully",
            "medication": new_medication
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Medication creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create medication"
        )


@medications_router.get("/{medication_id}", response_model=Dict[str, Any])
async def get_medication(
    medication_id: str,
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a specific medication by ID
    """
    user_id = user_data["user_id"]
    
    # Mock medication data - in real implementation, query from MongoDB
    if medication_id == "med_001":
        medication = {
            "id": medication_id,
            "user_id": user_id,
            "name": "Lisinopril",
            "generic_name": "Lisinopril",
            "dosage": "10mg",
            "frequency": "once daily",
            "route": "oral",
            "prescriber": "Dr. Smith",
            "pharmacy": "CVS Pharmacy",
            "status": "active",
            "source": "ocr_scan",
            "confidence": 0.95,
            "field_confidences": {
                "name": 0.98,
                "dosage": 0.92,
                "frequency": 0.90
            },
            "notes": "Take in the morning",
            "interaction_warnings": [],
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
        return medication
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )


@medications_router.put("/{medication_id}", response_model=Dict[str, Any])
async def update_medication(
    medication_id: str,
    update_data: Dict[str, Any],
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a specific medication
    """
    try:
        user_id = user_data["user_id"]
        
        # In real implementation: verify medication belongs to user and update in MongoDB
        
        # Mock update response
        updated_medication = {
            "id": medication_id,
            "user_id": user_id,
            "name": update_data.get("name", "Lisinopril"),
            "dosage": update_data.get("dosage", "10mg"),
            "frequency": update_data.get("frequency", "once daily"),
            "prescriber": update_data.get("prescriber", "Dr. Smith"),
            "pharmacy": update_data.get("pharmacy", "CVS Pharmacy"),
            "status": update_data.get("status", "active"),
            "notes": update_data.get("notes"),
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        logger.info(f"Updated medication {medication_id} for user {user_id}")
        
        return {
            "success": True,
            "message": "Medication updated successfully",
            "medication": updated_medication
        }
        
    except Exception as e:
        logger.error(f"Medication update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update medication"
        )


@medications_router.delete("/{medication_id}")
async def delete_medication(
    medication_id: str,
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a specific medication
    """
    try:
        user_id = user_data["user_id"]
        
        # In real implementation: verify medication belongs to user and delete from MongoDB
        
        logger.info(f"Deleted medication {medication_id} for user {user_id}")
        
        return {
            "success": True,
            "message": "Medication deleted successfully"
        }
        
    except Exception as e:
        logger.error(f"Medication deletion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete medication"
        )


@medications_router.post("/scan", response_model=Dict[str, Any])
async def scan_medication_bottle(
    image: UploadFile = File(...),
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upload and process a pill bottle image for OCR scanning using Google Cloud Vision API
    """
    try:
        user_id = user_data["user_id"]
        
        # Validate file type
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Validate file size (max 10MB)
        image_data = await image.read()
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file too large (max 10MB)"
            )
        
        # Process image with Google Cloud Vision API
        ocr_result = await vision_service.process_medication_image(image_data)
        
        if not ocr_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ocr_result["message"]
            )
        
        # Add metadata
        ocr_result["user_id"] = user_id
        ocr_result["image_size"] = len(image_data)
        ocr_result["image_type"] = image.content_type
        ocr_result["timestamp"] = datetime.utcnow().isoformat() + "Z"
        
        logger.info(f"Processed pill bottle scan for user {user_id} - confidence: {ocr_result['extracted_data']['confidence']}")
        return ocr_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image processing failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process image"
        )


@medications_router.get("/{medication_id}/interactions", response_model=Dict[str, Any])
async def check_medication_interactions(
    medication_id: str,
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Check for drug interactions with a specific medication using RxNav API
    """
    try:
        user_id = user_data["user_id"]
        
        # In a real implementation, we would:
        # 1. Get the medication by ID from database
        # 2. Get all other user medications from database
        # 3. Extract RxCUIs for all medications
        # 4. Use RxNav API to check interactions
        
        # For now, using mock data to simulate the process
        # This would be replaced with actual database queries
        mock_user_medications = [
            {"id": "med_001", "name": "Lisinopril", "rxcui": "29046"},
            {"id": "med_002", "name": "Metformin", "rxcui": "6809"},
            {"id": "med_003", "name": "Amlodipine", "rxcui": "17767"}
        ]
        
        # Find the target medication
        target_med = None
        for med in mock_user_medications:
            if med["id"] == medication_id:
                target_med = med
                break
        
        if not target_med:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medication not found"
            )
        
        # Get RxCUIs for interaction checking
        rxcui_list = [med["rxcui"] for med in mock_user_medications if med["rxcui"]]
        
        if len(rxcui_list) < 2:
            return {
                "medication_id": medication_id,
                "medication_name": target_med["name"],
                "interactions_found": 0,
                "interactions": [],
                "message": "Need at least 2 medications to check interactions",
                "last_checked": datetime.utcnow().isoformat() + "Z"
            }
        
        # Use RxNav API to check interactions
        interaction_result = await rxnav_service.check_drug_interactions(rxcui_list)
        
        # Format response
        response = {
            "medication_id": medication_id,
            "medication_name": target_med["name"],
            "interactions_found": interaction_result["interactions_found"],
            "interactions": interaction_result["interactions"],
            "severity_summary": interaction_result.get("severity_summary", {}),
            "checked_medications": interaction_result["checked_medications"],
            "last_checked": datetime.utcnow().isoformat() + "Z"
        }
        
        logger.info(f"Checked interactions for medication {medication_id} - found {interaction_result['interactions_found']} interactions")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Interaction check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check interactions"
        )


@medications_router.get("/interactions/check-all", response_model=Dict[str, Any])
async def check_all_medication_interactions(
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Check for drug interactions among all user medications
    """
    try:
        user_id = user_data["user_id"]
        
        # In a real implementation, get all user medications from database
        mock_user_medications = [
            {"id": "med_001", "name": "Lisinopril", "rxcui": "29046"},
            {"id": "med_002", "name": "Metformin", "rxcui": "6809"},
            {"id": "med_003", "name": "Amlodipine", "rxcui": "17767"}
        ]
        
        # Get RxCUIs for all medications
        rxcui_list = [med["rxcui"] for med in mock_user_medications if med["rxcui"]]
        
        if len(rxcui_list) < 2:
            return {
                "user_id": user_id,
                "total_medications": len(mock_user_medications),
                "interactions_found": 0,
                "interactions": [],
                "message": "Need at least 2 medications to check interactions",
                "last_checked": datetime.utcnow().isoformat() + "Z"
            }
        
        # Use RxNav API to check interactions
        interaction_result = await rxnav_service.check_drug_interactions(rxcui_list)
        
        # Format response
        response = {
            "user_id": user_id,
            "total_medications": len(mock_user_medications),
            "medications_checked": [
                {"id": med["id"], "name": med["name"], "rxcui": med["rxcui"]} 
                for med in mock_user_medications if med["rxcui"]
            ],
            "interactions_found": interaction_result["interactions_found"],
            "interactions": interaction_result["interactions"],
            "severity_summary": interaction_result.get("severity_summary", {}),
            "recommendations": _generate_interaction_recommendations(interaction_result["interactions"]),
            "last_checked": datetime.utcnow().isoformat() + "Z"
        }
        
        logger.info(f"Checked all interactions for user {user_id} - found {interaction_result['interactions_found']} interactions")
        return response
        
    except Exception as e:
        logger.error(f"Bulk interaction check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check interactions"
        )


def _generate_interaction_recommendations(interactions: List[Dict[str, Any]]) -> List[str]:
    """Generate recommendations based on drug interactions"""
    recommendations = []
    
    high_severity_count = sum(1 for i in interactions if i.get("severity") == "high")
    moderate_severity_count = sum(1 for i in interactions if i.get("severity") == "moderate")
    
    if high_severity_count > 0:
        recommendations.append(f"⚠️ {high_severity_count} high-severity interaction(s) found. Consult your healthcare provider immediately.")
    
    if moderate_severity_count > 0:
        recommendations.append(f"⚡ {moderate_severity_count} moderate interaction(s) found. Monitor for side effects and discuss with your provider.")
    
    if len(interactions) > 0:
        recommendations.append("📋 Review all medications with your pharmacist or healthcare provider.")
        recommendations.append("🕐 Take medications at different times if recommended by your provider.")
    
    return recommendations