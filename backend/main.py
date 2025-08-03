"""
MedReconcile Pro Backend API
FastAPI application for medication reconciliation system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os

# Import API routers
from api.auth import auth_router
from api.users import users_router
from api.medications import medications_router

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    print("🚀 Starting MedReconcile Pro Backend API...")
    print("📋 Available endpoints:")
    print("   • Authentication: /auth/*")
    print("   • Users: /users/*")
    print("   • Medications: /medications/*")
    yield
    print("📴 Shutting down MedReconcile Pro Backend API...")

# Initialize FastAPI app
app = FastAPI(
    title="MedReconcile Pro API",
    description="AI-powered medication reconciliation system backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(medications_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "MedReconcile Pro API is running", 
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users", 
            "medications": "/api/v1/medications",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "MedReconcile Pro Backend",
        "version": "1.0.0",
        "features": [
            "Clerk Authentication",
            "User Management",
            "Medication CRUD",
            "Image Upload",
            "Role-based Access"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )