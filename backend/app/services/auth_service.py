"""
Authentication and User Account Management Service.
Handles credential verification, JWT issuance, admin seeding, and token invalidation.
"""

from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.core.security import verify_password, get_password_hash, create_access_token, revoke_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate


class AuthService:
    def authenticate_user(self, db: Session, login_data: LoginRequest) -> User:
        """Validates credentials; raises 401 Unauthorized if invalid or inactive."""
        user = db.scalar(select(User).where(User.email == login_data.email.lower()))
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated. Contact system administrator.",
            )
        return user

    def create_token_for_user(self, user: User) -> TokenResponse:
        """Issues a signed JWT bearer token containing essential identity claims."""
        token = create_access_token(
            subject=user.id,
            claims={
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name,
            }
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            email=user.email,
            role=user.role,
            full_name=user.full_name,
        )

    def logout_user(self, token: str) -> None:
        """Revokes the given token from future acceptance."""
        revoke_token(token)

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        """Registers a new system user with hashed credentials."""
        existing = db.scalar(select(User).where(User.email == user_in.email.lower()))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email '{user_in.email}' already exists.",
            )

        user = User(
            email=user_in.email.lower(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role.upper(),
            badge_number=user_in.badge_number,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def init_admin_if_needed(self, db: Session) -> Optional[User]:
        """
        Idempotently creates the initial administrator user if no user exists.
        Reads initial credentials from settings (never hardcoded in code).
        """
        try:
            admin = db.scalar(select(User).where(User.role == "ADMIN"))
            if not admin:
                logger.info(f"Initializing initial administrator account ({settings.ADMIN_INITIAL_EMAIL})...")
                admin = User(
                    email=settings.ADMIN_INITIAL_EMAIL.lower(),
                    hashed_password=get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
                    full_name=settings.ADMIN_INITIAL_NAME,
                    role="ADMIN",
                    badge_number="ADMIN-001",
                    is_active=True,
                )
                db.add(admin)
                db.commit()
                db.refresh(admin)
                logger.info("Administrator account initialized successfully.")
                return admin
            return admin
        except Exception as exc:
            db.rollback()
            logger.warning(f"Failed to auto-seed admin user (database may need migration first): {exc}")
            return None


auth_service = AuthService()
