"""
Explainable Risk Assessment Engine.
Synthesizes evidence findings into a calibrated decision-support score without overclaiming predictive validity.
"""

from typing import Any, Dict, List, Tuple
from app.core.config import settings

SEVERITY_WEIGHTS = {
    "CRITICAL": 35.0,
    "HIGH": 25.0,
    "MEDIUM": 12.0,
    "LOW": 5.0,
    "INFO": 0.0,
}


class RiskService:
    def __init__(self, policy_version: str = "1.0.0"):
        self.policy_version = policy_version

    def evaluate_risk(
        self,
        findings: List[Dict[str, Any]],
        algorithm_version: str = "1.0.0"
    ) -> Tuple[float, str, List[Dict[str, Any]], str]:
        """
        Calculates explainable risk score from modular evidence findings.
        Returns: (overall_score: float, risk_level: str, factors: list, explanation: str)
        """
        score = 0.0
        factors: List[Dict[str, Any]] = []

        for finding in findings:
            severity = finding.get("severity", "INFO")
            weight = SEVERITY_WEIGHTS.get(severity, 0.0)

            if weight > 0.0:
                score += weight
                factors.append({
                    "finding_type": finding.get("finding_type"),
                    "severity": severity,
                    "score_impact": weight,
                    "reason": finding.get("description"),
                })

        # Cap score at 100.0
        overall_score = min(100.0, round(score, 1))

        # Categorize into calibrated risk tier
        if overall_score <= 20.0:
            risk_level = "LOW"
        elif overall_score <= 50.0:
            risk_level = "MEDIUM"
        elif overall_score <= 75.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        explanation = (
            f"Screening risk assessment evaluated at {overall_score}/100 ({risk_level}) under Policy v{self.policy_version}. "
            f"Evaluated {len(findings)} technical checks yielding {len(factors)} weighted risk factor(s). "
            "IMPORTANT NOTICE: This metric constitutes algorithmic decision-support evidence based solely on capture quality, "
            "ICAO checksums, and declared consistency. It does NOT assert identity fraud and must not be used as an automatic approval/rejection decision."
        )

        return overall_score, risk_level, factors, explanation


risk_service = RiskService(policy_version=settings.ANALYSIS_POLICY_VERSION)
