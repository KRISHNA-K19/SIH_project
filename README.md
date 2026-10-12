# VERITAS — AI-Assisted Border & Airport Identity Screening and Investigation Platform
### Smart India Hackathon (SIH) — Border Security & Identity Management

**VERITAS** is an AI-powered border security screening and forensic investigation platform engineered for primary checkpoint biometric intake and secondary in-depth document and identity analysis.

The system combines computer vision, optical character recognition (OCR), ICAO 9303 machine-readable zone (MRZ) validation, biometric facial verification, and cross-record correlation to detect fraudulent travel documents, altered identities, and anomalies — while preserving explainable evidence trails for authorized human officer decision-making.

---

## 🏛️ System Architecture

VERITAS is built around a deterministic, explainable evidence hierarchy:

$$\text{RISK ASSESSMENT} \longrightarrow \text{WHY FLAGGED} \longrightarrow \text{FORENSIC EVIDENCE} \longrightarrow \text{INVESTIGATION} \longrightarrow \text{OFFICER ADJUDICATION}$$

```
+-----------------------------------------------------------------------------------+
|                               VERITAS WORKSTATION                                 |
|                         (Next.js 16 / TypeScript / Tailwind)                      |
|                                                                                   |
|  [Operations Console]    [Screening Queue]    [Case Investigation Workspace]      |
|  - Live Lane Telemetry   - Real-time intake   - 8-Tab Nested Forensic Dossier     |
|  - Risk Score Gauges     - Query Filtering    - Biometric & Document Comparators  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST API
                                           v
+-----------------------------------------------------------------------------------+
|                             VERITAS BACKEND SERVICE                               |
|                         (Python 3.11 / FastAPI / SQLAlchemy)                      |
|                                                                                   |
|  [Auth & RBAC]         [Case Workflow Engine]        [Audit Service]              |
|  - Argon2id / JWT      - Lifecycle Transitions       - Tamper-Evident Ledger      |
|  - Officer Sessions    - Case ID Generation          - ISO 27037 Chain-of-Custody |
|                                                                                   |
|  [Document & Forensics Engine]                       [Identity & Risk Fusion]     |
|  - ICAO Doc 9303 MRZ Checksums                       - ArcFace Biometrics         |
|  - OpenCV Laplacian Sharpness / Blur                 - Cross-Document Matrix      |
|  - Tamper & Anomaly Detection                        - Rule-Weighted Risk Scorer  |
+------------------------------------------+----------------------------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
        +-----------------------+                     +-----------------------+
        |  PostgreSQL Database  |                     |  Encrypted Storage    |
        |  - Cases & Subjects   |                     |  - High-res Scans     |
        |  - Evidence Findings  |                     |  - Reference Images   |
        |  - Statutory Decisions|                     |  - SHA-256 Checksums  |
        +-----------------------+                     +-----------------------+
```

---

## 📁 Repository Structure

```
SIH_project/
├── .gitignore                                  # Unified Git ignore rules
├── README.md                                   # Project documentation and setup guide
├── VERITAS_MASTER_ARCHITECTURE_BLUEPRINT.md    # Master architecture and full-stack roadmap
│
├── backend/                                    # Production FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                             # FastAPI application entrypoint & middleware
│   │   ├── cli.py                              # Administrative CLI (init-admin, health)
│   │   ├── api/v1/                             # REST Endpoints (Auth, Cases, Documents, Analysis, Decisions, Audit)
│   │   ├── core/                               # Security (Argon2/JWT), configuration, RBAC, logging
│   │   ├── db/                                 # SQLAlchemy 2.0 Base, engine, and session management
│   │   ├── models/                             # 12 ORM models (Users, Cases, Documents, Analysis, Links, Audit)
│   │   ├── schemas/                            # Pydantic v2 data validation schemas
│   │   ├── services/                           # Forensic analysis, MRZ validation, OpenCV quality, OCR
│   │   └── storage/                            # Secure file storage with SHA-256 deduplication
│   ├── migrations/                             # Alembic database migration scripts
│   ├── tests/                                  # Automated test suite (unit and integration)
│   ├── requirements.txt                        # Python dependencies
│   ├── alembic.ini                             # Migration configuration
│   └── README.md                               # Backend documentation
│
├── stitch_design_system_generator/             # Approved UI specs & Stitch design mockups
│   ├── case_investigation_workspace_upgraded/  # Investigation workspace HTML & layout reference
│   ├── mission_critical_defense_workstation/   # Core workstation palette & DESIGN.md spec
│   └── screening_result_upgraded/              # Screening result screen reference
│
└── veritas-app/                                # Production Next.js 16 Frontend Workstation
    ├── src/
    │   ├── app/                                # Next.js App Router (17 verified routes)
    │   │   ├── audit/                          # Statutory event audit trail
    │   │   ├── cases/                          # Investigation dossiers & dynamic workspaces
    │   │   │   └── [id]/                       # 8-tab nested investigation workspace
    │   │   ├── intelligence/                   # Watchlist & biometric intelligence
    │   │   ├── login/                          # Officer credentialed sign-in
    │   │   ├── overview/                       # Terminal 4 operational overview
    │   │   ├── screening/                      # Live checkpoint screening & intake
    │   │   └── system/                         # Telemetry & service health
    │   ├── components/                         # Modular defense workstation components
    │   │   ├── case/                           # Workspace tabs, headers, matrices
    │   │   ├── layout/                         # Top navigation header & sidebar
    │   │   ├── modals/                         # Officer decision & evidence inspector modals
    │   │   └── ui/                             # Buttons, inputs, risk gauges, badges
    │   ├── context/                            # VeritasContext global state provider
    │   ├── lib/                                # Fixture datasets & deterministic mocks
    │   ├── services/                           # Centralized API service client
    │   └── types/                              # Strict TypeScript data models & schemas
    ├── public/                                 # Static assets & SVG icons
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 🚦 Verified Frontend Routes

All 17 routes are built, tested, and verified with zero compilation or runtime errors:

| Route | Module | Key Screen Capabilities |
|---|---|---|
| `/login` | Access | Officer badge ID, security lane & terminal assignment |
| `/overview` | Operations | Real-time terminal threat meter, active screening lane statuses |
| `/screening` | Operations | Live gate camera feed, document scanner simulation, rapid flag banner |
| `/screening/new` | Screening Intake | 4-step wizard: Subject ID → Document Scan → Photo Capture → Pipeline Run |
| `/screening/queue` | Operations | Real-time queue, filter by lane & risk score, query param URL sync |
| `/cases` | Intelligence | Registry of all active investigation cases and secondary referrals |
| `/cases/[id]/overview` | Investigation | Comprehensive case overview, risk score gauge (82/100), verification matrix |
| `/cases/[id]/documents` | Investigation | ICAO Doc 9303 MRZ parsing, multi-spectral UV/IR/white light document review |
| `/cases/[id]/forensics` | Investigation | Micro-spectroscopy substrate analysis, razor incision and tamper detection |
| `/cases/[id]/identity` | Investigation | Facial landmark vector alignment, biometric similarity score (42.8%) |
| `/cases/[id]/cross-check`| Investigation | Cross-record data correlation: passport vs. visa foil vs. flight manifest |
| `/cases/[id]/evidence` | Investigation | 4-module category diagnostic matrix, forensic evidence locker dialogs |
| `/cases/[id]/timeline` | Investigation | Chronological intake audit spine, timestamped sensor events |
| `/cases/[id]/review` | Adjudication | Officer statutory adjudication workbench, legal directive disposition |
| `/intelligence` | Intelligence | Interpol Red Notices, SLTD stolen passport database correlation |
| `/audit` | Governance | Immutable statutory event ledger, officer action logs |
| `/system` | System Health | Microservice telemetry, OCR engine status, biometric pipeline uptime |

---

## ⚡ Core Capabilities

1. **ICAO 9303 MRZ Validation**:
   - Parses and validates standard TD1 (Identity Cards), TD2, and TD3 (Passports).
   - Verifies individual and composite 7-3-1 weighting checksums to detect altered document numbers or birthdates.

2. **Computer Vision Document Quality**:
   - Sharpness estimation via Laplacian variance (blur detection).
   - Resolution check and glare/under-exposure warnings.

3. **Facial Biometric Verification**:
   - Real-time comparison between live capture and passport portrait.
   - Vector distance calculation and landmark alignment confidence.

4. **Cross-Document Data Correlation**:
   - Synthesizes findings across passport platen, visa database, and passenger flight manifests (PNR).
   - Flags chronological discrepancies (e.g., date-of-birth divergence).

5. **Explainable Risk Scoring Engine**:
   - Transparent rule-weighted risk calculation (`LOW`, `MEDIUM`, `HIGH`).
   - Every risk score links directly to immutable evidence items with confidence scores.

6. **Human-in-the-Loop Officer Adjudication**:
   - AI outputs serve strictly as decision support.
   - Authorized officers record formal statutory dispositions (`CLEARED`, `REFERRED_TO_SECONDARY`, `DETAINED_DENIED_ENTRY`) with mandatory notes.

7. **Tamper-Evident Audit Trail**:
   - Every action, intake, analysis run, and officer adjudication produces an immutable audit event conforming to ISO/IEC 27037 forensic chain standards.

---

## 🛠️ Quick Start Guide

### 1. Frontend Setup (`veritas-app/`)

```bash
cd veritas-app

# Install dependencies
npm install

# Run development server (runs on http://localhost:3000)
npm run dev

# Run production build
npm run build
npm run start
```

### 2. Backend Setup (`backend/`)

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Update .env with your PostgreSQL credentials

# Run database migrations & create admin user
alembic upgrade head
python -m app.cli init-admin

# Start FastAPI server (runs on http://127.0.0.1:8000)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

* API Docs (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Health Check: [http://127.0.0.1:8000/health/ready](http://127.0.0.1:8000/health/ready)
* Run backend tests: `pytest -v`

---

## 🛡️ License

Developed for the Smart India Hackathon (SIH) — Border Security & Identity Management.
