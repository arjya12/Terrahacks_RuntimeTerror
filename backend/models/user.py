"""
User model for MedReconcile Pro
Integrates with Clerk authentication system
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration"""
    PATIENT = "patient"
    PROVIDER = "provider"
    ADMIN = "admin"


class User(BaseModel):
    """User model with Clerk integration"""
    id: Optional[str] = Field(None, alias="_id")
    clerk_id: str = Field(..., description="Clerk user ID")
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.PATIENT
    is_active: bool = True
    is_verified: bool = False
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "clerk_id": "user_2abc123def456",
                "email": "patient@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "role": "patient",
                "is_active": True,
                "is_verified": True,
                "metadata": {
                    "preferences": {
                        "notifications_enabled": True,
                        "dark_mode": False
                    }
                }
            }
        }


class UserCreate(BaseModel):
    """Schema for creating a new user"""
    clerk_id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.PATIENT
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)