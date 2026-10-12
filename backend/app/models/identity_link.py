"""
IdentityLink SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class IdentityLink(Base, TimestampMixin):
    __tablename__ = "identity_links"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    source_case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    target_case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    match_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )  # EXACT_ID, NAME_AND_DOB, SUSPECTED_ALIAS, DUPLICATE_DOCUMENT
    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )  # 0.0 to 1.0
    details_json: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # Relationships
    source_case: Mapped["Case"] = relationship(
        "Case",
        foreign_keys=[source_case_id],
        back_populates="source_identity_links"
    )
    target_case: Mapped["Case"] = relationship(
        "Case",
        foreign_keys=[target_case_id],
        back_populates="target_identity_links"
    )


Index("idx_identity_links_cases", IdentityLink.source_case_id, IdentityLink.target_case_id)
