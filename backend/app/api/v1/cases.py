"""
Case Management Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_officer,
    require_supervisor,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.case import (
    CaseCreate,
    CaseUpdate,
    CaseAssign,
    CaseNoteCreate,
    CaseResponse,
    CaseDetailResponse,
    CaseTimelineResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.case_service import case_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/cases", tags=["Case Management"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    case_in: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates a new screening case with assigned case number and audit record."""
    case = case_service.create_case(db=db, case_in=case_in, creator_id=current_user.id)
    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="CREATE_CASE",
        resource_type="CASE",
        resource_id=case.id,
        details={"case_number": case.case_number, "title": case.title},
    )
    return case


@router.get("", response_model=PaginatedResponse[CaseResponse])
def list_cases(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_officer_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists screening cases with pagination, filtering, search, and RBAC rules."""
    cases, total = case_service.get_cases(
        db=db,
        page=page,
        page_size=page_size,
        status_filter=status,
        priority_filter=priority,
        assigned_officer_id=assigned_officer_id,
        search_query=search,
        user=current_user,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedResponse(
        items=cases,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves full case details, subjects, and counts."""
    case = case_service.get_case_by_id(db, case_id)

    # RBAC check: if Officer, must be assigned or unassigned
    if current_user.role == "OFFICER" and case.assigned_officer_id and case.assigned_officer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: You are not assigned to this case.",
        )

    latest_dec = case.decisions[-1].decision if case.decisions else None

    return CaseDetailResponse(
        id=case.id,
        case_number=case.case_number,
        title=case.title,
        description=case.description,
        status=case.status,
        priority=case.priority,
        assigned_officer_id=case.assigned_officer_id,
        created_by_id=case.created_by_id,
        created_at=case.created_at,
        updated_at=case.updated_at,
        subjects=case.subjects,
        documents_count=len(case.documents),
        analysis_runs_count=len(case.analysis_runs),
        latest_decision=latest_dec,
    )


@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    case_in: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates permitted case fields and handles valid state machine transitions."""
    case = case_service.get_case_by_id(db, case_id)

    if current_user.role == "OFFICER" and case.assigned_officer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: You cannot update a case assigned to another officer.",
        )

    updated_case = case_service.update_case(db=db, case_id=case_id, case_in=case_in, user_id=current_user.id)
    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="UPDATE_CASE",
        resource_type="CASE",
        resource_id=case.id,
        details={"status": updated_case.status, "priority": updated_case.priority},
    )
    return updated_case


@router.post("/{case_id}/assign", response_model=CaseResponse)
def assign_case(
    case_id: str,
    assign_in: CaseAssign,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db),
):
    """SUPERVISOR / ADMIN: Assigns a case to an authorized officer."""
    case = case_service.assign_officer(
        db=db,
        case_id=case_id,
        officer_id=assign_in.officer_id,
        actor_id=current_user.id,
    )
    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="ASSIGN_CASE",
        resource_type="CASE",
        resource_id=case.id,
        details={"assigned_officer_id": assign_in.officer_id},
    )
    return case


@router.get("/{case_id}/timeline", response_model=List[CaseTimelineResponse])
def get_case_timeline(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves full audit timeline for the specified case."""
    return case_service.get_timeline(db=db, case_id=case_id)


@router.post("/{case_id}/notes", response_model=CaseTimelineResponse, status_code=status.HTTP_201_CREATED)
def add_case_note(
    case_id: str,
    note_in: CaseNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Appends an investigative note to the case timeline."""
    return case_service.add_note(db=db, case_id=case_id, note=note_in.note, user_id=current_user.id)
