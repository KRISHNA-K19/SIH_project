"""
User SQLAlchemy model.
"""

import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(50),
        default="OFFICER",
        nullable=False,
        index=True
    )  # OFFICER, SUPERVISOR, ADMIN
    badge_number: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    # Relationships
    assigned_cases: Mapped[List["Case"]] = relationship(
        "Case",
        back_populates="assigned_officer",
        foreign_keys="Case.assigned_officer_id"
    )
    created_cases: Mapped[List["Case"]] = relationship(
        "Case",
        back_populates="created_by",
        foreign_keys="Case.created_by_id"
    )
    decisions: Mapped[List["OfficerDecision"]] = relationship(
        "OfficerDecision",
        back_populates="officer"
    )
    audit_events: Mapped[List["AuditEvent"]] = relationship(
        "AuditEvent",
        back_populates="user"
    )
