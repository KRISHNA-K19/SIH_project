"""
Case Subject SQLAlchemy model.
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class CaseSubject(Base, TimestampMixin):
    __tablename__ = "case_subjects"

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
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    date_of_birth: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True
    )
    nationality: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
        index=True
    )
    id_number: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )
    gender: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )
    address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # Relationships
    case: Mapped["Case"] = relationship(
        "Case",
        back_populates="subjects"
    )


Index("idx_subjects_name_id", CaseSubject.full_name, CaseSubject.id_number)
