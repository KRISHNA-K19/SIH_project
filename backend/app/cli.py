"""
Administrative CLI utilities for VERITAS.
Supports secure administrator bootstrapping and diagnostics.
"""

import argparse
import sys
from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import engine, SessionLocal, check_db_connection
from app.models.user import User


def cmd_init_admin():
    """Initializes administrator account from environment configuration."""
    print("Checking database connection...")
    connected, msg = check_db_connection()
    if not connected:
        print(f"Error: Database is unreachable: {msg}", file=sys.stderr)
        sys.exit(1)

    # Ensure schema exists
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        admin = db.scalar(select(User).where(User.role == "ADMIN"))
        if admin:
            print(f"Admin already exists: {admin.email} (Badge: {admin.badge_number})")
            return

        print(f"Creating administrator account: {settings.ADMIN_INITIAL_EMAIL}...")
        new_admin = User(
            email=settings.ADMIN_INITIAL_EMAIL.lower(),
            hashed_password=get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
            full_name=settings.ADMIN_INITIAL_NAME,
            role="ADMIN",
            badge_number="ADMIN-001",
            is_active=True,
        )
        db.add(new_admin)
        db.commit()
        print("Administrator account successfully created!")


def cmd_check_db():
    """Diagnostics check for database and storage."""
    print("Testing database connectivity...")
    connected, msg = check_db_connection()
    if connected:
        print(f"[OK] Database connection operational: {settings.DATABASE_URL}")
    else:
        print(f"[FAIL] Database unreachable: {msg}")

    print("Testing storage directory...")
    path = settings.resolved_storage_path
    print(f"[OK] Private storage directory: {path}")


def main():
    parser = argparse.ArgumentParser(description="VERITAS Administrative CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    subparsers.add_parser("init-admin", help="Create initial administrator user from environment")
    subparsers.add_parser("check-db", help="Verify database connection and readiness")

    args = parser.parse_args()

    if args.command == "init-admin":
        cmd_init_admin()
    elif args.command == "check-db":
        cmd_check_db()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
