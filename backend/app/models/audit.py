"""
AuditEvent SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class AuditEvent(Base, TimestampMixin):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )  # LOGIN, LOGOUT, VIEW_CASE, CREATE_CASE, UPDATE_CASE, ASSIGN_CASE, UPLOAD_DOCUMENT, DOWNLOAD_DOCUMENT, RUN_ANALYSIS, RECORD_DECISION
    resource_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )  # CASE, DOCUMENT, ANALYSIS, DECISION, USER, AUTH
    resource_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )
    details_json: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    ip_address: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="audit_events"
    )


Index("idx_audit_action_resource", AuditEvent.action, AuditEvent.resource_type)
Index("idx_audit_user_created", AuditEvent.user_id, AuditEvent.created_at)
