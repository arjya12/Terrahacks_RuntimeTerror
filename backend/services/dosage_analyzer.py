"""
Dosage Analysis Service for MedReconcile Pro
Analyzes medication dosages based on patient-specific factors
"""

import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)

class DosageUnit(str, Enum):
    """Standard dosage units"""
    MG = "mg"
    MCG = "mcg"
    G = "g"
    ML = "ml"
    UNITS = "units"
    MEQ = "mEq"

class DosageRecommendation:
    """Represents a dosage recommendation based on patient factors"""
    
    def __init__(self, 
                 medication_name: str,
                 current_dose: float,
                 recommended_dose: float,
                 unit: str,
                 adjustment_reason: str,
                 adjustment_factor: float,
                 confidence: float = 0.8):
        self.medication_name = medication_name
        self.current_dose = current_dose
        self.recommended_dose = recommended_dose
        self.unit = unit
        self.adjustment_reason = adjustment_reason
        self.adjustment_factor = adjustment_factor
        self.confidence = confidence
        self.timestamp = datetime.utcnow().isoformat() + "Z"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert recommendation to dictionary format"""
        return {
            "medication_name": self.medication_name,
            "current_dose": self.current_dose,
            "recommended_dose": self.recommended_dose,
            "unit": self.unit,
            "adjustment_reason": self.adjustment_reason,
            "adjustment_factor": self.adjustment_factor,
            "confidence": self.confidence,
            "needs_adjustment": abs(self.current_dose - self.recommended_dose) > 0.1,
            "percentage_change": ((self.recommended_dose - self.current_dose) / self.current_dose) * 100 if self.current_dose > 0 else 0,
            "timestamp": self.timestamp
        }

class DosageAnalyzer:
    """Analyzes medication dosages based on patient-specific factors"""
    
    def __init__(self):
        """Initialize dosage analyzer with reference data"""
        self.standard_dosages = self._load_standard_dosages()
        self.renal_adjustments = self._load_renal_adjustments()
        self.hepatic_adjustments = self._load_hepatic_adjustments()
        self.age_adjustments = self._load_age_adjustments()
        self.weight_based_dosing = self._load_weight_based_dosing()
        
    def analyze_dosage(self, 
                      medication: Dict[str, Any], 
                      patient_factors: Dict[str, Any]) -> DosageRecommendation:
        """
        Analyze a medication dosage based on patient factors
        
        Args:
            medication: Medication data including name, dosage, frequency
            patient_factors: Patient factors affecting dosing (age, weight, creatinine, etc.)
            
        Returns:
            DosageRecommendation with analysis results
        """
        medication_name = medication.get("name", "").lower()
        current_dosage_str = medication.get("dosage", "")
        
        # Parse current dosage
        current_dose, unit = self._parse_dosage(current_dosage_str)
        if current_dose is None:
            logger.warning(f"Could not parse dosage: {current_dosage_str}")
            return self._create_no_recommendation(medication_name, current_dosage_str)
        
        # Get standard dosage range
        standard_range = self.standard_dosages.get(medication_name)
        if not standard_range:
            logger.info(f"No standard dosage data available for {medication_name}")
            return self._create_no_recommendation(medication_name, current_dosage_str)
        
        # Calculate recommended dose based on patient factors
        recommended_dose = self._calculate_patient_specific_dose(
            medication_name, current_dose, patient_factors
        )
        
        # Determine adjustment reason
        adjustment_reason = self._determine_adjustment_reason(
            medication_name, patient_factors, recommended_dose, current_dose
        )
        
        # Calculate adjustment factor
        adjustment_factor = recommended_dose / current_dose if current_dose > 0 else 1.0
        
        # Calculate confidence based on available patient data
        confidence = self._calculate_confidence(patient_factors, medication_name)
        
        return DosageRecommendation(
            medication_name=medication_name,
            current_dose=current_dose,
            recommended_dose=recommended_dose,
            unit=unit,
            adjustment_reason=adjustment_reason,
            adjustment_factor=adjustment_factor,
            confidence=confidence
        )
    
    def analyze_medication_list(self, 
                              medications: List[Dict[str, Any]], 
                              patient_factors: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze dosages for a complete medication list
        
        Args:
            medications: List of medication data
            patient_factors: Patient factors affecting dosing
            
        Returns:
            Comprehensive dosage analysis results
        """
        recommendations = []
        total_adjustments_needed = 0
        
        for medication in medications:
            recommendation = self.analyze_dosage(medication, patient_factors)
            recommendations.append(recommendation.to_dict())
            
            if recommendation.to_dict()["needs_adjustment"]:
                total_adjustments_needed += 1
        
        # Generate summary
        summary = self._generate_dosage_summary(recommendations, patient_factors)
        
        return {
            "patient_id": patient_factors.get("user_id"),
            "analysis_timestamp": datetime.utcnow().isoformat() + "Z",
            "total_medications": len(medications),
            "adjustments_needed": total_adjustments_needed,
            "patient_factors": patient_factors,
            "recommendations": recommendations,
            "summary": summary
        }
    
    def _parse_dosage(self, dosage_str: str) -> Tuple[Optional[float], str]:
        """Parse dosage string to extract numeric value and unit"""
        if not dosage_str:
            return None, ""
        
        # Clean up the dosage string
        dosage_clean = dosage_str.lower().strip()
        
        # Regular expression to match dose and unit
        # Matches patterns like: "10mg", "2.5 mg", "1000 mcg", "5 ml"
        pattern = r'(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?|meq|iu)'
        match = re.search(pattern, dosage_clean)
        
        if match:
            dose = float(match.group(1))
            unit = match.group(2)
            
            # Standardize units
            if unit in ['unit', 'units']:
                unit = 'units'
            elif unit == 'iu':
                unit = 'units'
                
            return dose, unit
        
        return None, ""
    
    def _calculate_patient_specific_dose(self, 
                                       medication_name: str, 
                                       current_dose: float, 
                                       patient_factors: Dict[str, Any]) -> float:
        """Calculate patient-specific dose based on individual factors"""
        recommended_dose = current_dose
        
        # Age-based adjustments
        if "age" in patient_factors:
            age_factor = self._get_age_adjustment_factor(medication_name, patient_factors["age"])
            recommended_dose *= age_factor
        
        # Weight-based dosing
        if "weight_kg" in patient_factors and medication_name in self.weight_based_dosing:
            weight_based_dose = self._calculate_weight_based_dose(
                medication_name, patient_factors["weight_kg"]
            )
            if weight_based_dose:
                recommended_dose = weight_based_dose
        
        # Renal function adjustments
        if "creatinine_clearance" in patient_factors:
            renal_factor = self._get_renal_adjustment_factor(
                medication_name, patient_factors["creatinine_clearance"]
            )
            recommended_dose *= renal_factor
        
        # Hepatic function adjustments
        if "liver_function" in patient_factors:
            hepatic_factor = self._get_hepatic_adjustment_factor(
                medication_name, patient_factors["liver_function"]
            )
            recommended_dose *= hepatic_factor
        
        # Ensure dose stays within safe limits
        return self._apply_safety_limits(medication_name, recommended_dose)
    
    def _get_age_adjustment_factor(self, medication_name: str, age: int) -> float:
        """Get age-based dose adjustment factor"""
        age_rules = self.age_adjustments.get(medication_name, {})
        
        if age >= 65:
            return age_rules.get("elderly_factor", 1.0)
        elif age < 18:
            return age_rules.get("pediatric_factor", 1.0)
        
        return 1.0
    
    def _calculate_weight_based_dose(self, medication_name: str, weight_kg: float) -> Optional[float]:
        """Calculate weight-based dose"""
        weight_rules = self.weight_based_dosing.get(medication_name)
        if not weight_rules:
            return None
        
        dose_per_kg = weight_rules.get("dose_per_kg", 0)
        max_dose = weight_rules.get("max_dose")
        
        calculated_dose = dose_per_kg * weight_kg
        
        if max_dose and calculated_dose > max_dose:
            calculated_dose = max_dose
        
        return calculated_dose
    
    def _get_renal_adjustment_factor(self, medication_name: str, creatinine_clearance: float) -> float:
        """Get renal function-based dose adjustment factor"""
        renal_rules = self.renal_adjustments.get(medication_name, {})
        
        if creatinine_clearance < 30:
            return renal_rules.get("severe_impairment", 0.25)
        elif creatinine_clearance < 60:
            return renal_rules.get("moderate_impairment", 0.5)
        elif creatinine_clearance < 90:
            return renal_rules.get("mild_impairment", 0.75)
        
        return 1.0
    
    def _get_hepatic_adjustment_factor(self, medication_name: str, liver_function: str) -> float:
        """Get hepatic function-based dose adjustment factor"""
        hepatic_rules = self.hepatic_adjustments.get(medication_name, {})
        
        liver_function_lower = liver_function.lower()
        
        if "severe" in liver_function_lower:
            return hepatic_rules.get("severe_impairment", 0.25)
        elif "moderate" in liver_function_lower:
            return hepatic_rules.get("moderate_impairment", 0.5)
        elif "mild" in liver_function_lower:
            return hepatic_rules.get("mild_impairment", 0.75)
        
        return 1.0
    
    def _apply_safety_limits(self, medication_name: str, dose: float) -> float:
        """Apply safety limits to prevent dangerous dosing"""
        limits = self.standard_dosages.get(medication_name, {})
        
        min_dose = limits.get("min_dose", 0)
        max_dose = limits.get("max_dose", float('inf'))
        
        if dose < min_dose:
            return min_dose
        elif dose > max_dose:
            return max_dose
        
        return dose
    
    def _determine_adjustment_reason(self, 
                                   medication_name: str, 
                                   patient_factors: Dict[str, Any], 
                                   recommended_dose: float, 
                                   current_dose: float) -> str:
        """Determine the primary reason for dose adjustment"""
        if abs(recommended_dose - current_dose) < 0.1:
            return "No adjustment needed"
        
        reasons = []
        
        if "age" in patient_factors:
            age = patient_factors["age"]
            if age >= 65:
                reasons.append("elderly patient")
            elif age < 18:
                reasons.append("pediatric patient")
        
        if "creatinine_clearance" in patient_factors:
            ccl = patient_factors["creatinine_clearance"]
            if ccl < 60:
                reasons.append("reduced kidney function")
        
        if "liver_function" in patient_factors:
            liver = patient_factors["liver_function"].lower()
            if "impair" in liver:
                reasons.append("liver dysfunction")
        
        if "weight_kg" in patient_factors and medication_name in self.weight_based_dosing:
            reasons.append("weight-based dosing")
        
        if not reasons:
            return "Standard dose optimization"
        
        return f"Adjustment for {', '.join(reasons)}"
    
    def _calculate_confidence(self, patient_factors: Dict[str, Any], medication_name: str) -> float:
        """Calculate confidence level based on available patient data"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on available data
        if "age" in patient_factors:
            confidence += 0.1
        if "weight_kg" in patient_factors:
            confidence += 0.1
        if "creatinine_clearance" in patient_factors:
            confidence += 0.15
        if "liver_function" in patient_factors:
            confidence += 0.1
        
        # Increase confidence if we have specific dosing data for this medication
        if medication_name in self.standard_dosages:
            confidence += 0.05
        
        return min(confidence, 1.0)
    
    def _generate_dosage_summary(self, 
                               recommendations: List[Dict[str, Any]], 
                               patient_factors: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary of dosage analysis"""
        total_meds = len(recommendations)
        needs_adjustment = sum(1 for rec in recommendations if rec["needs_adjustment"])
        
        # Calculate average confidence
        avg_confidence = sum(rec["confidence"] for rec in recommendations) / total_meds if total_meds > 0 else 0
        
        # Identify primary adjustment factors
        age_factor = "age" in patient_factors
        renal_factor = "creatinine_clearance" in patient_factors
        hepatic_factor = "liver_function" in patient_factors
        weight_factor = "weight_kg" in patient_factors
        
        return {
            "total_medications": total_meds,
            "medications_needing_adjustment": needs_adjustment,
            "percentage_needing_adjustment": (needs_adjustment / total_meds) * 100 if total_meds > 0 else 0,
            "average_confidence": round(avg_confidence, 2),
            "patient_factors_considered": {
                "age": age_factor,
                "renal_function": renal_factor,
                "hepatic_function": hepatic_factor,
                "weight": weight_factor
            },
            "recommendations_summary": {
                "increase_dose": sum(1 for rec in recommendations if rec["percentage_change"] > 5),
                "decrease_dose": sum(1 for rec in recommendations if rec["percentage_change"] < -5),
                "no_change": sum(1 for rec in recommendations if abs(rec["percentage_change"]) <= 5)
            }
        }
    
    def _create_no_recommendation(self, medication_name: str, dosage_str: str) -> DosageRecommendation:
        """Create a no-recommendation response for unparseable dosages"""
        return DosageRecommendation(
            medication_name=medication_name,
            current_dose=0,
            recommended_dose=0,
            unit="unknown",
            adjustment_reason="Unable to analyze dosage",
            adjustment_factor=1.0,
            confidence=0.0
        )
    
    def _load_standard_dosages(self) -> Dict[str, Any]:
        """Load standard dosage ranges for medications"""
        return {
            "lisinopril": {
                "min_dose": 2.5,
                "max_dose": 40,
                "typical_dose": 10,
                "unit": "mg"
            },
            "metformin": {
                "min_dose": 500,
                "max_dose": 2550,
                "typical_dose": 1000,
                "unit": "mg"
            },
            "atorvastatin": {
                "min_dose": 10,
                "max_dose": 80,
                "typical_dose": 20,
                "unit": "mg"
            },
            "amlodipine": {
                "min_dose": 2.5,
                "max_dose": 10,
                "typical_dose": 5,
                "unit": "mg"
            },
            "omeprazole": {
                "min_dose": 10,
                "max_dose": 40,
                "typical_dose": 20,
                "unit": "mg"
            }
        }
    
    def _load_renal_adjustments(self) -> Dict[str, Any]:
        """Load renal function-based dose adjustments"""
        return {
            "metformin": {
                "severe_impairment": 0.0,  # Contraindicated
                "moderate_impairment": 0.5,
                "mild_impairment": 0.75
            },
            "lisinopril": {
                "severe_impairment": 0.5,
                "moderate_impairment": 0.75,
                "mild_impairment": 0.9
            },
            "atorvastatin": {
                "severe_impairment": 0.5,
                "moderate_impairment": 0.75,
                "mild_impairment": 1.0
            }
        }
    
    def _load_hepatic_adjustments(self) -> Dict[str, Any]:
        """Load hepatic function-based dose adjustments"""
        return {
            "atorvastatin": {
                "severe_impairment": 0.25,
                "moderate_impairment": 0.5,
                "mild_impairment": 0.75
            },
            "omeprazole": {
                "severe_impairment": 0.5,
                "moderate_impairment": 0.75,
                "mild_impairment": 1.0
            }
        }
    
    def _load_age_adjustments(self) -> Dict[str, Any]:
        """Load age-based dose adjustments"""
        return {
            "lisinopril": {
                "elderly_factor": 0.75,  # Start lower in elderly
                "pediatric_factor": 0.5   # Weight-based in children
            },
            "metformin": {
                "elderly_factor": 0.8,   # Reduce due to decreased renal function
                "pediatric_factor": 1.0   # Age-appropriate dosing
            }
        }
    
    def _load_weight_based_dosing(self) -> Dict[str, Any]:
        """Load weight-based dosing parameters"""
        return {
            "enoxaparin": {
                "dose_per_kg": 1.0,  # 1 mg/kg
                "max_dose": 100,
                "unit": "mg"
            },
            "heparin": {
                "dose_per_kg": 80,   # 80 units/kg bolus
                "max_dose": 10000,
                "unit": "units"
            }
        }

# Global service instance
dosage_analyzer = DosageAnalyzer()