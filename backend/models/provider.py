"""
Provider model for MedReconcile Pro
Healthcare provider information with credential verification
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ProviderType(str, Enum):
    """Healthcare provider type enumeration"""
    PHYSICIAN = "physician"
    NURSE = "nurse"
    PHARMACIST = "pharmacist"
    PHYSICIAN_ASSISTANT = "physician_assistant"
    NURSE_PRACTITIONER = "nurse_practitioner"
    OTHER = "other"


class ProviderStatus(str, Enum):
    """Provider verification status"""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class Provider(BaseModel):
    """Healthcare provider model"""
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Associated user ID")
    clerk_user_id: str = Field(..., description="Clerk user ID")
    
    # Basic information
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    
    # Professional information
    provider_type: ProviderType
    specialty: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    
    # Credentials
    npi_number: Optional[str] = Field(None, description="National Provider Identifier")
    medical_license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None
    dea_number: Optional[str] = Field(None, description="Drug Enforcement Administration number")
    
    # Verification
    verification_status: ProviderStatus = ProviderStatus.PENDING
    verification_date: Optional[datetime] = None
    verified_by: Optional[str] = None
    verification_notes: Optional[str] = None
    
    # Address information
    address: Optional[Dict[str, str]] = Field(default_factory=dict)
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    is_active: bool = True
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "user_id": "64abc123def456789",
                "clerk_user_id": "user_2abc123def456",
                "first_name": "Dr. Sarah",
                "last_name": "Johnson",
                "email": "dr.johnson@hospital.com",
                "phone": "+1-555-0123",
                "provider_type": "physician",
                "specialty": "Internal Medicine",
                "organization": "City General Hospital",
                "department": "Internal Medicine",
                "npi_number": "1234567890",
                "medical_license_number": "MD123456",
                "license_state": "CA",
                "verification_status": "verified",
                "address": {
                    "street": "123 Medical Plaza",
                    "city": "San Francisco",
                    "state": "CA",
                    "zip_code": "94102"
                }
            }
        }


class ProviderCreate(BaseModel):
    """Schema for creating a new provider"""
    user_id: str
    clerk_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    provider_type: ProviderType
    specialty: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    npi_number: Optional[str] = None
    medical_license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None
    dea_number: Optional[str] = None
    address: Optional[Dict[str, str]] = Field(default_factory=dict)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ProviderUpdate(BaseModel):
    """Schema for updating provider information"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    provider_type: Optional[ProviderType] = None
    specialty: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    npi_number: Optional[str] = None
    medical_license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None
    dea_number: Optional[str] = None
    verification_status: Optional[ProviderStatus] = None
    verification_date: Optional[datetime] = None
    verified_by: Optional[str] = None
    verification_notes: Optional[str] = None
    address: Optional[Dict[str, str]] = None
    metadata: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)