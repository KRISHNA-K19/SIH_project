"""
Analysis, OCR, MRZ, Quality Check, and Risk Assessment schemas.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class AnalysisTriggerRequest(BaseModel):
    document_id: Optional[str] = None  # If not provided, analyzes all unanalyzed case documents


class ExtractedFieldResponse(BaseModel):
    id: str
    field_name: str
    raw_value: Optional[str] = None
    normalized_value: Optional[str] = None
    confidence: Optional[float] = None
    source: str
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)


class EvidenceFindingResponse(BaseModel):
    id: str
    finding_type: str
    severity: str
    description: str
    details: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class RiskAssessmentResponse(BaseModel):
    id: str
    overall_score: float
    risk_level: str
    policy_version: str
    factors: List[Dict[str, Any]] = []
    explanation: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalysisRunResponse(BaseModel):
    id: str
    document_id: str
    case_id: str
    status: str
    algorithm_version: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    summary_notes: Optional[str] = None
    error_message: Optional[str] = None
    extracted_fields: List[ExtractedFieldResponse] = []
    evidence_findings: List[EvidenceFindingResponse] = []
    risk_assessment: Optional[RiskAssessmentResponse] = None

    model_config = ConfigDict(from_attributes=True)


class CrossCheckMatch(BaseModel):
    field_name: str
    source_value: Optional[str] = None
    target_value: Optional[str] = None
    is_consistent: bool
    discrepancy_note: Optional[str] = None


class CrossCheckResponse(BaseModel):
    case_id: str
    status: str
    consistency_score: float
    discrepancies: List[CrossCheckMatch] = []
    summary: str


class IdentityLinkResponse(BaseModel):
    id: str
    source_case_id: str
    target_case_id: str
    match_type: str
    confidence_score: float
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
