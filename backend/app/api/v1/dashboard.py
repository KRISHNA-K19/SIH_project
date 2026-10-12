"""
Dashboard Endpoints.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse, DashboardActivityResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves operational screening metrics computed live from PostgreSQL."""
    return dashboard_service.get_stats(db=db, user=current_user)


@router.get("/activity", response_model=DashboardActivityResponse)
def get_dashboard_activity(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves chronological activity feed across cases."""
    return dashboard_service.get_recent_activity(db=db, limit=limit)
