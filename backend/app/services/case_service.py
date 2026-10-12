"""
Case management service handling case workflows, state machines,
officer assignments, search filters, and timeline events.
"""

from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, func, or_, desc, and_
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models.case import Case
from app.models.subject import CaseSubject
from app.models.user import User
from app.models.timeline import CaseTimeline
from app.models.document import Document
from app.models.analysis import AnalysisRun
from app.models.decision import OfficerDecision
from app.schemas.case import CaseCreate, CaseUpdate


# Permitted Case State Transitions
VALID_STATE_TRANSITIONS = {
    "PENDING_REVIEW": {"IN_PROGRESS", "ESCALATED", "CLOSED"},
    "IN_PROGRESS": {"PENDING_REVIEW", "ESCALATED", "CLOSED"},
    "ESCALATED": {"IN_PROGRESS", "CLOSED"},
    "CLOSED": {"IN_PROGRESS"},  # Reopen
}


class CaseService:
    @staticmethod
    def generate_case_number(db: Session) -> str:
        """Generates sequential case identifier: CAS-YYYY-XXXX."""
        year = datetime.now(timezone.utc).year
        prefix = f"CAS-{year}-"

        # Count cases with current year prefix
        count = db.scalar(
            select(func.count(Case.id)).where(Case.case_number.like(f"{prefix}%"))
        ) or 0

        sequence = count + 1
        return f"{prefix}{sequence:04d}"

    def create_case(
        self,
        db: Session,
        case_in: CaseCreate,
        creator_id: str,
    ) -> Case:
        """Creates a new screening case with optional initial subject profile."""
        case_number = self.generate_case_number(db)

        case = Case(
            case_number=case_number,
            title=case_in.title,
            description=case_in.description,
            priority=case_in.priority.upper(),
            status="PENDING_REVIEW",
            created_by_id=creator_id,
        )
        db.add(case)
        db.flush()

        # Add initial subjects if supplied
        if case_in.subjects:
            for s_in in case_in.subjects:
                subject = CaseSubject(
                    case_id=case.id,
                    full_name=s_in.full_name,
                    date_of_birth=s_in.date_of_birth,
                    nationality=s_in.nationality.upper() if s_in.nationality else None,
                    id_number=s_in.id_number,
                    gender=s_in.gender,
                    address=s_in.address,
                    notes=s_in.notes,
                )
                db.add(subject)

        # Record timeline event
        timeline_entry = CaseTimeline(
            case_id=case.id,
            user_id=creator_id,
            event_type="CASE_CREATED",
            description=f"Case '{case.case_number}' initiated: {case.title}",
            metadata_json=json.dumps({"priority": case.priority, "subjects_count": len(case_in.subjects or [])}),
        )
        db.add(timeline_entry)

        db.commit()
        db.refresh(case)
        return case

    def get_cases(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        assigned_officer_id: Optional[str] = None,
        search_query: Optional[str] = None,
        user: Optional[User] = None,
    ) -> Tuple[List[Case], int]:
        """Lists cases with RBAC filtering, search terms, and pagination."""
        query = select(Case)

        # RBAC: Officer only sees assigned cases and unassigned queue (unless Supervisor/Admin)
        if user and user.role == "OFFICER":
            query = query.where(
                or_(
                    Case.assigned_officer_id == user.id,
                    Case.assigned_officer_id.is_(None)
                )
            )

        if status_filter:
            query = query.where(Case.status == status_filter.upper())
        if priority_filter:
            query = query.where(Case.priority == priority_filter.upper())
        if assigned_officer_id:
            query = query.where(Case.assigned_officer_id == assigned_officer_id)

        if search_query:
            term = f"%{search_query.strip()}%"
            # Search case number, title, description, or subject names
            query = query.outerjoin(Case.subjects).where(
                or_(
                    Case.case_number.ilike(term),
                    Case.title.ilike(term),
                    Case.description.ilike(term),
                    CaseSubject.full_name.ilike(term),
                    CaseSubject.id_number.ilike(term),
                )
            ).distinct()

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        # Paginate
        offset = (page - 1) * page_size
        cases = db.scalars(
            query.order_by(desc(Case.created_at)).offset(offset).limit(page_size)
        ).all()

        return list(cases), total

    def get_case_by_id(self, db: Session, case_id: str) -> Case:
        """Retrieves single case with subjects and documents or raises 404."""
        case = db.scalar(select(Case).where(Case.id == case_id))
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' does not exist.",
            )
        return case

    def update_case(
        self,
        db: Session,
        case_id: str,
        case_in: CaseUpdate,
        user_id: str,
    ) -> Case:
        """Updates allowed case fields and manages valid state transitions."""
        case = self.get_case_by_id(db, case_id)

        if case_in.title is not None:
            case.title = case_in.title
        if case_in.description is not None:
            case.description = case_in.description
        if case_in.priority is not None:
            case.priority = case_in.priority.upper()

        if case_in.status is not None:
            new_status = case_in.status.upper()
            if new_status != case.status:
                allowed_next = VALID_STATE_TRANSITIONS.get(case.status, set())
                if new_status not in allowed_next:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Invalid state transition: Cannot change status from '{case.status}' to '{new_status}'. "
                            f"Permitted next states: {list(allowed_next)}"
                        ),
                    )

                old_status = case.status
                case.status = new_status

                # Record transition in timeline
                db.add(CaseTimeline(
                    case_id=case.id,
                    user_id=user_id,
                    event_type="STATUS_CHANGED",
                    description=f"Case status transitioned from '{old_status}' to '{new_status}'.",
                    metadata_json=json.dumps({"old_status": old_status, "new_status": new_status}),
                ))

        case.updated_at = utc_now()
        db.commit()
        db.refresh(case)
        return case

    def assign_officer(
        self,
        db: Session,
        case_id: str,
        officer_id: str,
        actor_id: str,
    ) -> Case:
        """Assigns an authorized officer to the case."""
        case = self.get_case_by_id(db, case_id)
        officer = db.scalar(select(User).where(User.id == officer_id))

        if not officer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Officer with ID '{officer_id}' not found.",
            )
        if not officer.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign case to an inactive user.",
            )

        case.assigned_officer_id = officer.id
        case.updated_at = utc_now()

        # Update status to IN_PROGRESS if currently PENDING_REVIEW
        if case.status == "PENDING_REVIEW":
            case.status = "IN_PROGRESS"

        db.add(CaseTimeline(
            case_id=case.id,
            user_id=actor_id,
            event_type="OFFICER_ASSIGNED",
            description=f"Case assigned to {officer.full_name} ({officer.role})",
            metadata_json=json.dumps({"assigned_officer_id": officer.id, "badge": officer.badge_number}),
        ))

        db.commit()
        db.refresh(case)
        return case

    def add_note(
        self,
        db: Session,
        case_id: str,
        note: str,
        user_id: str,
    ) -> CaseTimeline:
        """Adds an investigation note to the case timeline."""
        case = self.get_case_by_id(db, case_id)

        entry = CaseTimeline(
            case_id=case.id,
            user_id=user_id,
            event_type="NOTE_ADDED",
            description=note,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    def get_timeline(self, db: Session, case_id: str) -> List[CaseTimeline]:
        """Retrieves chronologically ordered case events."""
        self.get_case_by_id(db, case_id)
        events = db.scalars(
            select(CaseTimeline).where(CaseTimeline.case_id == case_id).order_by(CaseTimeline.created_at.asc())
        ).all()
        return list(events)


case_service = CaseService()
