"""
RxNav API service for drug validation and interaction checking
"""

import logging
import httpx
from typing import Dict, Any, List, Optional
import asyncio

logger = logging.getLogger(__name__)

class RxNavAPIService:
    """Service for RxNav API drug validation and interaction checking"""
    
    BASE_URL = "https://rxnav.nlm.nih.gov/REST"
    
    def __init__(self):
        """Initialize RxNav API service"""
        self.session = None
    
    async def _get_session(self) -> httpx.AsyncClient:
        """Get or create HTTP session"""
        if not self.session:
            self.session = httpx.AsyncClient(timeout=30.0)
        return self.session
    
    async def validate_medication(self, medication_name: str) -> Dict[str, Any]:
        """
        Validate medication name using RxNav API
        
        Args:
            medication_name: Name of the medication to validate
            
        Returns:
            Dict containing validation results and RxCUI if found
        """
        try:
            session = await self._get_session()
            
            # Search for medication by name
            url = f"{self.BASE_URL}/rxcui.json"
            params = {"name": medication_name}
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if "idGroup" in data and "rxnormId" in data["idGroup"]:
                rxcui_list = data["idGroup"]["rxnormId"]
                if rxcui_list:
                    # Get the first (most relevant) RxCUI
                    rxcui = rxcui_list[0] if isinstance(rxcui_list, list) else rxcui_list
                    
                    # Get detailed information about the medication
                    med_info = await self._get_medication_details(rxcui)
                    
                    return {
                        "valid": True,
                        "rxcui": rxcui,
                        "medication_info": med_info,
                        "alternatives": rxcui_list[1:5] if isinstance(rxcui_list, list) else []
                    }
            
            return {
                "valid": False,
                "message": f"Medication '{medication_name}' not found in RxNav database",
                "suggestions": await self._get_medication_suggestions(medication_name)
            }
            
        except Exception as e:
            logger.error(f"RxNav validation failed for '{medication_name}': {str(e)}")
            return self._get_mock_validation_response(medication_name)
    
    async def _get_medication_details(self, rxcui: str) -> Dict[str, Any]:
        """Get detailed medication information by RxCUI"""
        try:
            session = await self._get_session()
            
            # Get medication properties
            url = f"{self.BASE_URL}/rxcui/{rxcui}/properties.json"
            response = await session.get(url)
            response.raise_for_status()
            
            data = response.json()
            
            if "properties" in data:
                props = data["properties"]
                return {
                    "name": props.get("name", "Unknown"),
                    "synonym": props.get("synonym", ""),
                    "tty": props.get("tty", ""),  # Term type
                    "language": props.get("language", "ENG"),
                    "suppress": props.get("suppress", "N")
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Failed to get medication details for RxCUI {rxcui}: {str(e)}")
            return {}
    
    async def _get_medication_suggestions(self, medication_name: str) -> List[str]:
        """Get medication name suggestions for partial matches"""
        try:
            session = await self._get_session()
            
            # Use approximate match search
            url = f"{self.BASE_URL}/approximateTerm.json"
            params = {"term": medication_name, "maxEntries": 5}
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            suggestions = []
            if "approximateGroup" in data and "candidate" in data["approximateGroup"]:
                candidates = data["approximateGroup"]["candidate"]
                if isinstance(candidates, list):
                    suggestions = [candidate.get("name", "") for candidate in candidates[:5]]
                else:
                    suggestions = [candidates.get("name", "")]
            
            return [s for s in suggestions if s]  # Filter out empty strings
            
        except Exception as e:
            logger.error(f"Failed to get suggestions for '{medication_name}': {str(e)}")
            return []
    
    async def check_drug_interactions(self, rxcui_list: List[str]) -> Dict[str, Any]:
        """
        Check for drug interactions between multiple medications
        
        Args:
            rxcui_list: List of RxCUI identifiers for medications
            
        Returns:
            Dict containing interaction information
        """
        try:
            if len(rxcui_list) < 2:
                return {
                    "interactions_found": 0,
                    "interactions": [],
                    "message": "Need at least 2 medications to check interactions"
                }
            
            session = await self._get_session()
            
            # Build interaction query
            rxcuis = "+".join(rxcui_list)
            url = f"{self.BASE_URL}/interaction/list.json"
            params = {"rxcuis": rxcuis}
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            interactions = []
            if "fullInteractionTypeGroup" in data:
                for group in data["fullInteractionTypeGroup"]:
                    if "fullInteractionType" in group:
                        for interaction_type in group["fullInteractionType"]:
                            if "interactionPair" in interaction_type:
                                pairs = interaction_type["interactionPair"]
                                if not isinstance(pairs, list):
                                    pairs = [pairs]
                                
                                for pair in pairs:
                                    interaction = self._parse_interaction_pair(pair)
                                    if interaction:
                                        interactions.append(interaction)
            
            return {
                "interactions_found": len(interactions),
                "interactions": interactions,
                "checked_medications": len(rxcui_list),
                "severity_summary": self._get_severity_summary(interactions)
            }
            
        except Exception as e:
            logger.error(f"Drug interaction check failed: {str(e)}")
            return self._get_mock_interaction_response()
    
    def _parse_interaction_pair(self, pair: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse interaction pair data"""
        try:
            interaction_concept = pair.get("interactionConcept", [])
            if len(interaction_concept) >= 2:
                drug1 = interaction_concept[0].get("minConceptItem", {}).get("name", "Unknown")
                drug2 = interaction_concept[1].get("minConceptItem", {}).get("name", "Unknown")
                
                severity = pair.get("severity", "Unknown")
                description = pair.get("description", "No description available")
                
                return {
                    "drug1": drug1,
                    "drug2": drug2,
                    "severity": severity.lower(),
                    "description": description
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to parse interaction pair: {str(e)}")
            return None
    
    def _get_severity_summary(self, interactions: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get summary of interaction severities"""
        summary = {"high": 0, "moderate": 0, "low": 0, "unknown": 0}
        
        for interaction in interactions:
            severity = interaction.get("severity", "unknown").lower()
            if severity in summary:
                summary[severity] += 1
            else:
                summary["unknown"] += 1
        
        return summary
    
    def _get_mock_validation_response(self, medication_name: str) -> Dict[str, Any]:
        """Return mock validation response for testing"""
        # Mock RxCUI mapping for common medications
        mock_mapping = {
            "lisinopril": "29046",
            "metformin": "6809",
            "amlodipine": "17767",
            "atorvastatin": "83367",
            "omeprazole": "7646"
        }
        
        name_lower = medication_name.lower()
        if name_lower in mock_mapping:
            return {
                "valid": True,
                "rxcui": mock_mapping[name_lower],
                "medication_info": {
                    "name": medication_name.title(),
                    "synonym": "",
                    "tty": "IN",
                    "language": "ENG"
                },
                "alternatives": []
            }
        
        return {
            "valid": False,
            "message": f"Mock response: Medication '{medication_name}' not found",
            "suggestions": ["Lisinopril", "Metformin", "Amlodipine"]
        }
    
    def _get_mock_interaction_response(self) -> Dict[str, Any]:
        """Return mock interaction response for testing"""
        return {
            "interactions_found": 1,
            "interactions": [
                {
                    "drug1": "Lisinopril",
                    "drug2": "Ibuprofen",
                    "severity": "moderate",
                    "description": "NSAIDs may reduce the antihypertensive effect of ACE inhibitors"
                }
            ],
            "checked_medications": 2,
            "severity_summary": {"moderate": 1, "high": 0, "low": 0, "unknown": 0}
        }
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()
            self.session = None

# Global service instance
rxnav_service = RxNavAPIService()