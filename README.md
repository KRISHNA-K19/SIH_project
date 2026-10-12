# VERITAS — AI-Assisted Border & Airport Identity Screening and Investigation Platform

VERITAS is a mission-critical border and airport security screening workstation designed for primary checkpoint biometric intake and secondary in-depth document and identity investigations.

---

## 🏛️ System Architecture

VERITAS is engineered around a deterministic evidence hierarchy:

$$\text{RISK ASSESSMENT} \longrightarrow \text{WHY FLAGGED} \longrightarrow \text{FORENSIC EVIDENCE} \longrightarrow \text{INVESTIGATION} \longrightarrow \text{OFFICER ADJUDICATION}$$

### Technology Stack

* **Frontend (`veritas-app/`)**: Next.js 16.3.8 (Turbopack), TypeScript, Tailwind CSS, Material Symbols.
* **Design System (`stitch_design_system_generator/`)**: Mission-Critical Defense Workstation aesthetic, dark substrate UI, restrained cyan/blue indicators, semantic risk badges (critical/warning/success).
* **Architecture Specification (`VERITAS_MASTER_ARCHITECTURE_BLUEPRINT.md`)**: Full-stack specifications, database schemas (PostgreSQL), and AI inference pipelines.
* **Planned Backend**: Python 3.11 + FastAPI, PostgreSQL, Redis / Celery task queues.
* **Planned Document Intelligence**: PaddleOCR, ICAO Doc 9303 MRZ parsing, OpenCV image forensics, ArcFace / InsightFace biometric verification.

---

## 📁 Repository Structure

```
SIH_project/
├── .gitignore                                  # Git ignore specifications
├── README.md                                   # Project documentation and setup guide
├── VERITAS_MASTER_ARCHITECTURE_BLUEPRINT.md    # Master architecture and full-stack blueprint
│
├── stitch_design_system_generator/             # Approved UI specs & Stitch design mockups
│   ├── case_investigation_workspace_upgraded/  # Investigation workspace design & HTML reference
│   ├── mission_critical_defense_workstation/   # Core workstation palette & DESIGN.md spec
│   └── screening_result_upgraded/              # Screening result screen reference
│
└── veritas-app/                                # Production Next.js 16 frontend application
    ├── public/                                 # Static assets & SVG icons
    ├── src/
    │   ├── app/                                # Next.js App Router (17 verified routes)
    │   │   ├── audit/                          # Statutory event audit trail
    │   │   ├── cases/                          # Case dossiers & dynamic workspaces
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
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 🚦 Verified Routes & Navigation

| Route | Purpose | Key Screen Capabilities |
|---|---|---|
| `/login` | Access Control | Officer badge ID, security lane & terminal assignment |
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

## 🛠️ Quickstart Guide

### Prerequisites

* **Node.js**: v18.18+ or v20+ recommended
* **npm**: v9+ or v10+

### Installation & Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KRISHNA-K19/SIH_project.git
   cd SIH_project/veritas-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run production build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🛡️ License

Developed for the Smart India Hackathon (SIH) — Border Security & Identity Management.
