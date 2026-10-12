"""
Document SQLAlchemy model.
"""

import uuid
from typing import List, Optional
from sqlalchemy import String, Integer, BigInteger, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

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
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    storage_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True
    )
    storage_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False
    )
    processed_storage_path: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    file_size_bytes: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )
    sha256_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True
    )
    document_type: Mapped[str] = mapped_column(
        String(50),
        default="PASSPORT",
        nullable=False
    )  # PASSPORT, ID_CARD, DRIVERS_LICENSE, VISA, OTHER
    upload_status: Mapped[str] = mapped_column(
        String(50),
        default="STORED",
        nullable=False
    )

    # Relationships
    case: Mapped["Case"] = relationship(
        "Case",
        back_populates="documents"
    )
    analysis_runs: Mapped[List["AnalysisRun"]] = relationship(
        "AnalysisRun",
        back_populates="document",
        cascade="all, delete-orphan"
    )


Index("idx_documents_case_hash", Document.case_id, Document.sha256_hash)
