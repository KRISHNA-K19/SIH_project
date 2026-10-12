"""
Officer Review and Final Decision Endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_client_ip
from app.db.session import get_db
from app.models.user import User
from app.schemas.decision import DecisionCreate, DecisionResponse
from app.services.decision_service import decision_service

router = APIRouter(tags=["Officer Decisions"])


@router.post("/cases/{case_id}/decisions", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def record_officer_decision(
    case_id: str,
    decision_in: DecisionCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Records official human screening determination.
    Mandatory reviewer comments are preserved for audit accountability.
    AI scores are treated strictly as decision-support evidence.
    """
    client_ip = get_client_ip(request)
    decision_obj = decision_service.record_decision(
        db=db,
        case_id=case_id,
        decision_in=decision_in,
        officer=current_user,
        ip_address=client_ip,
    )

    return DecisionResponse(
        id=decision_obj.id,
        case_id=decision_obj.case_id,
        officer_id=decision_obj.officer_id,
        officer_name=current_user.full_name,
        officer_role=current_user.role,
        decision=decision_obj.decision,
        comments=decision_obj.comments,
        analysis_run_id=decision_obj.analysis_run_id,
        created_at=decision_obj.created_at,
    )


@router.get("/cases/{case_id}/decisions", response_model=List[DecisionResponse])
def get_case_decisions(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all historical officer determinations recorded for a case."""
    decisions = decision_service.get_decisions(db=db, case_id=case_id)
    return [
        DecisionResponse(
            id=d.id,
            case_id=d.case_id,
            officer_id=d.officer_id,
            officer_name=d.officer.full_name if d.officer else None,
            officer_role=d.officer.role if d.officer else None,
            decision=d.decision,
            comments=d.comments,
            analysis_run_id=d.analysis_run_id,
            created_at=d.created_at,
        )
        for d in decisions
    ]
