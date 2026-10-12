"""
Case and Subject Pydantic schemas.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SubjectCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = Field(None, max_length=10)
    id_number: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class SubjectResponse(BaseModel):
    id: str
    case_id: str
    full_name: str
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = None
    id_number: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    subjects: Optional[List[SubjectCreate]] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None  # Valid transitions enforced in service


class CaseAssign(BaseModel):
    officer_id: str


class CaseNoteCreate(BaseModel):
    note: str = Field(..., min_length=1, max_length=4000)


class CaseTimelineResponse(BaseModel):
    id: str
    case_id: str
    user_id: Optional[str] = None
    event_type: str
    description: str
    metadata_json: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseResponse(BaseModel):
    id: str
    case_number: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assigned_officer_id: Optional[str] = None
    created_by_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseDetailResponse(CaseResponse):
    subjects: List[SubjectResponse] = []
    documents_count: int = 0
    analysis_runs_count: int = 0
    latest_decision: Optional[str] = None
