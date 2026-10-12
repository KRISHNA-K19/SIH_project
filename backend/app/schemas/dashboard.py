"""
Dashboard and Reporting Pydantic schemas.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_cases: int
    pending_reviews: int
    in_progress: int
    escalated_cases: int
    completed_cases: int
    total_documents: int
    total_analysis_runs: int
    high_risk_findings: int


class DashboardActivityItem(BaseModel):
    id: str
    case_id: str
    case_number: str
    event_type: str
    description: str
    user_name: Optional[str] = None
    created_at: datetime


class DashboardActivityResponse(BaseModel):
    activities: List[DashboardActivityItem] = []
    total_recent: int
