"""
Role-based access control (RBAC) and permissions definition.
"""

from enum import Enum
from typing import List
from fastapi import HTTPException, status


class UserRole(str, Enum):
    OFFICER = "OFFICER"
    SUPERVISOR = "SUPERVISOR"
    ADMIN = "ADMIN"


ROLE_HIERARCHY = {
    UserRole.OFFICER: 1,
    UserRole.SUPERVISOR: 2,
    UserRole.ADMIN: 3,
}


def role_satisfies(user_role: str, minimum_role: UserRole) -> bool:
    """Checks whether the user's role meets or exceeds the required minimum role."""
    try:
        user_enum = UserRole(user_role)
    except ValueError:
        return False
    return ROLE_HIERARCHY.get(user_enum, 0) >= ROLE_HIERARCHY.get(minimum_role, 0)


def enforce_minimum_role(user_role: str, minimum_role: UserRole) -> None:
    """Raises HTTP 403 Forbidden if user role is insufficient."""
    if not role_satisfies(user_role, minimum_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Requires role '{minimum_role.value}' or higher. Current role: '{user_role}'",
        )


def enforce_any_role(user_role: str, allowed_roles: List[UserRole]) -> None:
    """Raises HTTP 403 Forbidden if user role is not in the allowed roles list."""
    try:
        user_enum = UserRole(user_role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Invalid user role '{user_role}'",
        )
    if user_enum not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Role '{user_role}' is not authorized for this resource.",
        )
