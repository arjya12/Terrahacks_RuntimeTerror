"""
User management API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
import logging

from middleware.clerk_auth import get_current_user, require_admin, require_provider
from models.user import User, UserCreate, UserUpdate, UserRole

logger = logging.getLogger(__name__)

users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.get("/me", response_model=Dict[str, Any])
async def get_current_user_profile(user_data: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current user's detailed profile information
    """
    return {
        "id": user_data["user_id"],
        "email": user_data["email"],
        "role": user_data["role"],
        "first_name": user_data["first_name"],
        "last_name": user_data["last_name"],
        "is_verified": user_data["is_verified"],
        "display_name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
        "preferences": {
            "notifications_enabled": True,
            "dark_mode": False,
            "language": "en"
        }
    }


@users_router.put("/me", response_model=Dict[str, Any])
async def update_current_user_profile(
    update_data: Dict[str, Any],
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update current user's profile information
    
    Allows users to update their own profile data
    """
    try:
        # In a real implementation, you would:
        # 1. Validate the update data
        # 2. Update the user record in MongoDB
        # 3. Sync changes with Clerk if necessary
        
        allowed_updates = ["first_name", "last_name", "preferences"]
        filtered_updates = {k: v for k, v in update_data.items() if k in allowed_updates}
        
        logger.info(f"User profile update for {user_data['user_id']}: {filtered_updates}")
        
        # Mock response - in real implementation, return updated user data from database
        return {
            "id": user_data["user_id"],
            "email": user_data["email"],
            "role": user_data["role"],
            "first_name": filtered_updates.get("first_name", user_data["first_name"]),
            "last_name": filtered_updates.get("last_name", user_data["last_name"]),
            "is_verified": user_data["is_verified"],
            "preferences": filtered_updates.get("preferences", {}),
            "message": "Profile updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Profile update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )


@users_router.get("/role-info", response_model=Dict[str, Any])
async def get_user_role_info(user_data: Dict[str, Any] = Depends(get_current_user)):
    """
    Get role-specific information for the current user
    """
    role = user_data.get("role", "patient")
    
    role_info = {
        "role": role,
        "permissions": [],
        "features": []
    }
    
    if role == "patient":
        role_info.update({
            "permissions": ["view_own_medications", "scan_medications", "share_with_providers"],
            "features": ["medication_list", "pill_bottle_scanning", "provider_sharing"],
            "description": "Patient account with access to personal medication management"
        })
    elif role == "provider":
        role_info.update({
            "permissions": ["view_shared_medications", "clinical_decision_support", "patient_interaction"],
            "features": ["patient_medication_review", "interaction_alerts", "clinical_tools"],
            "description": "Healthcare provider account with clinical decision support"
        })
    elif role == "admin":
        role_info.update({
            "permissions": ["user_management", "system_administration", "audit_access"],
            "features": ["user_administration", "system_monitoring", "audit_trails"],
            "description": "Administrator account with full system access"
        })
    
    return role_info


@users_router.get("/providers", response_model=List[Dict[str, Any]])
async def list_providers(user_data: Dict[str, Any] = Depends(get_current_user)):
    """
    Get list of verified healthcare providers
    
    Available to all authenticated users for provider selection
    """
    # Mock provider data - in real implementation, query from MongoDB
    mock_providers = [
        {
            "id": "provider_001",
            "name": "Dr. Sarah Johnson",
            "specialty": "Internal Medicine",
            "organization": "City General Hospital",
            "verification_status": "verified",
            "accepts_new_patients": True
        },
        {
            "id": "provider_002", 
            "name": "Dr. Michael Chen",
            "specialty": "Cardiology",
            "organization": "Heart Care Center",
            "verification_status": "verified",
            "accepts_new_patients": True
        },
        {
            "id": "provider_003",
            "name": "Dr. Lisa Rodriguez",
            "specialty": "Family Medicine", 
            "organization": "Community Health Clinic",
            "verification_status": "verified",
            "accepts_new_patients": False
        }
    ]
    
    return mock_providers


@users_router.get("/{user_id}", response_model=Dict[str, Any])
async def get_user_by_id(
    user_id: str,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    Get user information by ID (admin only)
    """
    # Mock user data - in real implementation, query from MongoDB
    if user_id == "user_123":
        return {
            "id": user_id,
            "email": "patient@example.com",
            "role": "patient",
            "first_name": "John",
            "last_name": "Doe",
            "is_verified": True,
            "created_at": "2024-01-15T10:30:00Z",
            "last_active": "2024-02-01T14:22:00Z"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )