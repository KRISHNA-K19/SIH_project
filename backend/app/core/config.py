"""
Application configuration module for VERITAS.
Reads settings from environment variables and .env file.
"""

from pathlib import Path
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_STORAGE_DIR = BACKEND_DIR / "storage"


class Settings(BaseSettings):
    # App Information
    PROJECT_NAME: str = "VERITAS – AI-Based Fake Identity & Document Screening System"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Database Configuration (PostgreSQL primary)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/veritas_db"
    TEST_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/veritas_test_db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_PRE_PING: bool = True

    # Security & JWT Tokens
    SECRET_KEY: str = "veritas_development_secret_key_super_secure_min_32_bytes_long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Storage Settings
    STORAGE_DIR: str = str(DEFAULT_STORAGE_DIR)
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
    ALLOWED_EXTENSIONS: str = ".jpg,.jpeg,.png"

    # CORS Settings
    ALLOWED_CORS_ORIGINS: str = (
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    )

    # Initial Administrator Account (for first-time initialization)
    ADMIN_INITIAL_EMAIL: str = "admin@veritas.local"
    ADMIN_INITIAL_PASSWORD: str = "AdminSecurePassword123!"
    ADMIN_INITIAL_NAME: str = "System Administrator"

    # Analysis Engine Policy
    ANALYSIS_POLICY_VERSION: str = "1.0.0"
    MRZ_CHECK_ENABLED: bool = True
    IMAGE_QUALITY_CHECK_ENABLED: bool = True
    OCR_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def allowed_extension_list(self) -> List[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",") if ext.strip()]

    @property
    def resolved_storage_path(self) -> Path:
        p = Path(self.STORAGE_DIR)
        if not p.is_absolute():
            p = (BACKEND_DIR / p).resolve()
        p.mkdir(parents=True, exist_ok=True)
        (p / "documents" / "original").mkdir(parents=True, exist_ok=True)
        (p / "documents" / "processed").mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
