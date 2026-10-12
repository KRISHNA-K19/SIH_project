"""
Authentication and User Management Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_admin,
    require_supervisor,
    security_scheme,
    get_client_ip,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse, CurrentUser
from app.schemas.common import MessageResponse
from app.services.auth_service import auth_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication & Users"])


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Authenticates user credentials and issues a JWT Bearer token."""
    user = auth_service.authenticate_user(db, login_data)
    token_resp = auth_service.create_token_for_user(user)

    ip = get_client_ip(request)
    audit_service.log_event(
        db=db,
        user_id=user.id,
        action="LOGIN",
        resource_type="AUTH",
        resource_id=user.id,
        details={"email": user.email, "role": user.role},
        ip_address=ip,
    )

    return token_resp


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revokes the current JWT bearer token and logs out."""
    auth_service.logout_user(credentials.credentials)

    ip = get_client_ip(request)
    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="LOGOUT",
        resource_type="AUTH",
        resource_id=current_user.id,
        ip_address=ip,
    )

    return MessageResponse(message="Successfully logged out and session revoked.")


@router.get("/me", response_model=CurrentUser)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile and role claims of the currently authenticated user."""
    return CurrentUser(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
    )


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """ADMIN ONLY: Creates a new officer, supervisor, or administrator account."""
    new_user = auth_service.create_user(db, user_in)
    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="CREATE_USER",
        resource_type="USER",
        resource_id=new_user.id,
        details={"created_email": new_user.email, "role": new_user.role},
    )
    return new_user


@router.get("/officers", response_model=List[UserResponse])
def list_officers(
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db),
):
    """SUPERVISOR / ADMIN: Lists active officers available for case assignment."""
    officers = db.scalars(
        select(User).where(User.is_active == True).order_by(User.full_name.asc())
    ).all()
    return list(officers)
