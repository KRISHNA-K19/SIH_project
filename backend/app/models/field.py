"""
ExtractedField SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, Float, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class ExtractedField(Base, TimestampMixin):
    __tablename__ = "extracted_fields"

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
    field_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )
    raw_value: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    normalized_value: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True
    )  # Confidence score (0.0 - 1.0) or None if source doesn't provide statistical confidence
    source: Mapped[str] = mapped_column(
        String(50),
        default="OCR",
        nullable=False
    )  # OCR, MRZ, MANUAL, METADATA
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # Relationships
    analysis_run: Mapped["AnalysisRun"] = relationship(
        "AnalysisRun",
        back_populates="extracted_fields"
    )


Index("idx_fields_run_name", ExtractedField.analysis_run_id, ExtractedField.field_name)
