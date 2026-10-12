"""
Case SQLAlchemy model.
"""

import uuid
from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Case(Base, TimestampMixin):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    case_number: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING_REVIEW",
        nullable=False,
        index=True
    )  # PENDING_REVIEW, IN_PROGRESS, ESCALATED, CLOSED
    priority: Mapped[str] = mapped_column(
        String(20),
        default="MEDIUM",
        nullable=False,
        index=True
    )  # LOW, MEDIUM, HIGH, CRITICAL

    assigned_officer_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    created_by_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Relationships
    assigned_officer: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="assigned_cases",
        foreign_keys=[assigned_officer_id]
    )
    created_by: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="created_cases",
        foreign_keys=[created_by_id]
    )

    subjects: Mapped[List["CaseSubject"]] = relationship(
        "CaseSubject",
        back_populates="case",
        cascade="all, delete-orphan"
    )
    documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="case",
        cascade="all, delete-orphan"
    )
    analysis_runs: Mapped[List["AnalysisRun"]] = relationship(
        "AnalysisRun",
        back_populates="case",
        cascade="all, delete-orphan"
    )
    decisions: Mapped[List["OfficerDecision"]] = relationship(
        "OfficerDecision",
        back_populates="case",
        cascade="all, delete-orphan"
    )
    timeline_events: Mapped[List["CaseTimeline"]] = relationship(
        "CaseTimeline",
        back_populates="case",
        cascade="all, delete-orphan"
    )

    source_identity_links: Mapped[List["IdentityLink"]] = relationship(
        "IdentityLink",
        foreign_keys="IdentityLink.source_case_id",
        back_populates="source_case",
        cascade="all, delete-orphan"
    )
    target_identity_links: Mapped[List["IdentityLink"]] = relationship(
        "IdentityLink",
        foreign_keys="IdentityLink.target_case_id",
        back_populates="target_case",
        cascade="all, delete-orphan"
    )


# Composite indexes for frequent queries
Index("idx_cases_status_priority", Case.status, Case.priority)
Index("idx_cases_assigned_status", Case.assigned_officer_id, Case.status)
