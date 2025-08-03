"""
Clinical Rules Engine for MedReconcile Pro
Analyzes medication appropriateness based on clinical guidelines and patient factors
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)

class AlertSeverity(str, Enum):
    """Severity levels for clinical alerts"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class ClinicalAlert:
    """Represents a clinical alert about medication appropriateness"""
    
    def __init__(self, 
                 medication_name: str,
                 alert_type: str,
                 severity: AlertSeverity,
                 message: str,
                 recommendation: str,
                 evidence_level: str = "expert_opinion"):
        self.medication_name = medication_name
        self.alert_type = alert_type
        self.severity = severity
        self.message = message
        self.recommendation = recommendation
        self.evidence_level = evidence_level
        self.timestamp = datetime.utcnow().isoformat() + "Z"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert alert to dictionary format"""
        return {
            "medication_name": self.medication_name,
            "alert_type": self.alert_type,
            "severity": self.severity.value,
            "message": self.message,
            "recommendation": self.recommendation,
            "evidence_level": self.evidence_level,
            "timestamp": self.timestamp
        }

class ClinicalRulesEngine:
    """Clinical rules engine for analyzing medication appropriateness"""
    
    def __init__(self):
        """Initialize the clinical rules engine"""
        self.contraindication_rules = self._load_contraindication_rules()
        self.age_based_rules = self._load_age_based_rules()
        self.condition_based_rules = self._load_condition_based_rules()
        self.pregnancy_rules = self._load_pregnancy_rules()
        
    def analyze_medication_appropriateness(self, 
                                         medication: Dict[str, Any], 
                                         patient_data: Dict[str, Any] = None) -> List[ClinicalAlert]:
        """
        Analyze a medication for clinical appropriateness
        
        Args:
            medication: Medication data including name, dosage, frequency
            patient_data: Patient demographic and clinical data
            
        Returns:
            List of clinical alerts for inappropriate medication use
        """
        alerts = []
        
        if not medication.get("name"):
            return alerts
            
        medication_name = medication["name"].lower()
        
        # Age-based appropriateness analysis
        if patient_data and "age" in patient_data:
            age_alerts = self._check_age_appropriateness(medication_name, patient_data["age"])
            alerts.extend(age_alerts)
        
        # Condition-based analysis
        if patient_data and "conditions" in patient_data:
            condition_alerts = self._check_condition_contraindications(
                medication_name, patient_data["conditions"]
            )
            alerts.extend(condition_alerts)
            
        # Pregnancy analysis
        if patient_data and patient_data.get("is_pregnant"):
            pregnancy_alerts = self._check_pregnancy_safety(medication_name)
            alerts.extend(pregnancy_alerts)
            
        # Dosage appropriateness
        dosage_alerts = self._check_dosage_appropriateness(medication)
        alerts.extend(dosage_alerts)
        
        # Frequency appropriateness
        frequency_alerts = self._check_frequency_appropriateness(medication)
        alerts.extend(frequency_alerts)
        
        logger.info(f"Analyzed medication {medication_name}, found {len(alerts)} alerts")
        return alerts
    
    def analyze_medication_list(self, 
                              medications: List[Dict[str, Any]], 
                              patient_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze a complete medication list for appropriateness
        
        Args:
            medications: List of medication data
            patient_data: Patient demographic and clinical data
            
        Returns:
            Comprehensive analysis with alerts and summary
        """
        all_alerts = []
        medication_analyses = []
        
        for medication in medications:
            med_alerts = self.analyze_medication_appropriateness(medication, patient_data)
            medication_analyses.append({
                "medication": medication,
                "alerts": [alert.to_dict() for alert in med_alerts],
                "alert_count": len(med_alerts),
                "highest_severity": self._get_highest_severity(med_alerts)
            })
            all_alerts.extend(med_alerts)
        
        # Generate summary statistics
        summary = self._generate_summary(all_alerts)
        
        return {
            "patient_id": patient_data.get("user_id") if patient_data else None,
            "analysis_timestamp": datetime.utcnow().isoformat() + "Z",
            "total_medications": len(medications),
            "total_alerts": len(all_alerts),
            "summary": summary,
            "medication_analyses": medication_analyses,
            "overall_risk_level": self._calculate_overall_risk(all_alerts)
        }
    
    def _check_age_appropriateness(self, medication_name: str, age: int) -> List[ClinicalAlert]:
        """Check medication appropriateness based on patient age"""
        alerts = []
        
        # Elderly (65+) considerations
        if age >= 65:
            elderly_concerns = self.age_based_rules.get("elderly", {}).get(medication_name)
            if elderly_concerns:
                alerts.append(ClinicalAlert(
                    medication_name=medication_name,
                    alert_type="age_related",
                    severity=AlertSeverity(elderly_concerns["severity"]),
                    message=elderly_concerns["message"],
                    recommendation=elderly_concerns["recommendation"]
                ))
        
        # Pediatric considerations
        if age < 18:
            pediatric_concerns = self.age_based_rules.get("pediatric", {}).get(medication_name)
            if pediatric_concerns:
                alerts.append(ClinicalAlert(
                    medication_name=medication_name,
                    alert_type="age_related",
                    severity=AlertSeverity(pediatric_concerns["severity"]),
                    message=pediatric_concerns["message"],
                    recommendation=pediatric_concerns["recommendation"]
                ))
        
        return alerts
    
    def _check_condition_contraindications(self, 
                                         medication_name: str, 
                                         conditions: List[str]) -> List[ClinicalAlert]:
        """Check for condition-based contraindications"""
        alerts = []
        
        for condition in conditions:
            condition_lower = condition.lower()
            if condition_lower in self.condition_based_rules:
                contraindicated_meds = self.condition_based_rules[condition_lower]
                if medication_name in contraindicated_meds:
                    rule = contraindicated_meds[medication_name]
                    alerts.append(ClinicalAlert(
                        medication_name=medication_name,
                        alert_type="condition_contraindication",
                        severity=AlertSeverity(rule["severity"]),
                        message=rule["message"],
                        recommendation=rule["recommendation"]
                    ))
        
        return alerts
    
    def _check_pregnancy_safety(self, medication_name: str) -> List[ClinicalAlert]:
        """Check pregnancy safety for medications"""
        alerts = []
        
        if medication_name in self.pregnancy_rules:
            rule = self.pregnancy_rules[medication_name]
            if rule["category"] in ["D", "X"]:  # FDA pregnancy categories D and X
                alerts.append(ClinicalAlert(
                    medication_name=medication_name,
                    alert_type="pregnancy_safety",
                    severity=AlertSeverity.HIGH if rule["category"] == "X" else AlertSeverity.MODERATE,
                    message=rule["message"],
                    recommendation=rule["recommendation"]
                ))
        
        return alerts
    
    def _check_dosage_appropriateness(self, medication: Dict[str, Any]) -> List[ClinicalAlert]:
        """Check if dosage is within appropriate ranges"""
        alerts = []
        
        medication_name = medication.get("name", "").lower()
        dosage_str = medication.get("dosage", "")
        
        # Extract numeric dosage value
        import re
        dosage_match = re.search(r'(\d+(?:\.\d+)?)', dosage_str)
        if not dosage_match:
            return alerts
            
        dosage_value = float(dosage_match.group(1))
        
        # Check against maximum recommended doses
        max_doses = {
            "acetaminophen": {"max": 4000, "unit": "mg", "period": "daily"},
            "ibuprofen": {"max": 3200, "unit": "mg", "period": "daily"},
            "aspirin": {"max": 4000, "unit": "mg", "period": "daily"},
            "lisinopril": {"max": 40, "unit": "mg", "period": "daily"},
            "metformin": {"max": 2550, "unit": "mg", "period": "daily"}
        }
        
        if medication_name in max_doses:
            max_info = max_doses[medication_name]
            if dosage_value > max_info["max"]:
                alerts.append(ClinicalAlert(
                    medication_name=medication_name,
                    alert_type="dosage_excessive",
                    severity=AlertSeverity.HIGH,
                    message=f"Dosage of {dosage_value}{max_info['unit']} exceeds maximum recommended dose of {max_info['max']}{max_info['unit']} {max_info['period']}",
                    recommendation=f"Consider reducing dosage to within recommended range. Consult prescribing physician."
                ))
        
        return alerts
    
    def _check_frequency_appropriateness(self, medication: Dict[str, Any]) -> List[ClinicalAlert]:
        """Check if dosing frequency is appropriate"""
        alerts = []
        
        medication_name = medication.get("name", "").lower()
        frequency = medication.get("frequency", "").lower()
        
        # Check for inappropriate frequencies
        inappropriate_frequencies = {
            "metformin": {
                "once daily": {
                    "severity": "moderate",
                    "message": "Metformin is typically dosed twice daily to improve tolerability",
                    "recommendation": "Consider dividing dose into twice daily administration"
                }
            }
        }
        
        if medication_name in inappropriate_frequencies:
            freq_rules = inappropriate_frequencies[medication_name]
            if frequency in freq_rules:
                rule = freq_rules[frequency]
                alerts.append(ClinicalAlert(
                    medication_name=medication_name,
                    alert_type="frequency_suboptimal",
                    severity=AlertSeverity(rule["severity"]),
                    message=rule["message"],
                    recommendation=rule["recommendation"]
                ))
        
        return alerts
    
    def _get_highest_severity(self, alerts: List[ClinicalAlert]) -> str:
        """Get the highest severity level from a list of alerts"""
        if not alerts:
            return "none"
            
        severity_order = ["low", "moderate", "high", "critical"]
        highest = "low"
        
        for alert in alerts:
            if severity_order.index(alert.severity.value) > severity_order.index(highest):
                highest = alert.severity.value
                
        return highest
    
    def _generate_summary(self, alerts: List[ClinicalAlert]) -> Dict[str, Any]:
        """Generate summary statistics for alerts"""
        summary = {
            "critical": 0,
            "high": 0,
            "moderate": 0,
            "low": 0
        }
        
        for alert in alerts:
            summary[alert.severity.value] += 1
            
        return summary
    
    def _calculate_overall_risk(self, alerts: List[ClinicalAlert]) -> str:
        """Calculate overall risk level based on alerts"""
        if not alerts:
            return "low"
            
        summary = self._generate_summary(alerts)
        
        if summary["critical"] > 0:
            return "critical"
        elif summary["high"] > 0:
            return "high"
        elif summary["moderate"] > 2:
            return "high"
        elif summary["moderate"] > 0:
            return "moderate"
        else:
            return "low"
    
    def _load_contraindication_rules(self) -> Dict[str, Any]:
        """Load absolute contraindication rules"""
        return {
            "allergy": {
                # These would be loaded from a comprehensive database
                # For now, using basic examples
            }
        }
    
    def _load_age_based_rules(self) -> Dict[str, Any]:
        """Load age-based appropriateness rules"""
        return {
            "elderly": {
                "diphenhydramine": {
                    "severity": "high",
                    "message": "Diphenhydramine has strong anticholinergic effects and is inappropriate for elderly patients",
                    "recommendation": "Consider alternative antihistamine with less anticholinergic activity"
                },
                "diazepam": {
                    "severity": "moderate",
                    "message": "Long-acting benzodiazepines may cause prolonged sedation in elderly",
                    "recommendation": "Consider shorter-acting benzodiazepine or non-benzodiazepine alternative"
                }
            },
            "pediatric": {
                "aspirin": {
                    "severity": "critical",
                    "message": "Aspirin is contraindicated in children due to risk of Reye's syndrome",
                    "recommendation": "Use acetaminophen or ibuprofen instead"
                }
            }
        }
    
    def _load_condition_based_rules(self) -> Dict[str, Any]:
        """Load condition-based contraindication rules"""
        return {
            "kidney disease": {
                "ibuprofen": {
                    "severity": "high",
                    "message": "NSAIDs can worsen kidney function in patients with existing kidney disease",
                    "recommendation": "Consider acetaminophen for pain relief instead"
                },
                "metformin": {
                    "severity": "moderate",
                    "message": "Metformin should be used with caution in kidney disease",
                    "recommendation": "Monitor kidney function regularly; may need dose adjustment"
                }
            },
            "heart failure": {
                "ibuprofen": {
                    "severity": "high",
                    "message": "NSAIDs can worsen heart failure by causing fluid retention",
                    "recommendation": "Avoid NSAIDs; use acetaminophen for pain relief"
                }
            },
            "asthma": {
                "aspirin": {
                    "severity": "moderate",
                    "message": "Aspirin can trigger bronchospasm in some asthmatic patients",
                    "recommendation": "Use with caution; consider acetaminophen alternative"
                }
            }
        }
    
    def _load_pregnancy_rules(self) -> Dict[str, Any]:
        """Load pregnancy safety rules"""
        return {
            "warfarin": {
                "category": "X",
                "message": "Warfarin is teratogenic and contraindicated in pregnancy",
                "recommendation": "Switch to heparin or low molecular weight heparin"
            },
            "lisinopril": {
                "category": "D",
                "message": "ACE inhibitors can cause fetal harm, especially in 2nd and 3rd trimesters",
                "recommendation": "Consider alternative antihypertensive medication"
            },
            "ibuprofen": {
                "category": "C",
                "message": "NSAIDs should be avoided in 3rd trimester due to risk of premature closure of ductus arteriosus",
                "recommendation": "Use acetaminophen for pain relief during pregnancy"
            }
        }

# Global service instance
clinical_rules_engine = ClinicalRulesEngine()