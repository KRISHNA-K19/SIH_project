"""
Dashboard Service computing real metrics and recent activity feeds directly from database queries.
"""

from typing import Any, Dict, List, Optional
from sqlalchemy import select, func, desc, or_
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.document import Document
from app.models.analysis import AnalysisRun
from app.models.evidence import EvidenceFinding
from app.models.timeline import CaseTimeline
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse, DashboardActivityItem, DashboardActivityResponse


class DashboardService:
    def get_stats(self, db: Session, user: Optional[User] = None) -> DashboardStatsResponse:
        """Computes summary statistics, respecting RBAC scope for officers."""
        case_filter = []
        if user and user.role == "OFFICER":
            case_filter.append(
                or_(
                    Case.assigned_officer_id == user.id,
                    Case.assigned_officer_id.is_(None)
                )
            )

        # Cases counts
        def count_cases_with_status(status_val: Optional[str] = None) -> int:
            stmt = select(func.count(Case.id))
            if case_filter:
                stmt = stmt.where(*case_filter)
            if status_val:
                stmt = stmt.where(Case.status == status_val)
            return db.scalar(stmt) or 0

        total_cases = count_cases_with_status(None)
        pending_reviews = count_cases_with_status("PENDING_REVIEW")
        in_progress = count_cases_with_status("IN_PROGRESS")
        escalated_cases = count_cases_with_status("ESCALATED")
        completed_cases = count_cases_with_status("CLOSED")

        # Documents & analysis runs counts
        total_documents = db.scalar(select(func.count(Document.id))) or 0
        total_analysis_runs = db.scalar(select(func.count(AnalysisRun.id))) or 0

        # High/Critical risk findings count
        high_risk_findings = db.scalar(
            select(func.count(EvidenceFinding.id)).where(
                EvidenceFinding.severity.in_(["HIGH", "CRITICAL"])
            )
        ) or 0

        return DashboardStatsResponse(
            total_cases=total_cases,
            pending_reviews=pending_reviews,
            in_progress=in_progress,
            escalated_cases=escalated_cases,
            completed_cases=completed_cases,
            total_documents=total_documents,
            total_analysis_runs=total_analysis_runs,
            high_risk_findings=high_risk_findings,
        )

    def get_recent_activity(self, db: Session, limit: int = 20) -> DashboardActivityResponse:
        """Retrieves recent system-wide case timeline activity."""
        stmt = (
            select(CaseTimeline, Case.case_number, User.full_name)
            .join(Case, CaseTimeline.case_id == Case.id)
            .outerjoin(User, CaseTimeline.user_id == User.id)
            .order_by(desc(CaseTimeline.created_at))
            .limit(limit)
        )
        rows = db.execute(stmt).all()

        items: List[DashboardActivityItem] = []
        for timeline, case_number, full_name in rows:
            items.append(DashboardActivityItem(
                id=timeline.id,
                case_id=timeline.case_id,
                case_number=case_number,
                event_type=timeline.event_type,
                description=timeline.description,
                user_name=full_name,
                created_at=timeline.created_at,
            ))

        return DashboardActivityResponse(
            activities=items,
            total_recent=len(items),
        )


dashboard_service = DashboardService()
