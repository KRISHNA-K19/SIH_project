"""
RiskAssessment SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class RiskAssessment(Base, TimestampMixin):
    __tablename__ = "risk_assessments"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    analysis_run_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("analysis_runs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    overall_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )  # 0.0 (No risk indicators) to 100.0 (Maximum risk indicators)
    risk_level: Mapped[str] = mapped_column(
        String(20),
        default="LOW",
        nullable=False,
        index=True
    )  # LOW, MEDIUM, HIGH, CRITICAL
    policy_version: Mapped[str] = mapped_column(
        String(50),
        default="1.0.0",
        nullable=False
    )
    factors_json: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )  # Structured contributing score breakdown
    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )  # Clear explanation stating score is decision-support evidence only

    # Relationships
    analysis_run: Mapped["AnalysisRun"] = relationship(
        "AnalysisRun",
        back_populates="risk_assessment"
    )
    case: Mapped["Case"] = relationship(
        "Case"
    )


Index("idx_risk_level_score", RiskAssessment.risk_level, RiskAssessment.overall_score)
