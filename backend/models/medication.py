"""
Medication model for MedReconcile Pro
Stores medication information with OCR confidence scores
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class MedicationStatus(str, Enum):
    """Medication status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCONTINUED = "discontinued"
    TEMPORARY = "temporary"


class MedicationSource(str, Enum):
    """Source of medication information"""
    OCR_SCAN = "ocr_scan"
    MANUAL_ENTRY = "manual_entry"
    PROVIDER_ENTRY = "provider_entry"
    EHR_IMPORT = "ehr_import"


class Medication(BaseModel):
    """Medication model with confidence tracking"""
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Associated user ID")
    clerk_user_id: str = Field(..., description="Clerk user ID for reference")
    
    # Core medication information
    name: str = Field(..., description="Medication name")
    generic_name: Optional[str] = None
    dosage: str = Field(..., description="Dosage information (e.g., '10mg')")
    frequency: str = Field(..., description="Frequency (e.g., 'twice daily')")
    route: Optional[str] = Field(None, description="Route of administration")
    
    # Prescriber and pharmacy information
    prescriber: str = Field(..., description="Prescribing healthcare provider")
    pharmacy: str = Field(..., description="Dispensing pharmacy")
    prescription_date: Optional[datetime] = None
    refills_remaining: Optional[int] = None
    
    # Status and metadata
    status: MedicationStatus = MedicationStatus.ACTIVE
    source: MedicationSource = MedicationSource.MANUAL_ENTRY
    notes: Optional[str] = None
    
    # OCR-specific fields
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="OCR confidence score")
    original_image_url: Optional[str] = None
    ocr_raw_text: Optional[str] = None
    field_confidences: Optional[Dict[str, float]] = Field(default_factory=dict)
    
    # Drug database references
    ndc_number: Optional[str] = None
    rxcui: Optional[str] = None  # RxNorm Concept Unique Identifier
    
    # Interaction tracking
    interaction_warnings: List[str] = Field(default_factory=list)
    last_interaction_check: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "user_id": "64abc123def456789",
                "clerk_user_id": "user_2abc123def456",
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
                }
            }
        }


class MedicationCreate(BaseModel):
    """Schema for creating a new medication"""
    user_id: str
    clerk_user_id: str
    name: str
    generic_name: Optional[str] = None
    dosage: str
    frequency: str
    route: Optional[str] = None
    prescriber: str
    pharmacy: str
    prescription_date: Optional[datetime] = None
    refills_remaining: Optional[int] = None
    status: MedicationStatus = MedicationStatus.ACTIVE
    source: MedicationSource = MedicationSource.MANUAL_ENTRY
    notes: Optional[str] = None
    confidence: Optional[float] = None
    original_image_url: Optional[str] = None
    ocr_raw_text: Optional[str] = None
    field_confidences: Optional[Dict[str, float]] = Field(default_factory=dict)
    ndc_number: Optional[str] = None
    rxcui: Optional[str] = None


class MedicationUpdate(BaseModel):
    """Schema for updating medication information"""
    name: Optional[str] = None
    generic_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    prescriber: Optional[str] = None
    pharmacy: Optional[str] = None
    prescription_date: Optional[datetime] = None
    refills_remaining: Optional[int] = None
    status: Optional[MedicationStatus] = None
    notes: Optional[str] = None
    confidence: Optional[float] = None
    field_confidences: Optional[Dict[str, float]] = None
    ndc_number: Optional[str] = None
    rxcui: Optional[str] = None
    interaction_warnings: Optional[List[str]] = None
    last_interaction_check: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)