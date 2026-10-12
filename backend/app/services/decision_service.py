"""
Human Review and Decision Service.
Allows authorized officers to record formal decisions with mandatory justifications.
Synchronizes case status and generates audit events.
"""

from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models.case import Case
from app.models.decision import OfficerDecision
from app.models.user import User
from app.models.timeline import CaseTimeline
from app.models.analysis import AnalysisRun
from app.schemas.decision import DecisionCreate
from app.services.audit_service import audit_service

ALLOWED_DECISIONS = {
    "PENDING_REVIEW",
    "CLEARED",
    "ESCALATED",
    "REFERRED_FOR_MANUAL_VERIFICATION",
}


class DecisionService:
    def record_decision(
        self,
        db: Session,
        case_id: str,
        decision_in: DecisionCreate,
        officer: User,
        ip_address: Optional[str] = None,
    ) -> OfficerDecision:
        """
        Records an official human reviewer determination.
        Enforces required comments, case status synchronization, timeline logging, and audit tracking.
        """
        decision_outcome = decision_in.decision.upper()
        if decision_outcome not in ALLOWED_DECISIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid decision '{decision_outcome}'. Permitted outcomes: {list(ALLOWED_DECISIONS)}",
            )

        case = db.scalar(select(Case).where(Case.id == case_id))
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' does not exist.",
            )

        # Optional analysis run verification
        analysis_run_id = decision_in.analysis_run_id
        if analysis_run_id:
            run = db.scalar(select(AnalysisRun).where(AnalysisRun.id == analysis_run_id))
            if not run or run.case_id != case.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Referenced analysis_run_id does not belong to this case.",
                )

        # Create decision record
        decision_obj = OfficerDecision(
            case_id=case.id,
            officer_id=officer.id,
            decision=decision_outcome,
            comments=decision_in.comments,
            analysis_run_id=analysis_run_id,
        )
        db.add(decision_obj)
        db.flush()

        # Synchronize case status based on human determination
        if decision_outcome == "CLEARED":
            case.status = "CLOSED"
        elif decision_outcome == "ESCALATED":
            case.status = "ESCALATED"
        elif decision_outcome == "REFERRED_FOR_MANUAL_VERIFICATION":
            case.status = "IN_PROGRESS"

        case.updated_at = utc_now()

        # Add timeline entry
        db.add(CaseTimeline(
            case_id=case.id,
            user_id=officer.id,
            event_type="DECISION_RECORDED",
            description=f"Officer {officer.full_name} recorded determination '{decision_outcome}': {decision_in.comments[:120]}...",
        ))

        db.commit()
        db.refresh(decision_obj)

        # Record tamper-evident audit event
        audit_service.log_event(
            db=db,
            user_id=officer.id,
            action="RECORD_DECISION",
            resource_type="DECISION",
            resource_id=decision_obj.id,
            details={
                "case_id": case.id,
                "decision": decision_outcome,
                "officer_badge": officer.badge_number,
                "case_status_after": case.status,
            },
            ip_address=ip_address,
        )

        return decision_obj

    def get_decisions(self, db: Session, case_id: str) -> List[OfficerDecision]:
        """Retrieves all historical decisions for a case in reverse chronological order."""
        return list(db.scalars(
            select(OfficerDecision).where(OfficerDecision.case_id == case_id).order_by(desc(OfficerDecision.created_at))
        ).all())


decision_service = DecisionService()
