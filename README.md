# VERITAS — AI-Based Fake Identity & Document Screening System
### Smart India Hackathon (SIH) Project Repository

**VERITAS** is an AI-powered screening and forensic evaluation system designed to detect fraudulent identity documents, validate optical machine-readable zones (MRZ) against ICAO 9303 standards, assess document capture quality using computer vision, and discover cross-case duplicate identity anomalies — all while maintaining explainable evidence trails for human officer decision-making.

---

## 🏗️ Repository Architecture

```
VERITAS/
├── backend/                        # Production FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                 # FastAPI application, lifespan, middleware & CORS
│   │   ├── cli.py                  # Administrative CLI (init-admin, health checks)
│   │   ├── api/v1/                 # REST API endpoints (Auth, Cases, Documents, Analysis, Decisions, Audit)
│   │   ├── core/                   # Security (Argon2/JWT), configuration, RBAC, logging
│   │   ├── db/                     # SQLAlchemy 2.0 Base, engine, and session management
│   │   ├── models/                 # 12 ORM models (Users, Cases, Documents, Analysis, Links, Audit)
│   │   ├── schemas/                # Pydantic v2 schemas and data validation
│   │   ├── services/               # Modular forensic analysis, MRZ validation, OpenCV quality, OCR
│   │   └── storage/                # Secure private document storage (SHA-256 deduplication)
│   ├── migrations/                 # Alembic database migrations
│   ├── tests/                      # Automated test suite (36 unit & integration tests)
│   ├── requirements.txt            # Python dependencies
│   ├── alembic.ini                 # Migration configuration
│   ├── .env.example                # Environment variable template
│   └── README.md                   # Backend architecture documentation
├── .gitignore                      # Git ignore rules for venv, secrets, and temp files
└── README.md                       # Project overview and quick start guide
```

---

## ⚡ Key Features

1. **ICAO 9303 MRZ Checksum Validation**:
   - Parses and validates standard TD1 (Identity Cards), TD2, and TD3 (Passports).
   - Verifies individual and composite 7-3-1 weighting checksums to detect tampered document numbers and dates.
2. **Computer Vision Document Quality Checks**:
   - Evaluates image sharpness using Laplacian variance (blur detection).
   - Assesses minimum pixel resolution and contrast distribution.
3. **Cross-Document Duplicate Correlation**:
   - Identifies cross-case identity links (same document number or subject across different case records).
4. **Explainable Risk Scoring Engine**:
   - Aggregates forensic findings into transparent, rule-weighted risk levels (`LOW`, `MEDIUM`, `HIGH`).
   - Every score is backed by clear, interpretable evidence items.
5. **Human-in-the-Loop Officer Determinations**:
   - AI results serve as decision support only.
   - Authorized officers record final decisions (`CLEARED`, `ESCALATED`, `REFERRED_FOR_MANUAL_VERIFICATION`) with mandatory remarks.
6. **Role-Based Access Control (RBAC)**:
   - Granular permissions for `OFFICER`, `SUPERVISOR`, and `ADMIN`.
7. **Tamper-Evident Audit Trail**:
   - Every login, case creation, status transition, document upload, and officer decision produces an audit log entry.

---

## 🚀 Backend Quick Start

### 1. Prerequisites
- Python 3.11+
- PostgreSQL 16+

### 2. Setup Virtual Environment
```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 5. Run Migrations & Initialize Admin
```bash
alembic upgrade head
python -m app.cli init-admin
```

### 6. Start the Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Interactive Health Check: [http://127.0.0.1:8000/health/ready](http://127.0.0.1:8000/health/ready)

### 7. Run Tests
```bash
pytest -v
```

---

## 📄 License
MIT License
