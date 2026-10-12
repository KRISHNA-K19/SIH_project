"""
EvidenceFinding SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class EvidenceFinding(Base, TimestampMixin):
    __tablename__ = "evidence_findings"

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
        index=True
    )
    finding_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )  # BLUR_DETECTED, RESOLUTION_LOW, MRZ_CHECKSUM_FAILED, FIELD_MISMATCH, ANOMALY_DETECTED, OCR_UNAVAILABLE
    severity: Mapped[str] = mapped_column(
        String(20),
        default="MEDIUM",
        nullable=False,
        index=True
    )  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    details_json: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )  # JSON-encoded additional technical parameters and evidence

    # Relationships
    analysis_run: Mapped["AnalysisRun"] = relationship(
        "AnalysisRun",
        back_populates="evidence_findings"
    )


Index("idx_evidence_severity_type", EvidenceFinding.severity, EvidenceFinding.finding_type)
