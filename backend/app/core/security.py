"""
Security and cryptographic functions: password hashing, verification, and JWT manipulation.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Set
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# CryptContext configured with Argon2 as primary scheme, bcrypt as fallback
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto"
)

# Revoked JWT token jti/tokens set for in-process token revocation on logout
_revoked_tokens: Set[str] = set()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Computes a secure hash using Argon2 (or bcrypt fallback)."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a signed JWT access token.
    subject: typically the user ID (UUID string).
    claims: additional claims such as role, email.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if claims:
        to_encode.update(claims)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT token.
    Raises JWTError if signature is invalid, token has expired, or token is revoked.
    """
    if is_token_revoked(token):
        raise JWTError("Token has been revoked/logged out")

    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return payload


def revoke_token(token: str) -> None:
    """Adds a token to the revoked tokens set (used during logout)."""
    _revoked_tokens.add(token)


def is_token_revoked(token: str) -> bool:
    """Checks if a token has been revoked."""
    return token in _revoked_tokens
