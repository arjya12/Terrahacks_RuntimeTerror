"""
Authentication API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any
import logging

from middleware.clerk_auth import get_current_user, optional_auth

logger = logging.getLogger(__name__)

auth_router = APIRouter(prefix="/auth", tags=["authentication"])


class AuthStatusResponse(BaseModel):
    """Response model for authentication status"""
    authenticated: bool
    user: Dict[str, Any] = None
    message: str


class UserRegistrationData(BaseModel):
    """User registration data from Clerk webhook"""
    clerk_id: str
    email: str
    first_name: str
    last_name: str
    role: str = "patient"


@auth_router.get("/status", response_model=AuthStatusResponse)
async def auth_status(user_data: Dict[str, Any] = Depends(optional_auth)):
    """
    Get current authentication status
    
    Returns user information if authenticated, otherwise returns anonymous status
    """
    if user_data:
        return AuthStatusResponse(
            authenticated=True,
            user={
                "id": user_data["user_id"],
                "email": user_data["email"],
                "role": user_data["role"],
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "is_verified": user_data["is_verified"]
            },
            message="User is authenticated"
        )
    else:
        return AuthStatusResponse(
            authenticated=False,
            message="User is not authenticated"
        )


@auth_router.get("/profile", response_model=Dict[str, Any])
async def get_profile(user_data: Dict[str, Any] = Depends(get_current_user)):
    """
    Get authenticated user's profile information
    
    Requires authentication
    """
    return {
        "id": user_data["user_id"],
        "email": user_data["email"],
        "role": user_data["role"],
        "first_name": user_data["first_name"],
        "last_name": user_data["last_name"],
        "is_verified": user_data["is_verified"],
        "display_name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
    }


@auth_router.post("/validate-token")
async def validate_token(user_data: Dict[str, Any] = Depends(get_current_user)):
    """
    Validate JWT token and return user information
    
    This endpoint can be used by the frontend to verify tokens
    """
    return {
        "valid": True,
        "user": {
            "id": user_data["user_id"],
            "email": user_data["email"],
            "role": user_data["role"],
            "first_name": user_data["first_name"],
            "last_name": user_data["last_name"],
            "is_verified": user_data["is_verified"]
        },
        "message": "Token is valid"
    }


@auth_router.post("/register-user")
async def register_user(registration_data: UserRegistrationData):
    """
    Register a new user (typically called by Clerk webhook)
    
    This endpoint would normally be secured and called by Clerk when a user signs up
    For now, we'll implement basic validation
    """
    try:
        # In a real implementation, you would:
        # 1. Validate the request is from Clerk (webhook signature)
        # 2. Store user data in MongoDB
        # 3. Set up user profile
        
        logger.info(f"New user registration: {registration_data.email}")
        
        # Mock response for now
        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "clerk_id": registration_data.clerk_id,
                "email": registration_data.email,
                "role": registration_data.role
            }
        }
        
    except Exception as e:
        logger.error(f"User registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration failed"
        )