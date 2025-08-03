"""
Evidence-Based Medicine Service for MedReconcile Pro
Integrates with external APIs and provides clinical recommendations based on evidence
"""

import logging
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)

class EvidenceLevel(str, Enum):
    """Evidence quality levels based on medical literature standards"""
    LEVEL_1A = "1a"  # Systematic review of RCTs
    LEVEL_1B = "1b"  # Individual RCT
    LEVEL_2A = "2a"  # Systematic review of cohort studies
    LEVEL_2B = "2b"  # Individual cohort study
    LEVEL_3A = "3a"  # Systematic review of case-control studies
    LEVEL_3B = "3b"  # Individual case-control study
    LEVEL_4 = "4"    # Case series
    LEVEL_5 = "5"    # Expert opinion

class ClinicalRecommendation:
    """Represents an evidence-based clinical recommendation"""
    
    def __init__(self,
                 medication_name: str,
                 condition: str,
                 recommendation: str,
                 evidence_level: EvidenceLevel,
                 strength: str,
                 source: str,
                 references: List[str] = None,
                 contraindications: List[str] = None,
                 monitoring_requirements: List[str] = None):
        self.medication_name = medication_name
        self.condition = condition
        self.recommendation = recommendation
        self.evidence_level = evidence_level
        self.strength = strength  # Strong, Moderate, Weak
        self.source = source
        self.references = references or []
        self.contraindications = contraindications or []
        self.monitoring_requirements = monitoring_requirements or []
        self.timestamp = datetime.utcnow().isoformat() + "Z"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert recommendation to dictionary format"""
        return {
            "medication_name": self.medication_name,
            "condition": self.condition,
            "recommendation": self.recommendation,
            "evidence_level": self.evidence_level.value,
            "strength": self.strength,
            "source": self.source,
            "references": self.references,
            "contraindications": self.contraindications,
            "monitoring_requirements": self.monitoring_requirements,
            "timestamp": self.timestamp
        }

class EvidenceBasedMedicineService:
    """Service for retrieving evidence-based clinical recommendations"""
    
    def __init__(self):
        """Initialize the evidence-based medicine service"""
        self.session = None
        self.builtin_guidelines = self._load_builtin_guidelines()
        self.api_sources = self._configure_api_sources()
        
    async def _get_session(self) -> httpx.AsyncClient:
        """Get or create HTTP session"""
        if not self.session:
            self.session = httpx.AsyncClient(timeout=30.0)
        return self.session
    
    async def get_clinical_recommendations(self, 
                                         medication_name: str, 
                                         patient_conditions: List[str] = None,
                                         patient_factors: Dict[str, Any] = None) -> List[ClinicalRecommendation]:
        """
        Get evidence-based clinical recommendations for a medication
        
        Args:
            medication_name: Name of the medication
            patient_conditions: List of patient conditions/diagnoses
            patient_factors: Patient demographic and clinical factors
            
        Returns:
            List of clinical recommendations with evidence levels
        """
        recommendations = []
        
        # Try external APIs first
        external_recommendations = await self._query_external_apis(
            medication_name, patient_conditions, patient_factors
        )
        recommendations.extend(external_recommendations)
        
        # Add built-in guidelines as fallback or supplement
        builtin_recommendations = self._get_builtin_recommendations(
            medication_name, patient_conditions, patient_factors
        )
        recommendations.extend(builtin_recommendations)
        
        # Remove duplicates and prioritize by evidence level
        unique_recommendations = self._deduplicate_recommendations(recommendations)
        sorted_recommendations = self._sort_by_evidence_quality(unique_recommendations)
        
        logger.info(f"Found {len(sorted_recommendations)} recommendations for {medication_name}")
        return sorted_recommendations
    
    async def get_condition_specific_guidelines(self, 
                                              condition: str,
                                              patient_factors: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Get evidence-based treatment guidelines for a specific condition
        
        Args:
            condition: Medical condition/diagnosis
            patient_factors: Patient demographic and clinical factors
            
        Returns:
            List of treatment guidelines with evidence levels
        """
        guidelines = []
        
        # Query external APIs for condition-specific guidelines
        external_guidelines = await self._query_condition_guidelines(condition, patient_factors)
        guidelines.extend(external_guidelines)
        
        # Add built-in condition guidelines
        builtin_guidelines = self._get_builtin_condition_guidelines(condition, patient_factors)
        guidelines.extend(builtin_guidelines)
        
        return guidelines
    
    async def validate_treatment_appropriateness(self,
                                               medications: List[Dict[str, Any]],
                                               conditions: List[str],
                                               patient_factors: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Validate appropriateness of medication regimen for patient conditions
        
        Args:
            medications: List of patient medications
            conditions: List of patient conditions
            patient_factors: Patient demographic and clinical factors
            
        Returns:
            Validation results with evidence-based recommendations
        """
        validation_results = {
            "appropriate_medications": [],
            "questionable_medications": [],
            "missing_therapies": [],
            "overall_assessment": "pending"
        }
        
        for medication in medications:
            med_name = medication.get("name", "").lower()
            recommendations = await self.get_clinical_recommendations(
                med_name, conditions, patient_factors
            )
            
            # Analyze appropriateness based on recommendations
            appropriateness = self._assess_medication_appropriateness(
                medication, recommendations, conditions
            )
            
            if appropriateness["appropriate"]:
                validation_results["appropriate_medications"].append({
                    "medication": medication,
                    "supporting_evidence": appropriateness["evidence"]
                })
            else:
                validation_results["questionable_medications"].append({
                    "medication": medication,
                    "concerns": appropriateness["concerns"],
                    "alternative_recommendations": appropriateness["alternatives"]
                })
        
        # Check for missing first-line therapies
        missing_therapies = await self._identify_missing_therapies(
            conditions, medications, patient_factors
        )
        validation_results["missing_therapies"] = missing_therapies
        
        # Generate overall assessment
        validation_results["overall_assessment"] = self._generate_overall_assessment(
            validation_results
        )
        
        return validation_results
    
    async def _query_external_apis(self, 
                                 medication_name: str, 
                                 conditions: List[str] = None,
                                 patient_factors: Dict[str, Any] = None) -> List[ClinicalRecommendation]:
        """Query external evidence-based medicine APIs"""
        recommendations = []
        
        # Try each configured API source
        for api_name, api_config in self.api_sources.items():
            try:
                if api_config["enabled"]:
                    api_recommendations = await self._query_specific_api(
                        api_name, api_config, medication_name, conditions, patient_factors
                    )
                    recommendations.extend(api_recommendations)
            except Exception as e:
                logger.warning(f"Failed to query {api_name} API: {str(e)}")
                continue
        
        return recommendations
    
    async def _query_specific_api(self,
                                api_name: str,
                                api_config: Dict[str, Any],
                                medication_name: str,
                                conditions: List[str] = None,
                                patient_factors: Dict[str, Any] = None) -> List[ClinicalRecommendation]:
        """Query a specific external API"""
        recommendations = []
        
        if api_name == "uptodate":
            recommendations = await self._query_uptodate_api(
                api_config, medication_name, conditions, patient_factors
            )
        elif api_name == "dynamed":
            recommendations = await self._query_dynamed_api(
                api_config, medication_name, conditions, patient_factors
            )
        elif api_name == "cochrane":
            recommendations = await self._query_cochrane_api(
                api_config, medication_name, conditions, patient_factors
            )
        # Add more APIs as needed
        
        return recommendations
    
    async def _query_uptodate_api(self,
                                api_config: Dict[str, Any],
                                medication_name: str,
                                conditions: List[str] = None,
                                patient_factors: Dict[str, Any] = None) -> List[ClinicalRecommendation]:
        """Query UpToDate API (mock implementation)"""
        # This would be a real API integration in production
        # For now, return mock data that simulates API response
        
        mock_recommendations = []
        
        # Simulate UpToDate API response format
        if medication_name == "metformin" and conditions and "diabetes" in [c.lower() for c in conditions]:
            mock_recommendations.append(ClinicalRecommendation(
                medication_name="metformin",
                condition="Type 2 Diabetes",
                recommendation="First-line therapy for type 2 diabetes in adults. Start with 500mg twice daily with meals.",
                evidence_level=EvidenceLevel.LEVEL_1A,
                strength="Strong",
                source="UpToDate",
                references=["American Diabetes Association Guidelines 2023"],
                monitoring_requirements=["Monitor renal function", "Monitor vitamin B12 levels"],
                contraindications=["eGFR < 30 mL/min/1.73m²", "Active heart failure"]
            ))
        
        if medication_name == "lisinopril" and conditions and "hypertension" in [c.lower() for c in conditions]:
            mock_recommendations.append(ClinicalRecommendation(
                medication_name="lisinopril",
                condition="Hypertension",
                recommendation="First-line ACE inhibitor for hypertension. Start with 10mg daily.",
                evidence_level=EvidenceLevel.LEVEL_1A,
                strength="Strong",
                source="UpToDate",
                references=["ACC/AHA Hypertension Guidelines 2017"],
                monitoring_requirements=["Monitor renal function", "Monitor potassium levels"],
                contraindications=["Pregnancy", "Angioedema history"]
            ))
        
        return mock_recommendations
    
    async def _query_dynamed_api(self,
                               api_config: Dict[str, Any],
                               medication_name: str,
                               conditions: List[str] = None,
                               patient_factors: Dict[str, Any] = None) -> List[ClinicalRecommendation]:
        """Query DynaMed API (mock implementation)"""
        # Mock implementation for DynaMed API
        return []
    
    async def _query_cochrane_api(self,
                                api_config: Dict[str, Any],
                                medication_name: str,
                                conditions: List[str] = None,
                                patient_factors: Dict[str, Any] = None) -> List[ClinicalRecommendation]:
        """Query Cochrane Library API (mock implementation)"""
        # Mock implementation for Cochrane Library API
        return []
    
    async def _query_condition_guidelines(self,
                                        condition: str,
                                        patient_factors: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Query external APIs for condition-specific guidelines"""
        # Mock implementation for condition guidelines
        return []
    
    def _get_builtin_recommendations(self,
                                   medication_name: str,
                                   conditions: List[str] = None,
                                   patient_factors: Dict[str, Any] = None) -> List[ClinicalRecommendation]:
        """Get recommendations from built-in clinical guidelines"""
        recommendations = []
        
        medication_lower = medication_name.lower()
        
        if medication_lower in self.builtin_guidelines:
            guidelines = self.builtin_guidelines[medication_lower]
            
            for guideline in guidelines:
                # Check if conditions match
                if conditions and guideline.get("conditions"):
                    condition_match = any(
                        cond.lower() in [c.lower() for c in conditions]
                        for cond in guideline["conditions"]
                    )
                    if not condition_match:
                        continue
                
                # Check patient factors if specified
                if patient_factors and guideline.get("patient_criteria"):
                    if not self._meets_patient_criteria(patient_factors, guideline["patient_criteria"]):
                        continue
                
                recommendation = ClinicalRecommendation(
                    medication_name=medication_name,
                    condition=guideline.get("primary_condition", "General"),
                    recommendation=guideline["recommendation"],
                    evidence_level=EvidenceLevel(guideline["evidence_level"]),
                    strength=guideline["strength"],
                    source="Built-in Clinical Guidelines",
                    references=guideline.get("references", []),
                    contraindications=guideline.get("contraindications", []),
                    monitoring_requirements=guideline.get("monitoring", [])
                )
                recommendations.append(recommendation)
        
        return recommendations
    
    def _get_builtin_condition_guidelines(self,
                                        condition: str,
                                        patient_factors: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get built-in guidelines for specific conditions"""
        # Implementation for built-in condition guidelines
        return []
    
    def _meets_patient_criteria(self, 
                              patient_factors: Dict[str, Any], 
                              criteria: Dict[str, Any]) -> bool:
        """Check if patient meets specific criteria"""
        if "min_age" in criteria and patient_factors.get("age", 0) < criteria["min_age"]:
            return False
        if "max_age" in criteria and patient_factors.get("age", 999) > criteria["max_age"]:
            return False
        if "required_conditions" in criteria:
            # Implementation for checking required conditions
            pass
        
        return True
    
    def _assess_medication_appropriateness(self,
                                         medication: Dict[str, Any],
                                         recommendations: List[ClinicalRecommendation],
                                         conditions: List[str]) -> Dict[str, Any]:
        """Assess medication appropriateness based on recommendations"""
        if not recommendations:
            return {
                "appropriate": True,  # Default to appropriate if no specific guidance
                "evidence": [],
                "concerns": [],
                "alternatives": []
            }
        
        # Find strongest supporting evidence
        supporting_evidence = [
            rec for rec in recommendations 
            if any(cond.lower() in rec.condition.lower() for cond in conditions)
        ]
        
        if supporting_evidence:
            return {
                "appropriate": True,
                "evidence": [rec.to_dict() for rec in supporting_evidence],
                "concerns": [],
                "alternatives": []
            }
        
        return {
            "appropriate": False,
            "evidence": [],
            "concerns": ["No evidence-based indication found for current conditions"],
            "alternatives": []
        }
    
    async def _identify_missing_therapies(self,
                                        conditions: List[str],
                                        current_medications: List[Dict[str, Any]],
                                        patient_factors: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Identify missing first-line therapies for patient conditions"""
        missing_therapies = []
        
        current_med_names = [med.get("name", "").lower() for med in current_medications]
        
        # Check for missing therapies by condition
        for condition in conditions:
            condition_lower = condition.lower()
            
            if "diabetes" in condition_lower:
                if "metformin" not in current_med_names:
                    missing_therapies.append({
                        "condition": condition,
                        "recommended_medication": "Metformin",
                        "evidence_level": "1a",
                        "reason": "First-line therapy for type 2 diabetes"
                    })
            
            if "hypertension" in condition_lower:
                ace_inhibitors = ["lisinopril", "enalapril", "captopril"]
                if not any(med in current_med_names for med in ace_inhibitors):
                    missing_therapies.append({
                        "condition": condition,
                        "recommended_medication": "ACE inhibitor (e.g., Lisinopril)",
                        "evidence_level": "1a",
                        "reason": "First-line therapy for hypertension"
                    })
        
        return missing_therapies
    
    def _generate_overall_assessment(self, validation_results: Dict[str, Any]) -> str:
        """Generate overall assessment of medication regimen"""
        appropriate_count = len(validation_results["appropriate_medications"])
        questionable_count = len(validation_results["questionable_medications"])
        missing_count = len(validation_results["missing_therapies"])
        
        if questionable_count == 0 and missing_count == 0:
            return "Excellent - All medications are evidence-based and appropriate"
        elif questionable_count <= 1 and missing_count <= 1:
            return "Good - Minor optimization opportunities identified"
        elif questionable_count <= 2 or missing_count <= 2:
            return "Fair - Several optimization opportunities identified"
        else:
            return "Needs Review - Multiple concerns identified requiring attention"
    
    def _deduplicate_recommendations(self, 
                                   recommendations: List[ClinicalRecommendation]) -> List[ClinicalRecommendation]:
        """Remove duplicate recommendations, keeping highest quality evidence"""
        unique_recs = {}
        
        for rec in recommendations:
            key = f"{rec.medication_name}_{rec.condition}"
            if key not in unique_recs or self._is_higher_quality_evidence(rec, unique_recs[key]):
                unique_recs[key] = rec
        
        return list(unique_recs.values())
    
    def _sort_by_evidence_quality(self, 
                                recommendations: List[ClinicalRecommendation]) -> List[ClinicalRecommendation]:
        """Sort recommendations by evidence quality (highest first)"""
        evidence_order = {
            EvidenceLevel.LEVEL_1A: 1,
            EvidenceLevel.LEVEL_1B: 2,
            EvidenceLevel.LEVEL_2A: 3,
            EvidenceLevel.LEVEL_2B: 4,
            EvidenceLevel.LEVEL_3A: 5,
            EvidenceLevel.LEVEL_3B: 6,
            EvidenceLevel.LEVEL_4: 7,
            EvidenceLevel.LEVEL_5: 8
        }
        
        return sorted(recommendations, key=lambda x: evidence_order.get(x.evidence_level, 9))
    
    def _is_higher_quality_evidence(self, 
                                  new_rec: ClinicalRecommendation, 
                                  existing_rec: ClinicalRecommendation) -> bool:
        """Check if new recommendation has higher quality evidence"""
        evidence_order = {
            EvidenceLevel.LEVEL_1A: 1,
            EvidenceLevel.LEVEL_1B: 2,
            EvidenceLevel.LEVEL_2A: 3,
            EvidenceLevel.LEVEL_2B: 4,
            EvidenceLevel.LEVEL_3A: 5,
            EvidenceLevel.LEVEL_3B: 6,
            EvidenceLevel.LEVEL_4: 7,
            EvidenceLevel.LEVEL_5: 8
        }
        
        new_order = evidence_order.get(new_rec.evidence_level, 9)
        existing_order = evidence_order.get(existing_rec.evidence_level, 9)
        
        return new_order < existing_order
    
    def _configure_api_sources(self) -> Dict[str, Any]:
        """Configure external API sources"""
        return {
            "uptodate": {
                "enabled": True,  # Would be False in production without API key
                "base_url": "https://api.uptodate.com",
                "api_key": None  # Would be loaded from environment
            },
            "dynamed": {
                "enabled": False,
                "base_url": "https://api.dynamed.com",
                "api_key": None
            },
            "cochrane": {
                "enabled": False,
                "base_url": "https://api.cochranelibrary.com",
                "api_key": None
            }
        }
    
    def _load_builtin_guidelines(self) -> Dict[str, Any]:
        """Load built-in clinical guidelines"""
        return {
            "metformin": [
                {
                    "primary_condition": "Type 2 Diabetes",
                    "conditions": ["diabetes", "type 2 diabetes", "t2dm"],
                    "recommendation": "First-line therapy for type 2 diabetes. Start with 500mg twice daily with meals, titrate gradually to minimize GI side effects.",
                    "evidence_level": "1a",
                    "strength": "Strong",
                    "references": ["ADA Standards of Medical Care in Diabetes 2023"],
                    "contraindications": ["eGFR < 30 mL/min/1.73m²", "Acute or chronic metabolic acidosis"],
                    "monitoring": ["Monitor renal function every 3-6 months", "Monitor vitamin B12 annually"],
                    "patient_criteria": {"min_age": 18}
                }
            ],
            "lisinopril": [
                {
                    "primary_condition": "Hypertension",
                    "conditions": ["hypertension", "high blood pressure"],
                    "recommendation": "First-line ACE inhibitor for hypertension. Start with 10mg daily, titrate up to 40mg daily as needed.",
                    "evidence_level": "1a",
                    "strength": "Strong",
                    "references": ["2017 ACC/AHA High Blood Pressure Guidelines"],
                    "contraindications": ["Pregnancy", "History of angioedema", "Bilateral renal artery stenosis"],
                    "monitoring": ["Monitor renal function and potassium within 1-2 weeks of initiation"],
                    "patient_criteria": {"min_age": 18}
                }
            ],
            "atorvastatin": [
                {
                    "primary_condition": "Hyperlipidemia",
                    "conditions": ["hyperlipidemia", "high cholesterol", "dyslipidemia"],
                    "recommendation": "High-intensity statin for cardiovascular risk reduction. Start with 20mg daily, may increase to 40-80mg based on response.",
                    "evidence_level": "1a",
                    "strength": "Strong",
                    "references": ["2018 AHA/ACC Cholesterol Guidelines"],
                    "contraindications": ["Active liver disease", "Pregnancy"],
                    "monitoring": ["Monitor liver enzymes at baseline and 12 weeks", "Monitor for muscle symptoms"],
                    "patient_criteria": {"min_age": 18}
                }
            ]
        }
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()
            self.session = None

# Global service instance
evidence_based_medicine_service = EvidenceBasedMedicineService()