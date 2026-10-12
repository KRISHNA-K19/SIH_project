"""
Audit Trail Endpoints.
"""

import json
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_supervisor
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit import AuditEventResponse, AuditListResponse
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["Security Audit Trail"])


@router.get("", response_model=AuditListResponse)
def list_audit_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db),
):
    """
    SUPERVISOR / ADMIN ONLY.
    Queries tamper-evident security audit logs with filtering and pagination.
    """
    events, total = audit_service.get_events(
        db=db,
        page=page,
        page_size=page_size,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
    )

    items = []
    for ev in events:
        details_dict = None
        if ev.details_json:
            try:
                details_dict = json.loads(ev.details_json)
            except Exception:
                details_dict = {}
        items.append(AuditEventResponse(
            id=ev.id,
            user_id=ev.user_id,
            user_name=ev.user.full_name if ev.user else None,
            action=ev.action,
            resource_type=ev.resource_type,
            resource_id=ev.resource_id,
            details=details_dict,
            ip_address=ev.ip_address,
            created_at=ev.created_at,
        ))

    return AuditListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )
