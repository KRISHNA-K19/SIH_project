"""
CaseTimeline SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class CaseTimeline(Base, TimestampMixin):
    __tablename__ = "case_timeline"

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
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )  # CASE_CREATED, DOCUMENT_UPLOADED, ANALYSIS_COMPLETED, OFFICER_ASSIGNED, STATUS_CHANGED, NOTE_ADDED, DECISION_RECORDED
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    metadata_json: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # Relationships
    case: Mapped["Case"] = relationship(
        "Case",
        back_populates="timeline_events"
    )
    user: Mapped[Optional["User"]] = relationship(
        "User"
    )


Index("idx_timeline_case_created", CaseTimeline.case_id, CaseTimeline.created_at)
