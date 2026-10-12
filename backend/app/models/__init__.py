"""
Models package initialization.
Exports all ORM entities so metadata is fully populated for migrations.
"""

from app.db.base import Base
from app.models.user import User
from app.models.case import Case
from app.models.subject import CaseSubject
from app.models.document import Document
from app.models.analysis import AnalysisRun
from app.models.field import ExtractedField
from app.models.evidence import EvidenceFinding
from app.models.risk import RiskAssessment
from app.models.decision import OfficerDecision
from app.models.timeline import CaseTimeline
from app.models.audit import AuditEvent
from app.models.identity_link import IdentityLink

__all__ = [
    "Base",
    "User",
    "Case",
    "CaseSubject",
    "Document",
    "AnalysisRun",
    "ExtractedField",
    "EvidenceFinding",
    "RiskAssessment",
    "OfficerDecision",
    "CaseTimeline",
    "AuditEvent",
    "IdentityLink",
]
