"""
Officer Decision Pydantic schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class DecisionCreate(BaseModel):
    decision: str = Field(
        ...,
        description="Decision outcome: PENDING_REVIEW, CLEARED, ESCALATED, or REFERRED_FOR_MANUAL_VERIFICATION"
    )
    comments: str = Field(
        ...,
        min_length=5,
        max_length=4000,
        description="Mandatory officer explanation and justification for this decision"
    )
    analysis_run_id: Optional[str] = None


class DecisionResponse(BaseModel):
    id: str
    case_id: str
    officer_id: str
    officer_name: Optional[str] = None
    officer_role: Optional[str] = None
    decision: str
    comments: str
    analysis_run_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
