"""
Common and reusable Pydantic schemas.
"""

from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    timestamp: str


class ReadinessResponse(BaseModel):
    status: str
    database_connected: bool
    database_detail: str
    storage_writable: bool
    timestamp: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
