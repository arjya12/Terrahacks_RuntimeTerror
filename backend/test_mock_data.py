#!/usr/bin/env python3
"""
Test script for mock data generation
Run this to verify Phase 1 setup is working correctly
"""

import sys
import json
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from mock_data.generators import generate_all_mock_data
    print("✅ Successfully imported mock data generators")
except ImportError as e:
    print(f"❌ Failed to import mock data generators: {e}")
    sys.exit(1)

def test_mock_data_generation():
    """Test mock data generation functionality"""
    print("🧪 Testing mock data generation...")
    
    try:
        # Generate small dataset for testing
        mock_data = generate_all_mock_data(user_count=5, medications_per_user=3)
        
        # Validate data structure
        assert "users" in mock_data, "Missing users in mock data"
        assert "medications" in mock_data, "Missing medications in mock data" 
        assert "providers" in mock_data, "Missing providers in mock data"
        
        users = mock_data["users"]
        medications = mock_data["medications"]
        providers = mock_data["providers"]
        
        # Validate data content
        assert len(users) == 5, f"Expected 5 users, got {len(users)}"
        assert len(medications) > 0, "No medications generated"
        assert len(providers) > 0, "No providers generated"
        
        # Validate user structure
        sample_user = users[0]
        required_user_fields = ["clerk_id", "email", "first_name", "last_name", "role"]
        for field in required_user_fields:
            assert field in sample_user, f"Missing required user field: {field}"
        
        # Validate medication structure
        if medications:
            sample_med = medications[0]
            required_med_fields = ["user_id", "name", "dosage", "frequency", "prescriber"]
            for field in required_med_fields:
                assert field in sample_med, f"Missing required medication field: {field}"
        
        # Validate provider structure
        if providers:
            sample_provider = providers[0]
            required_provider_fields = ["user_id", "first_name", "last_name", "provider_type"]
            for field in required_provider_fields:
                assert field in sample_provider, f"Missing required provider field: {field}"
        
        print("✅ Mock data generation test passed!")
        print(f"   Generated: {len(users)} users, {len(medications)} medications, {len(providers)} providers")
        
        return True
        
    except Exception as e:
        print(f"❌ Mock data generation test failed: {e}")
        return False

def test_fastapi_import():
    """Test FastAPI and other dependencies are properly installed"""
    print("🧪 Testing FastAPI and dependency imports...")
    
    try:
        import fastapi
        print(f"✅ FastAPI imported successfully (version: {fastapi.__version__})")
        
        import uvicorn
        print("✅ Uvicorn imported successfully")
        
        import pymongo
        print("✅ PyMongo imported successfully")
        
        import pydantic
        print(f"✅ Pydantic imported successfully (version: {pydantic.__version__})")
        
        return True
        
    except ImportError as e:
        print(f"❌ Dependency import failed: {e}")
        return False

def test_models_import():
    """Test that all model classes can be imported"""
    print("🧪 Testing model imports...")
    
    try:
        from models.user import User, UserRole, UserCreate, UserUpdate
        print("✅ User models imported successfully")
        
        from models.medication import Medication, MedicationCreate, MedicationUpdate, MedicationStatus
        print("✅ Medication models imported successfully")
        
        from models.provider import Provider, ProviderCreate, ProviderUpdate, ProviderType
        print("✅ Provider models imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"❌ Model import failed: {e}")
        return False

def main():
    """Run all Phase 1 tests"""
    print("🚀 Running Phase 1 setup tests...\n")
    
    tests = [
        ("FastAPI Dependencies", test_fastapi_import),
        ("Model Imports", test_models_import), 
        ("Mock Data Generation", test_mock_data_generation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} test:")
        if test_func():
            passed += 1
        print("-" * 50)
    
    print(f"\n🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Phase 1 setup completed successfully!")
        print("✅ All dependencies installed")
        print("✅ All models defined correctly")
        print("✅ Mock data generation working")
        print("\n🚀 Ready to proceed to Phase 2!")
        return True
    else:
        print(f"❌ {total - passed} tests failed. Please fix issues before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)