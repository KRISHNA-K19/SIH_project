# VERITAS — AI-Based Fake Identity & Document Screening System
## Enterprise Backend Service

VERITAS is an enterprise-grade backend system designed for high-assurance screening and forensic evaluation of identity documents (passports, national ID cards, visas, and driver's licenses). It features a multi-stage modular verification pipeline, ICAO 9303 checksum validation, OpenCV capture-quality analysis, cross-case anomaly correlation, and explainable decision-support risk scoring with human-in-the-loop officer determinations.

---

## 1. Technology Stack

- **Framework**: FastAPI (Python 3.11+)
- **ASGI Server**: Uvicorn
- **Database**: PostgreSQL with SQLAlchemy 2.x ORM
- **Migrations**: Alembic
- **Data Validation & Schemas**: Pydantic v2
- **Authentication**: JWT (JSON Web Tokens) via `python-jose`
- **Password Hashing**: Argon2 (with bcrypt fallback) via `passlib`
- **Image Quality Analysis**: OpenCV (`opencv-python-headless`) & Pillow
- **MRZ Verification**: ICAO 9303 checksum validation for TD1, TD2, and TD3 documents
- **OCR Engine Interface**: Modular architecture interfacing with PaddleOCR when installed
- **Testing**: Pytest & HTTPX TestClient
- **Storage**: Private isolated local file storage with SHA-256 deduplication and magic-byte signature verification

---

## 2. Architecture & Directory Layout

```
backend/
├── app/
│   ├── main.py                     # Application entrypoint, lifespan, CORS & middlewares
│   ├── cli.py                      # Administrative CLI (init-admin, diagnostics)
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings environment configuration
│   │   ├── security.py             # Argon2 password hashing, JWT creation & token revocation
│   │   ├── permissions.py          # RBAC roles (OFFICER, SUPERVISOR, ADMIN) and access checks
│   │   └── logging.py              # Structured logging with contextual Request-ID tracking
│   ├── api/
│   │   ├── deps.py                 # Dependency injection: database sessions, auth, RBAC
│   │   └── v1/
│   │       ├── api.py              # API v1 aggregator router
│   │       ├── auth.py             # Login, logout, current user, user provisioning
│   │       ├── dashboard.py        # Real-time metrics and recent timeline activities
│   │       ├── cases.py            # Case CRUD, state machine transitions, assignment, notes
│   │       ├── documents.py        # Secure upload, metadata, and private streaming downloads
│   │       ├── analysis.py         # Analysis trigger, findings, cross-checks, identity links
│   │       ├── decisions.py        # Officer human-in-the-loop determinations with comments
│   │       └── audit.py            # Tamper-evident security audit trail queries
│   ├── db/
│   │   ├── base.py                 # SQLAlchemy 2.0 DeclarativeBase and TimestampMixin
│   │   └── session.py              # Engine configuration, sessionmaker, readiness probe
│   ├── models/                     # 12 ORM models (User, Case, Document, Analysis, etc.)
│   ├── schemas/                    # Pydantic v2 request/response models with ConfigDict
│   ├── services/
│   │   ├── auth_service.py         # User credential verification and token lifecycle
│   │   ├── case_service.py         # Case workflow engine and valid state transitions
│   │   ├── document_service.py     # Document record management
│   │   ├── image_quality_service.py# OpenCV blur, resolution, and contrast evaluation
│   │   ├── mrz_service.py          # ICAO 9303 check digit parser (TD1, TD2, TD3)
│   │   ├── ocr_service.py          # Modular OCR interface (PaddleOCR with UNAVAILABLE handling)
│   │   ├── cross_check_service.py  # Field matching and cross-case duplicate link discovery
│   │   ├── risk_service.py         # Explainable decision-support risk scoring engine
│   │   ├── decision_service.py     # Officer determinations and status synchronization
│   │   ├── dashboard_service.py    # Live PostgreSQL aggregation counts
│   │   └── audit_service.py        # System-wide audit event recorder
│   └── storage/
│       └── file_storage.py         # Secure local filesystem storage with path traversal guards
├── migrations/
│   ├── env.py                      # Alembic environment linked to models and DB settings
│   ├── script.py.mako              # Migration script template
│   └── versions/
│       └── 001_initial_schema.py   # Complete initial database schema migration
├── storage/                        # Private local document repository (outside public static)
│   ├── documents/original/         # Preserved pristine uploaded document files
│   └── documents/processed/        # Processed or masked analytical artifacts
├── tests/                          # 36 automated test cases covering all subsystems
│   ├── conftest.py                 # In-memory test DB with StaticPool & test fixtures
│   ├── test_health.py              # Liveness and readiness endpoints
│   ├── test_auth.py                # Login, invalid credentials, logout revocation, RBAC
│   ├── test_cases.py               # Case creation, state machine, assignment, notes
│   ├── test_documents.py           # Upload validations, signature verification, download
│   ├── test_analysis.py            # Pipeline, MRZ checksums, image quality, cross-checks
│   ├── test_decisions.py           # Officer determinations and mandatory justifications
│   └── test_audit.py               # Audit log recording and supervisor access
├── requirements.txt                # Pinned dependency requirements
├── alembic.ini                     # Migration tooling configuration
├── .env.example                    # Environment variable template with secure placeholders
├── .gitignore                      # Git ignore rules for secrets, virtual environments, and uploads
└── README.md                       # Comprehensive system documentation
```

---

## 3. Database & Models

VERITAS manages 12 interrelated ORM models equipped with UUID primary keys, foreign key constraints, UTC timestamps, and query performance indexes:

1. **User**: Authentication, roles (`OFFICER`, `SUPERVISOR`, `ADMIN`), badges, activity state.
2. **Case**: Case identification (`CAS-YYYY-XXXX`), priority, assignment, and status lifecycle (`PENDING_REVIEW`, `IN_PROGRESS`, `ESCALATED`, `CLOSED`).
3. **CaseSubject**: Declared individual profile (full name, date of birth, nationality, ID number).
4. **Document**: File metadata, MIME type, file size, SHA-256 cryptographic hash, private disk path.
5. **AnalysisRun**: Pipeline execution lifecycle (`PENDING`, `PROCESSING`, `COMPLETED`, `PARTIAL`, `UNAVAILABLE`, `FAILED`), algorithm version, timestamps.
6. **ExtractedField**: Extracted text attributes with confidence ratings and verification source (`OCR`, `MRZ`, `MANUAL`).
7. **EvidenceFinding**: Categorized observations (`BLUR_DETECTED`, `MRZ_CHECKSUM_FAILED`, `FIELD_MISMATCH`) with severity tiers (`INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
8. **RiskAssessment**: Calibrated score (0.0 to 100.0), risk tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), policy version, contributing factor breakdown, and explainable disclaimer.
9. **OfficerDecision**: Official determination outcome (`CLEARED`, `ESCALATED`, `REFERRED_FOR_MANUAL_VERIFICATION`, `PENDING_REVIEW`) with mandatory justification comments.
10. **CaseTimeline**: Chronological case event history.
11. **AuditEvent**: System-wide tamper-evident security audit log.
12. **IdentityLink**: Cross-case correlations (duplicate document SHA-256, identical identity numbers).

---

## 4. Setup and Installation

### Prerequisites
- Python 3.11 or higher
- PostgreSQL 14 or higher (or Docker)
- Git

### Step 1: Create PostgreSQL Database
Run the following commands in `psql` or pgAdmin:
```sql
CREATE USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE veritas_db OWNER postgres;
CREATE DATABASE veritas_test_db OWNER postgres;
```

### Step 2: Virtual Environment & Dependencies
From the `backend` directory:
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Environment Configuration
Copy `.env.example` to `.env`:
```bash
copy .env.example .env   # Windows
cp .env.example .env     # Linux / macOS
```
Edit `.env` to configure your credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/veritas_db"
SECRET_KEY="replace_with_a_high_entropy_secret_key_minimum_32_bytes"
ADMIN_INITIAL_EMAIL="admin@veritas.gov"
ADMIN_INITIAL_PASSWORD="AdminSecurePassword123!"
ADMIN_INITIAL_NAME="System Administrator"
```

### Step 4: Run Database Migrations
Execute Alembic migrations to construct the database schema:
```bash
alembic upgrade head
```

### Step 5: Initialize Administrator Account
Initialize the first admin account (uses values from `.env`):
```bash
python -m app.cli init-admin
```

---

## 5. Running the Application

### Start the Uvicorn Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Interactive Documentation & Health URLs
- **Swagger Interactive API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Liveness Probe**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Readiness Probe**: [http://127.0.0.1:8000/health/ready](http://127.0.0.1:8000/health/ready)
- **Root Status**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 6. Running Automated Tests

Run the full automated test suite using Pytest:
```bash
pytest -v
```
All 36 tests run in isolated environments with in-memory SQLite and temporary storage, leaving production databases untouched.

---

## 7. API Endpoints Overview

| Method | Endpoint | Description | Auth Required | Minimum Role |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/v1/auth/login` | Issues JWT access token | No | Public |
| `POST` | `/api/v1/auth/logout` | Revokes current JWT token | Yes | OFFICER |
| `GET` | `/api/v1/auth/me` | Current user profile and role | Yes | OFFICER |
| `POST` | `/api/v1/auth/users` | Creates new system user | Yes | ADMIN |
| `GET` | `/api/v1/auth/officers` | Lists available officers | Yes | SUPERVISOR |
| `GET` | `/api/v1/dashboard` | Real-time case and risk metrics | Yes | OFFICER |
| `GET` | `/api/v1/dashboard/activity` | Recent activity feed | Yes | OFFICER |
| `POST` | `/api/v1/cases` | Creates new screening case | Yes | OFFICER |
| `GET` | `/api/v1/cases` | Lists cases with pagination & search | Yes | OFFICER |
| `GET` | `/api/v1/cases/{case_id}` | Case details & counts | Yes | OFFICER |
| `PATCH`| `/api/v1/cases/{case_id}` | Updates case / valid state transition| Yes | OFFICER |
| `POST` | `/api/v1/cases/{case_id}/assign` | Assigns case to officer | Yes | SUPERVISOR |
| `GET` | `/api/v1/cases/{case_id}/timeline`| Chronological event log | Yes | OFFICER |
| `POST` | `/api/v1/cases/{case_id}/notes`| Adds investigative note | Yes | OFFICER |
| `POST` | `/api/v1/cases/{case_id}/documents`| Validates & uploads document | Yes | OFFICER |
| `GET` | `/api/v1/cases/{case_id}/documents`| Lists documents for case | Yes | OFFICER |
| `GET` | `/api/v1/documents/{document_id}`| Document metadata | Yes | OFFICER |
| `GET` | `/api/v1/documents/{document_id}/file`| Streams private document file | Yes | OFFICER |
| `POST` | `/api/v1/cases/{case_id}/analysis`| Triggers screening pipeline | Yes | OFFICER |
| `GET` | `/api/v1/analysis/{analysis_id}`| Full analysis run results | Yes | OFFICER |
| `POST` | `/api/v1/cases/{case_id}/cross-check`| Cross-checks fields | Yes | OFFICER |
| `GET` | `/api/v1/cases/{case_id}/identity-links`| Discovered cross-case links | Yes | OFFICER |
| `POST` | `/api/v1/cases/{case_id}/decisions`| Records officer determination | Yes | OFFICER |
| `GET` | `/api/v1/cases/{case_id}/decisions`| Historical determinations | Yes | OFFICER |
| `GET` | `/api/v1/audit` | Queries security audit trail | Yes | SUPERVISOR |
| `GET` | `/health` | Liveness health probe | No | Public |
| `GET` | `/health/ready` | PostgreSQL & storage readiness probe | No | Public |

---

## 8. Compliance & Ethical Boundaries

1. **No Automated Adjudication**: AI results and risk scores function strictly as decision-support evidence. The system cannot automatically approve or reject a subject; final determinations are reserved exclusively for authorized officers.
2. **No Data Fabrication**: If optical character recognition, MRZ zones, or external dependencies are unavailable, the system explicitly returns `UNAVAILABLE` or `PARTIAL` status with clear diagnostic explanations rather than fabricating synthetic data.
3. **Capture Quality vs. Forgery**: Image quality checks (Laplacian blur, resolution, and exposure) reflect physical capture conditions and do not claim to prove document forgery.
4. **No Unauthorized Databases**: The system does not connect to unauthorized external identity databases; cross-checks occur strictly within the authorized system boundary.
