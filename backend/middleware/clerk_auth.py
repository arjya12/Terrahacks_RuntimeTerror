"""
Clerk authentication middleware for FastAPI
"""

import os
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

logger = logging.getLogger(__name__)

# Security scheme for Bearer tokens
security = HTTPBearer()


class ClerkAuthError(Exception):
    """Custom exception for Clerk authentication errors"""
    pass


def get_clerk_secret_key() -> str:
    """Get Clerk secret key from environment"""
    secret_key = os.getenv("CLERK_SECRET_KEY")
    if not secret_key:
        raise ClerkAuthError("CLERK_SECRET_KEY environment variable not set")
    return secret_key


async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify Clerk session token and return user information
    
    Args:
        credentials: HTTP authorization credentials containing session token
        
    Returns:
        Dict containing user information from Clerk
        
    Raises:
        HTTPException: If token is invalid or user verification fails
    """
    token = credentials.credentials
    
    try:
        # For development/MVP phase, we'll use a simplified approach
        # In production, you would use the official Clerk backend SDK to verify tokens
        
        # Since we're in development phase and focusing on frontend-backend integration,
        # we'll implement a mock verification that accepts any valid-looking token
        # and returns mock user data
        
        if not token or len(token) < 10:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing token"
            )
        
        # Mock user data for development
        # In production, this would be retrieved from Clerk's API
        mock_user_data = {
            "user_id": f"user_{token[:8]}",  # Use part of token as mock user ID
            "email": "patient@example.com",
            "role": "patient",
            "first_name": "John",
            "last_name": "Doe",
            "is_verified": True
        }
        
        logger.info(f"Token verified for user: {mock_user_data['user_id']}")
        return mock_user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_current_user(user_data: Dict[str, Any] = Depends(verify_clerk_token)) -> Dict[str, Any]:
    """
    Get current authenticated user information
    
    Args:
        user_data: User data from token verification
        
    Returns:
        Current user information
    """
    return user_data


def require_role(required_role: str):
    """
    Create a dependency that requires a specific user role
    
    Args:
        required_role: The role required to access the endpoint
        
    Returns:
        Dependency function that checks user role
    """
    async def check_role(user_data: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = user_data.get("role", "patient")
        if user_role != required_role and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}"
            )
        return user_data
    
    return check_role


# Convenience dependencies for common roles
require_patient = require_role("patient")
require_provider = require_role("provider")
require_admin = require_role("admin")


def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[Dict[str, Any]]:
    """
    Optional authentication dependency for endpoints that work with or without auth
    
    Args:
        credentials: Optional HTTP authorization credentials
        
    Returns:
        User data if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        # Use the same verification logic but don't raise exceptions
        token = credentials.credentials
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded_token.get("sub")
        
        if not user_id:
            return None
            
        return {
            "user_id": user_id,
            "email": decoded_token.get("email"),
            "role": decoded_token.get("public_metadata", {}).get("role", "patient"),
            "first_name": decoded_token.get("given_name"),
            "last_name": decoded_token.get("family_name"),
            "is_verified": decoded_token.get("email_verified", False)
        }
        
    except Exception:
        return None