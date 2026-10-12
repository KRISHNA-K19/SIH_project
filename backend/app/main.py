"""
VERITAS — AI-Based Fake Identity & Document Screening System.
Main FastAPI application entrypoint.
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import uuid
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import setup_logging, logger, request_id_ctx_var
from app.db.base import Base
from app.db.session import engine, SessionLocal, check_db_connection
from app.services.auth_service import auth_service
from app.api.v1.api import api_v1_router
from app.schemas.common import HealthResponse, ReadinessResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    # 1. Initialize logging
    setup_logging(debug=settings.DEBUG)
    logger.info(f"Starting {settings.PROJECT_NAME} (v{settings.VERSION})...")

    # 2. Verify storage directory existence
    storage_path = settings.resolved_storage_path
    logger.info(f"Private file storage path resolved: {storage_path}")

    # 3. Verify Database connection & initialize schema / admin
    is_db_connected, db_msg = check_db_connection()
    if is_db_connected:
        logger.info("Database connection verified successfully.")
        # Create tables automatically if using new database
        try:
            Base.metadata.create_all(bind=engine)
            # Idempotently seed admin user
            with SessionLocal() as db:
                auth_service.init_admin_if_needed(db)
        except Exception as exc:
            logger.warning(f"Database schema initialization warning: {exc}")
    else:
        logger.warning(
            f"Database not currently accessible ({db_msg}). "
            "Server will start in offline configuration mode. Run PostgreSQL and migrations to enable full functionality."
        )

    yield

    logger.info("Shutting down VERITAS application service.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "VERITAS is an enterprise-grade AI-assisted identity document screening and forensic verification system. "
        "Provides optical character recognition (PaddleOCR), ICAO 9303 MRZ parsing, OpenCV image quality analysis, "
        "cross-document consistency checks, and explainable decision-support risk scoring for authorized officers."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ------------------------------------------------------------------------------
# Middlewares
# ------------------------------------------------------------------------------

# CORS Middleware restricted to configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """Injects unique Request-ID into context and response headers."""
    req_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:16]
    token = request_id_ctx_var.set(req_id)
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response
    finally:
        request_id_ctx_var.reset(token)


# ------------------------------------------------------------------------------
# Exception Handlers
# ------------------------------------------------------------------------------

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Formats HTTP exceptions consistently."""
    req_id = request_id_ctx_var.get() or "-"
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail,
            "request_id": req_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic schema validation failures with field-level details."""
    req_id = request_id_ctx_var.get() or "-"
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({
            "field": field,
            "message": err.get("msg"),
            "type": err.get("type"),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "status_code": 422,
            "message": "Validation error: Input data does not satisfy schema requirements.",
            "details": errors,
            "request_id": req_id,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Safely catches and logs unexpected server exceptions."""
    req_id = request_id_ctx_var.get() or "-"
    logger.error(f"Unhandled server exception [req:{req_id}]: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": 500,
            "message": "An internal server error occurred. Please contact the administrator.",
            "request_id": req_id,
        },
    )


# ------------------------------------------------------------------------------
# Health & Status Endpoints
# ------------------------------------------------------------------------------

@app.get("/", tags=["Health & Status"])
def root_status():
    """System welcome and operational metadata."""
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "api_v1_prefix": settings.API_V1_PREFIX,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/health", response_model=HealthResponse, tags=["Health & Status"])
def health_liveness():
    """Liveness probe indicating that the HTTP process is responsive."""
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/health/ready", response_model=ReadinessResponse, tags=["Health & Status"])
def health_readiness():
    """
    Readiness probe validating external dependencies:
    - PostgreSQL database connectivity
    - Private file storage writability
    """
    is_db_connected, db_message = check_db_connection()

    # Verify storage writability
    storage_writable = False
    try:
        test_file = settings.resolved_storage_path / ".readiness_probe"
        test_file.write_text("probe", encoding="utf-8")
        test_file.unlink()
        storage_writable = True
    except Exception as exc:
        logger.warning(f"Storage readiness check failed: {exc}")

    is_ready = is_db_connected and storage_writable
    status_code = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if is_ready else "degraded",
            "database_connected": is_db_connected,
            "database_detail": db_message,
            "storage_writable": storage_writable,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# ------------------------------------------------------------------------------
# Mount API v1 Routers
# ------------------------------------------------------------------------------
app.include_router(api_v1_router)
