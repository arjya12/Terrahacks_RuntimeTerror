"""
Mock data generators for testing MedReconcile Pro backend
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from faker import Faker

from models.user import User, UserRole, UserCreate
from models.medication import Medication, MedicationCreate, MedicationStatus, MedicationSource
from models.provider import Provider, ProviderCreate, ProviderType, ProviderStatus

fake = Faker()

# Sample medication data for realistic testing
SAMPLE_MEDICATIONS = [
    {"name": "Lisinopril", "generic": "Lisinopril", "common_dosages": ["5mg", "10mg", "20mg"]},
    {"name": "Metformin", "generic": "Metformin", "common_dosages": ["500mg", "850mg", "1000mg"]},
    {"name": "Atorvastatin", "generic": "Atorvastatin", "common_dosages": ["10mg", "20mg", "40mg", "80mg"]},
    {"name": "Amlodipine", "generic": "Amlodipine", "common_dosages": ["2.5mg", "5mg", "10mg"]},
    {"name": "Omeprazole", "generic": "Omeprazole", "common_dosages": ["20mg", "40mg"]},
    {"name": "Levothyroxine", "generic": "Levothyroxine", "common_dosages": ["25mcg", "50mcg", "75mcg", "100mcg"]},
    {"name": "Simvastatin", "generic": "Simvastatin", "common_dosages": ["10mg", "20mg", "40mg"]},
    {"name": "Hydrochlorothiazide", "generic": "Hydrochlorothiazide", "common_dosages": ["12.5mg", "25mg"]},
]

FREQUENCIES = [
    "once daily",
    "twice daily", 
    "three times daily",
    "every 12 hours",
    "every 8 hours",
    "as needed",
    "with meals",
    "at bedtime"
]

SPECIALTIES = [
    "Internal Medicine",
    "Family Medicine", 
    "Cardiology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Pharmacy",
    "Emergency Medicine"
]

PHARMACIES = [
    "CVS Pharmacy",
    "Walgreens",
    "Rite Aid",
    "Walmart Pharmacy",
    "Target Pharmacy",
    "Kroger Pharmacy",
    "Safeway Pharmacy"
]


def generate_mock_users(count: int = 10) -> List[Dict[str, Any]]:
    """Generate mock user data for testing"""
    users = []
    
    for i in range(count):
        # Generate realistic Clerk ID
        clerk_id = f"user_{fake.uuid4()[:8]}{fake.uuid4()[:8]}"
        
        # 80% patients, 20% providers
        role = UserRole.PATIENT if random.random() < 0.8 else UserRole.PROVIDER
        
        user_data = {
            "clerk_id": clerk_id,
            "email": fake.email(),
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
            "role": role,
            "is_active": True,
            "is_verified": random.choice([True, False]),
            "metadata": {
                "preferences": {
                    "notifications_enabled": random.choice([True, False]),
                    "dark_mode": random.choice([True, False]),
                    "language": "en"
                },
                "registration_source": random.choice(["mobile_app", "web", "referral"])
            },
            "created_at": fake.date_time_between(start_date='-1y', end_date='now'),
        }
        
        users.append(user_data)
    
    return users


def generate_mock_medications(users: List[Dict[str, Any]], count_per_user: int = 5) -> List[Dict[str, Any]]:
    """Generate mock medication data for testing"""
    medications = []
    
    # Filter to only patient users
    patient_users = [u for u in users if u["role"] == UserRole.PATIENT]
    
    for user in patient_users:
        user_med_count = random.randint(1, count_per_user)
        
        for _ in range(user_med_count):
            med_template = random.choice(SAMPLE_MEDICATIONS)
            dosage = random.choice(med_template["common_dosages"])
            frequency = random.choice(FREQUENCIES)
            
            # Simulate OCR confidence based on source
            source = random.choice(list(MedicationSource))
            if source == MedicationSource.OCR_SCAN:
                confidence = random.uniform(0.75, 0.98)
                field_confidences = {
                    "name": random.uniform(0.85, 0.99),
                    "dosage": random.uniform(0.70, 0.95),
                    "frequency": random.uniform(0.65, 0.90),
                    "prescriber": random.uniform(0.80, 0.95),
                    "pharmacy": random.uniform(0.85, 0.98)
                }
                ocr_raw_text = f"{med_template['name']} {dosage} {frequency}"
            else:
                confidence = 1.0
                field_confidences = {}
                ocr_raw_text = None
            
            medication_data = {
                "user_id": user["clerk_id"],  # Using clerk_id as reference
                "clerk_user_id": user["clerk_id"],
                "name": med_template["name"],
                "generic_name": med_template["generic"],
                "dosage": dosage,
                "frequency": frequency,
                "route": "oral",
                "prescriber": f"Dr. {fake.last_name()}",
                "pharmacy": random.choice(PHARMACIES),
                "prescription_date": fake.date_between(start_date='-6m', end_date='now'),
                "refills_remaining": random.randint(0, 5),
                "status": random.choice(list(MedicationStatus)),
                "source": source,
                "notes": fake.text(max_nb_chars=100) if random.random() < 0.3 else None,
                "confidence": confidence,
                "field_confidences": field_confidences,
                "ocr_raw_text": ocr_raw_text,
                "ndc_number": f"{random.randint(10000, 99999)}-{random.randint(100, 999)}-{random.randint(10, 99)}",
                "rxcui": str(random.randint(100000, 999999)),
                "interaction_warnings": [],
                "last_interaction_check": fake.date_time_between(start_date='-30d', end_date='now'),
                "created_at": fake.date_time_between(start_date='-3m', end_date='now'),
            }
            
            medications.append(medication_data)
    
    return medications


def generate_mock_providers(users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate mock provider data for testing"""
    providers = []
    
    # Filter to only provider users
    provider_users = [u for u in users if u["role"] == UserRole.PROVIDER]
    
    for user in provider_users:
        provider_type = random.choice(list(ProviderType))
        specialty = random.choice(SPECIALTIES)
        
        provider_data = {
            "user_id": user["clerk_id"],
            "clerk_user_id": user["clerk_id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
            "phone": fake.phone_number(),
            "provider_type": provider_type,
            "specialty": specialty,
            "organization": f"{fake.company()} Medical Center",
            "department": specialty,
            "npi_number": str(random.randint(1000000000, 9999999999)),
            "medical_license_number": f"MD{random.randint(100000, 999999)}",
            "license_state": fake.state_abbr(),
            "license_expiry": fake.future_date(end_date='+2y'),
            "dea_number": f"B{fake.random_letter().upper()}{random.randint(1000000, 9999999)}",
            "verification_status": random.choice(list(ProviderStatus)),
            "verification_date": fake.date_time_between(start_date='-6m', end_date='now'),
            "verified_by": "System Admin",
            "verification_notes": "Credentials verified through state licensing board",
            "address": {
                "street": fake.street_address(),
                "city": fake.city(),
                "state": fake.state_abbr(),
                "zip_code": fake.zipcode()
            },
            "metadata": {
                "board_certifications": [specialty],
                "years_of_experience": random.randint(1, 30),
                "accepts_new_patients": random.choice([True, False])
            },
            "is_active": True,
            "created_at": user["created_at"],
        }
        
        providers.append(provider_data)
    
    return providers


def generate_all_mock_data(user_count: int = 20, medications_per_user: int = 5) -> Dict[str, List[Dict[str, Any]]]:
    """Generate complete mock dataset for testing"""
    
    # Install faker if not present
    try:
        import faker
    except ImportError:
        print("Installing faker for mock data generation...")
        import subprocess
        subprocess.check_call(["pip", "install", "faker"])
        from faker import Faker
        global fake
        fake = Faker()
    
    print(f"Generating mock data: {user_count} users...")
    
    # Generate users first
    users = generate_mock_users(user_count)
    
    # Generate medications for patient users
    medications = generate_mock_medications(users, medications_per_user)
    
    # Generate provider profiles for provider users
    providers = generate_mock_providers(users)
    
    mock_data = {
        "users": users,
        "medications": medications,
        "providers": providers
    }
    
    print(f"Generated {len(users)} users, {len(medications)} medications, {len(providers)} providers")
    
    return mock_data


if __name__ == "__main__":
    # Generate and print sample data
    data = generate_all_mock_data(10, 3)
    
    print("\\n=== SAMPLE USER ===")
    print(data["users"][0])
    
    print("\\n=== SAMPLE MEDICATION ===") 
    if data["medications"]:
        print(data["medications"][0])
    
    print("\\n=== SAMPLE PROVIDER ===")
    if data["providers"]:
        print(data["providers"][0])