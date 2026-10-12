"""
OfficerDecision SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class OfficerDecision(Base, TimestampMixin):
    __tablename__ = "officer_decisions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    officer_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    decision: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )  # PENDING_REVIEW, CLEARED, ESCALATED, REFERRED_FOR_MANUAL_VERIFICATION
    comments: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    analysis_run_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("analysis_runs.id", ondelete="SET NULL"),
        nullable=True
    )

    # Relationships
    case: Mapped["Case"] = relationship(
        "Case",
        back_populates="decisions"
    )
    officer: Mapped["User"] = relationship(
        "User",
        back_populates="decisions"
    )
    analysis_run: Mapped[Optional["AnalysisRun"]] = relationship(
        "AnalysisRun"
    )


Index("idx_decision_case_officer", OfficerDecision.case_id, OfficerDecision.officer_id)
