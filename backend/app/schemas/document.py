"""
Document Pydantic schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: str
    case_id: str
    original_filename: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    document_type: str
    upload_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    document: DocumentResponse
    message: str
