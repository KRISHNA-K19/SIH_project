"""
Pytest configuration and fixtures.
Configures an isolated SQLite database fixture and TestClient for fast, clean, non-destructive testing.
"""

import io
import os
import pytest
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.testclient import TestClient

from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User

from sqlalchemy.pool import StaticPool

# Use an isolated test database with StaticPool so all threads share the same in-memory database
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment(tmp_path_factory):
    """Overrides storage directory and database connectivity check for isolated testing."""
    temp_storage = tmp_path_factory.mktemp("veritas_test_storage")
    settings.STORAGE_DIR = str(temp_storage)
    (temp_storage / "documents" / "original").mkdir(parents=True, exist_ok=True)
    (temp_storage / "documents" / "processed").mkdir(parents=True, exist_ok=True)
    import app.db.session
    app.db.session.check_db_connection = lambda: (True, "Test database connected")


@pytest.fixture(scope="function")
def db_session():
    """Provides a pristine transactional database session for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Provides a TestClient with get_db dependency overridden to the isolated test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session) -> User:
    user = User(
        email="admin@veritas.gov",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Admin Tester",
        role="ADMIN",
        badge_number="ADM-999",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def supervisor_user(db_session) -> User:
    user = User(
        email="supervisor@veritas.gov",
        hashed_password=get_password_hash("SupervisorPass123!"),
        full_name="Supervisor Tester",
        role="SUPERVISOR",
        badge_number="SUP-101",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def officer_user(db_session) -> User:
    user = User(
        email="officer@veritas.gov",
        hashed_password=get_password_hash("OfficerPass123!"),
        full_name="Officer Tester",
        role="OFFICER",
        badge_number="OFF-202",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def officer_user_2(db_session) -> User:
    user = User(
        email="officer2@veritas.gov",
        hashed_password=get_password_hash("Officer2Pass123!"),
        full_name="Officer Two",
        role="OFFICER",
        badge_number="OFF-203",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_headers(admin_user) -> dict:
    token = create_access_token(subject=admin_user.id, claims={"role": admin_user.role, "email": admin_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def supervisor_headers(supervisor_user) -> dict:
    token = create_access_token(subject=supervisor_user.id, claims={"role": supervisor_user.role, "email": supervisor_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def officer_headers(officer_user) -> dict:
    token = create_access_token(subject=officer_user.id, claims={"role": officer_user.role, "email": officer_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def officer_headers_2(officer_user_2) -> dict:
    token = create_access_token(subject=officer_user_2.id, claims={"role": officer_user_2.role, "email": officer_user_2.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def valid_jpeg_bytes() -> bytes:
    """Generates a valid in-memory test JPEG image (800x600)."""
    img = Image.new("RGB", (800, 600), color=(200, 200, 200))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return buffer.getvalue()


@pytest.fixture
def valid_png_bytes() -> bytes:
    """Generates a valid in-memory test PNG image (800x600)."""
    img = Image.new("RGB", (800, 600), color=(100, 150, 200))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()
