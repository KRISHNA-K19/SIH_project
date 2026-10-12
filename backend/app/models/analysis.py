"""
AnalysisRun SQLAlchemy model.
"""

import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, utc_now


class AnalysisRun(Base, TimestampMixin):
    __tablename__ = "analysis_runs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    document_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False,
        index=True
    )  # PENDING, PROCESSING, COMPLETED, PARTIAL, UNAVAILABLE, FAILED
    algorithm_version: Mapped[str] = mapped_column(
        String(50),
        default="1.0.0",
        nullable=False
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    summary_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # Relationships
    document: Mapped["Document"] = relationship(
        "Document",
        back_populates="analysis_runs"
    )
    case: Mapped["Case"] = relationship(
        "Case",
        back_populates="analysis_runs"
    )
    extracted_fields: Mapped[List["ExtractedField"]] = relationship(
        "ExtractedField",
        back_populates="analysis_run",
        cascade="all, delete-orphan"
    )
    evidence_findings: Mapped[List["EvidenceFinding"]] = relationship(
        "EvidenceFinding",
        back_populates="analysis_run",
        cascade="all, delete-orphan"
    )
    risk_assessment: Mapped[Optional["RiskAssessment"]] = relationship(
        "RiskAssessment",
        back_populates="analysis_run",
        uselist=False,
        cascade="all, delete-orphan"
    )


Index("idx_analysis_status_case", AnalysisRun.case_id, AnalysisRun.status)
