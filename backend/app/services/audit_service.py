"""
Audit Service for system-wide tamper-evident security logging.
"""

import json
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.audit import AuditEvent
from app.models.user import User


class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        action: str,
        resource_type: str,
        user_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditEvent:
        """Records an immutable security audit event."""
        try:
            event = AuditEvent(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details_json=json.dumps(details) if details else None,
                ip_address=ip_address,
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            return event
        except Exception as exc:
            db.rollback()
            logger.error(f"Failed to record audit event: {exc}")
            raise

    @staticmethod
    def get_events(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
    ) -> Tuple[List[AuditEvent], int]:
        """Queries audit log with filtering and pagination."""
        query = select(AuditEvent)

        if user_id:
            query = query.where(AuditEvent.user_id == user_id)
        if action:
            query = query.where(AuditEvent.action == action)
        if resource_type:
            query = query.where(AuditEvent.resource_type == resource_type)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        # Paginate
        offset = (page - 1) * page_size
        events = db.scalars(
            query.order_by(desc(AuditEvent.created_at)).offset(offset).limit(page_size)
        ).all()

        return list(events), total


audit_service = AuditService()
