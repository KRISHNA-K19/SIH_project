# VERITAS — Master Architecture and Full-Stack Implementation Plan

**System:** AI-Assisted Border & Airport Identity Screening and Investigation Platform  
**Document Classification:** Engineering Master Specification & System Blueprint  
**Status:** Architecture Specification — Pending Review & User Approval  
**Version:** 1.0.0-PROD-SPEC  

---

## Executive Summary & Design Invariants

VERITAS is an enterprise-grade border control, identity verification, and document forensics workstation engineered for immigration checkpoints, airport primary/secondary lanes, and customs investigation bureaus.

### Core Architectural Invariants:
1. **Explainable Decision Support Posture:**  
   VERITAS does not make automated legal determinations of fraud or admissibility. The AI subsystems extract optical telemetry, calculate mathematical similarities, and detect substrate anomalies. The statutory authority and final adjudication always reside strictly with the sworn Border Control Officer.
2. **Deterministic Risk Fusion:**  
   Risk scoring is calculated through transparent, version-controlled rules with documented weights. Black-box predictive models are prohibited from autonomously outputting aggregate risk numbers without generating explicit, verifiable `EvidenceFinding` objects.
3. **Defense-Grade Visual Hierarchy:**  
   The user interface adheres strictly to the approved **Mission-Critical Defense Workstation** design system (`DESIGN.md`): dark carbon/graphite surfaces (`#07090E`, `#0B0E14`, `#10131A`, `#181F2E`), crisp 1px borders (`#1E2638`), restrained cyan interactive cues (`#007ACC`), crimson forensic anomaly vectors (`#EF4444`), amber advisories (`#F59E0B`), and emerald clearance states (`#10B981`). Zero SaaS gradients, glowing cards, or decorative animations.
4. **Data Sovereign & Air-Gappable:**  
   The platform operates without hard dependencies on third-party public cloud APIs. OCR, MRZ parsing, image forensics, and biometric facial vector calculations execute locally or within private sovereign enclaves.

```
+--------------------------------------------------------------------------------------------------+
|                                    VERITAS SYSTEM TOPOLOGY                                       |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   +------------------------------------------------------------------------------------------+   |
|   |                      PRESENTATION LAYER: NEXT.JS 16 + TYPESCRIPT                         |   |
|   |   (App Router, React 19, Tailwind v4, Mission-Critical Workstation UI, Tabular Telemetry)   |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                |                                                 |
|                                   REST HTTPS / WebSockets                                        |
|                                                v                                                 |
|   +------------------------------------------------------------------------------------------+   |
|   |                        API GATEWAY & CORE BACKEND: FASTAPI                               |   |
|   |  - Session / RBAC Middleware           - Case Lifecycle Manager     - Audit Ledger Guard  |   |
|   |  - Pydantic v2 Schema Validator        - Document Ingest Controller - Health & Telemetry |   |
|   +------------------------------------------------------------------------------------------+   |
|                         |                                                |                       |
|           Async Job     |                                   SQLAlchemy   |                       |
|           Delegation    v                                   Async Engine v                       |
|   +-------------------------------+               +------------------------------------------+   |
|   |   AI & FORENSICS PIPELINE     |               |          DATA PERSISTENCE LAYER          |   |
|   | - PaddleOCR Text Extraction   |               |                                          |   |
|   | - ICAO Doc 9303 MRZ Engine    |               |  +------------------------------------+  |   |
|   | - OpenCV Substrate Forensics  |               |  |  PostgreSQL 16 Relational Store    |  |   |
|   | - ArcFace / InsightFace 1:1   |               |  |  - Cases, Documents, Findings      |  |   |
|   | - Cross-Document Consistency  |               |  |  - Decisions, SHA-256 Audit Trail  |  |   |
|   | - Explainable Fusion Engine   |               |  +------------------------------------+  |   |
|   +-------------------------------+               |  +------------------------------------+  |   |
|                                                   |  |  Encrypted Object Storage (AES-256)|  |   |
|                                                   |  |  - High-res Scans (White/IR/UV)    |  |   |
|                                                   |  |  - Subject Live Biometrics         |  |   |
|                                                   |  +------------------------------------+  |   |
|                                                   +------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
```

---

## Section A: Existing Project Structure & Dependencies

### 1. Workspace Layout
The inspected workspace `c:\Users\krish\OneDrive\Desktop\SIH PROJECT` contains two primary subtrees:
1. `stitch_design_system_generator/`:
   - `mission_critical_defense_workstation/DESIGN.md` (Approved design specification, tokens, color system, component anatomy).
   - `case_investigation_workspace_upgraded/` (`code.html` Stitch prototype, `screen.png` reference image).
   - `screening_result_upgraded/` (`code.html` Stitch prototype, `screen.png` reference image).
2. `veritas-app/`:
   - Next.js 16.3.8 (Turbopack) web application configured with TypeScript 5, React 19.2.8, and Tailwind CSS v4.

### 2. Frontend Dependencies (`veritas-app/package.json`)
```json
{
  "name": "veritas-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.3.8",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.8",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 3. Design Tokens & Styling Evaluation
- **Colors:** Defined in `src/app/globals.css` with CSS custom properties matching `DESIGN.md`:
  - Surfaces: `#07090E` (abyssal canvas), `#0B0E14` (container-lowest), `#10131A` (container-workstation), `#181F2E` (container-high).
  - Borders: `#1E2638` (subtle divider), `#2D384E` (active frame).
  - Status: `#EF4444` (critical error / anomaly), `#F59E0B` (warning / advisory), `#10B981` (verified / clear), `#007ACC` / `#06B6D4` (primary action / telemetry).
- **Typography:** Tabular figures enabled (`font-variant-numeric: tabular-nums;`), monospace fonts mapped to system monospaced stacks for biometric readouts, timestamps, and flight manifests.
- **Verification:** All 17 routes in `veritas-app` compile with zero errors on Turbopack and return HTTP 200.

### 4. Identified Missing Backend & Infrastructure Layers
- **Backend Directory (`backend/`):** Not yet created. Requires Python 3.11+, FastAPI, Pydantic v2, and Uvicorn.
- **Database & Migration Tools:** PostgreSQL connection engine and Alembic migration framework.
- **AI Processing Modules:** PaddleOCR, MRZ parser, OpenCV, and facial vector comparison libraries.
- **Secure File Storage:** Storage abstraction for multi-spectrum TIFF/PNG document rasters and biometric rasters.

---

## Section B: Page-by-Page Functional Breakdown Across All Modules

The system comprises 8 operational modules spanning 22 distinct screen states and modal views. Every button, input, and telemetry panel maps to a defined backend responsibility.

```
+----------------------------------------------------------------------------------------------------+
|                                    VERITAS NAVIGATION TOPOLOGY                                     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ /login ] ---> Officer Authentication & Lane Sector Handshake                                    |
|      |                                                                                             |
|      +---> [ /overview ] (Command Operational Dashboard)                                           |
|      |         |                                                                                   |
|      |         +---> [ /screening ] (Live Optical Platen Feeds & Fast Intake)                      |
|      |         +---> [ /screening/queue ] (Primary Queue & Triage)                                 |
|      |         +---> [ /screening/new ] (4-Step Passenger & Document Ingestion)                    |
|      |                   |                                                                         |
|      |                   +---> Dispatches Ingest API & Redirects to:                              |
|      |                                                                                             |
|      +---> [ /cases/[id] ] (Investigation Dossier Workspace)                                      |
|      |         |                                                                                   |
|      |         +--- /overview    (Risk Summary & Action Gate)                                      |
|      |         +--- /documents   (Multi-Spectrum Optical Ingest Viewer: White / IR / UV)           |
|      |         +--- /forensics   (Substrate Alteration & 0.12mm Incision Vector Overlays)          |
|      |         +--- /identity    (1:1 Biometric Portrait Comparison & Similarity Bridge)           |
|      |         +--- /cross-check (Manifest / MRZ / Visa / Interpol Correlation Matrix)             |
|      |         +--- /evidence    (Hierarchical Telemetry Cards & Statutory Explanations)           |
|      |         +--- /timeline    (Cryptographic Microsecond Event Spine)                           |
|      |         +--- /review      (Pre-Adjudication Dossier & Statutory Decision Sign-off)          |
|      |                                                                                             |
|      +---> [ /cases ] (Historical Dossier Repository & Advanced Query Archive)                     |
|      +---> [ /intelligence ] (Watchlists, Syndicate Entity Links & Identity Graph)                 |
|      +---> [ /audit ] (Immutable Statutory Governance Ledger & SHA-256 Event Chain)               |
|      +---> [ /system ] (Hardware Platen Diagnostics, AI Inferencing Latency & HSM Status)          |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### Module 1: Access & Session Management

#### 1.1 Screen: `/login` (Officer Authentication)
- **Purpose:** Authenticate the screening officer, record station assignment, establish secure JWT session, and prevent unauthorized terminal access.
- **Components:** `LoginForm`, `StationSelector`, `PresetCredentialsBar`, `StatusBadge`, `SystemHealthIndicator`.
- **Interactions:**
  - *Checkpoint Dropdown:* Selects active terminal (`CP-B3-LANE-04`, `AIRPORT-T2-PRIMARY`, `SECONDARY-INSPECTION-BAY`).
  - *Officer Credentials:* Validates Badge ID (regex: `^[A-Z0-9-]{4,12}$`) and secret pin/password.
  - *Quick Presets:* In development mode, auto-populates `OFFICER-4491` (Senior Inspector) or `OFFICER-1102` (Primary Screener).
  - *Authenticate Button:* Submits `POST /api/v1/auth/login`. On success, stores token in HTTP-only cookie and redirects to `/overview`.
- **Loading State:** Form disabled, button displays spinner with text `AUTHENTICATING CREDENTIALS & HSM KEYS...`.
- **Empty State:** N/A (Standardized input fields).
- **Error State:** Red alert banner: `INVALID BADGE ID OR CREDENTIALS — ATTEMPT LOGGED TO STATUTORY AUDIT LEDGER`.

#### 1.2 Screen: Profile & Session Management (Global TopHeader Drawer)
- **Purpose:** Inspect officer session duration, active security clearance, station lane binding, and execute manual terminal lock.
- **Components:** `SessionModal`, `SecurityClearanceBadge`, `LockTerminalButton`, `LogoutButton`.
- **Interactions:**
  - *Lock Terminal:* Invalidates client memory session, locks UI behind PIN unlock.
  - *Logout:* Calls `POST /api/v1/auth/logout`, clears session cookies, redirects to `/login`.

---

### Module 2: Operations & Command

#### 2.1 Screen: `/overview` (Operational Dashboard)
- **Purpose:** High-level operational awareness: real-time lane throughput, active anomaly count, flight arrival rosters, and immediate triage alerts.
- **Components:** `MetricsGrid`, `ActiveLaneCard`, `HighRiskAlertBanner`, `RecentIntakesTable`, `QuickIntakeButton`.
- **Interactions:**
  - *High-Risk Alert Card:* Clicking an alert opens the associated case directly in `/cases/[id]/overview`.
  - *Filter Lanes:* Toggles between Terminal 1, Terminal 2, and International Transit zones.
  - *Refresh Telemetry:* Polls `GET /api/v1/dashboard/metrics` and updates throughput charts.
- **Loading State:** Skeleton cards for KPI tiles and pulsed loading bars across the recent intake table.
- **Empty State:** `NO ACTIVE BORDER ALERTS — ALL LANES OPERATING AT STANDARD PARAMETERS`.
- **Error State:** Banner: `UNABLE TO FETCH OPERATIONAL TELEMETRY — GATEWAY TIMEOUT (HTTP 504)`.

#### 2.2 Screen: `/screening` (Live Screening & Lane Telemetry)
- **Purpose:** Real-time monitoring of automated lane platens, live OCR ingestion feeds, and instant pass/divert telemetry.
- **Components:** `CameraFeedMock`, `LaneStatusRibbon`, `FastActionButtons`, `RecentScreeningStrip`.
- **Interactions:**
  - *Lane Selector:* Switches active optical stream between Lane 1 through Lane 8.
  - *Halt Lane:* Emergency pause on physical e-Gate platen.
  - *Inspect Flagged Case:* Redirects to `/cases/[id]`.
- **Loading State:** Centered oscilloscope loader: `CONNECTING TO HARDWARE PLATEN DAEMON...`.
- **Empty State:** `NO LIVE TRAVELERS CURRENTLY PRESENT AT SELECTED PLATEN`.
- **Error State:** Video feed replaced with static noise graphic and error: `HARDWARE SENSOR DISCONNECTED`.

#### 2.3 Screen: `/screening/queue` (Screening Triage Queue)
- **Purpose:** Centralized operational queue where primary officers inspect, filter, and prioritize incoming travelers based on calculated risk score and flight arrival timing.
- **Components:** `SearchBar`, `RiskLevelFilter`, `SortDropdown`, `CaseTable`, `PaginationControls`, `OpenCaseButton`.
- **Interactions:**
  - *Search Input:* Real-time debounce filter by Subject Name, Passport Number, or Flight ID.
  - *Risk Filter Buttons:* Multi-state toggle (`ALL`, `CRITICAL (80+)`, `HIGH (60-79)`, `MEDIUM (30-59)`, `LOW (0-29)`).
  - *Sort Control:* Sort by `Risk Score (Desc)`, `Risk Score (Asc)`, or `Arrival Time (Recent)`.
  - *Row Click / Open Case Button:* Navigates to `/cases/[id]/overview`.
- **Loading State:** 5 placeholder table rows with shimmering skeleton cells.
- **Empty State:** `NO CASES MATCHING SEARCH CRITERIA` with a button to reset filters.
- **Error State:** `FAILED TO RETRIEVE SCREENING QUEUE: BACKEND CONNECTION REFUSED`.

---

### Module 3: Screening Ingestion & Capture

#### 3.1 Screen: `/screening/new` (4-Step Passenger & Document Ingestion)
- **Purpose:** Ingest passenger metadata, document scans, and live portrait captures during manual inspection or manual secondary referral.
- **Components:** `WizardStepIndicator`, `Step1TravelerForm`, `Step2FlightForm`, `Step3DocumentUpload`, `Step4PersonCapture`, `ActionButtons`.
- **Interactions:**
  - *Step 1 (Traveler Details):* Form fields for Given Name, Surname, Date of Birth, Nationality (ISO-3166-1 alpha-3), and Gender.
  - *Step 2 (Flight / Manifest):* Flight Number, Carrier, Origin Airport (IATA), Destination Airport, Seat Number.
  - *Step 3 (Document Capture):* Dropzone for passport bio-page scan (accepts TIFF, PNG, JPEG up to 25MB). Validates image resolution (minimum 300 DPI warning).
  - *Step 4 (Live Portrait Capture):* Dropzone or camera interface for reference biometric photograph.
  - *Submit / Initiate Screening Button:* Validates all required fields, calls `POST /api/v1/cases`, uploads files via `POST /api/v1/cases/{id}/documents`, calls `POST /api/v1/cases/{id}/analysis`, and redirects to `/cases/[id]/overview`.
- **Loading State:** Progress modal with animated pipeline checklist:
  - `[✓] Secure File Encryption & Digest Generation`
  - `[✓] Ingesting into Relational Case Store`
  - `[⟳] Queuing PaddleOCR & Forensics Pipelines...`
- **Empty State:** Clean, pristine input forms with pre-filled default checkpoint lane values.
- **Error State:** Inline validation callouts under empty/invalid fields (e.g., `NATIONALITY MUST BE A VALID 3-LETTER ICAO CODE`).

---

### Module 4: Investigation & Case Workspace (`/cases/[id]`)

All sub-tabs within `/cases/[id]` share a unified `CaseHeader` displaying:
- Case Identifier (`VRS-2026-001824`)
- Traveler Full Name (`ROHAN CHANDRAKAAR`)
- Nationality & Document ID (`GBR · PASSPORT #Z4567123`)
- Calculated Risk Gauge (`82/100 · CRITICAL`)
- Flight Context (`BA-0178 · SEAT 14B · LHR → JFK`)
- Primary Action Gate Buttons: `DECIDE CASE`, `EXPORT DOSSIER`.

```
+---------------------------------------------------------------------------------------------------------+
|                                  CASE WORKSPACE HEADER & TAB DOCK                                       |
+---------------------------------------------------------------------------------------------------------+
|  CASE: VRS-2026-001824    SUBJECT: ROHAN CHANDRAKAAR    NAT: GBR    DOC: Z4567123    FLIGHT: BA-0178     |
|  RISK: [ 82/100 CRITICAL ]                 STATUS: INVESTIGATION_READY                 [DECIDE] [EXPORT]|
+---------------------------------------------------------------------------------------------------------+
|  [Overview] [Documents] [Forensics] [Identity] [Cross-Check] [Evidence] [Timeline] [Review]             |
+---------------------------------------------------------------------------------------------------------+
```

#### 4.1 Tab: `/cases/[id]/overview` (Executive Risk Summary)
- **Purpose:** Immediate 360-degree risk assessment: why the case was flagged, key evidence breakdown, and subject demographic profile.
- **Components:** `RiskScoreWidget`, `TopFindingsList`, `SubjectDossierCard`, `ActionGateBar`.
- **Interactions:**
  - *Investigate Finding Button:* Directly switches to the respective tab (e.g., clicking the 0.12mm incision finding switches to `/forensics`).
  - *Adjudicate Case Button:* Triggers `OfficerDecisionModal`.

#### 4.2 Tab: `/cases/[id]/documents` (Multi-Spectrum Optical Document Viewer)
- **Purpose:** Examine high-resolution passport bio-pages under simulated spectral illuminations (White light, Infrared 850nm, Ultraviolet 365nm) to verify fluorescent inks, MRZ ink absorbency, and retroreflective laminates.
- **Components:** `SpectrumSwitcher`, `DocumentZoomCanvas`, `MRZExtractedPanel`, `OpticalFilterSliders`.
- **Interactions:**
  - *Spectral Mode Tabs:* Switch between `WHITE (Visible 400-700nm)`, `INFRARED (850nm IR - B900 Ink)`, and `ULTRAVIOLET (365nm UV-A Fluorescence)`.
  - *Zoom & Pan:* Interactive wheel zoom (100% to 800%) with coordinate grid readout.
  - *MRZ Field Inspector:* Highlights corresponding lines in the visual zone when clicking parsed MRZ fields.

#### 4.3 Tab: `/cases/[id]/forensics` (Substrate Micro-Forensics & Tampering Analysis)
- **Purpose:** Display algorithmic anomaly detection markers over altered passport substrates, detecting pixel-level recompression, mechanical paper incisions, and font mismatch anomalies.
- **Components:** `ForensicCanvas`, `AnomalyMarkerList`, `ConfidenceBadge`, `TelemetryInspector`.
- **Interactions:**
  - *Interactive Vector Overlays:* Red bounding boxes drawn directly over anomalies (e.g., `ANOM-01: 0.12mm Substrate Cut along Photo Perimeter`).
  - *Marker Click:* Anchors inspector flyout displaying:
    - Algorithm: `Laplacian Gradient Edge Contiguity`
    - Confidence: `94.2%`
    - Physical Severity: `HIGH PROBABILITY OF PHOTO SUBSTITUTION`

#### 4.4 Tab: `/cases/[id]/identity` (1:1 Biometric Comparison Dock)
- **Purpose:** Side-by-side biometric visual inspection comparing the extracted physical document photo against the presented traveler’s live checkpoint capture.
- **Components:** `PhotoCellPair` (Document Portrait vs Live Capture), `TargetingBrackets`, `SimilarityBridge`, `FacialLandmarkToggle`.
- **Interactions:**
  - *Landmark Overlay Toggle:* Superimposes 68-point Dlib facial landmark meshes over both portraits to demonstrate morphological eye-distance and jaw-contour variance.
  - *Similarity Score Gauge:* Shows cosine similarity score (`42.8%`) paired with statutory non-definitive advisory label: `LOW SIMILARITY — SECONDARY VERIFICATION REQUIRED`.

#### 4.5 Tab: `/cases/[id]/cross-check` (Discrepancy Correlation Matrix)
- **Purpose:** Cross-reference extracted document data against external systems (ICAO MRZ, Visa Schemas, Airline PNR Manifests, and Interpol SLTD database).
- **Components:** `CorrelationTable`, `DiscrepancyBadge`, `FieldDiffViewer`.
- **Interactions:**
  - *Discrepancy Highlight:* Red flag on conflicting rows (e.g., `Date of Birth`: Passport MRZ reads `14 AUG 1988`, Airline PNR reads `14 AUG 1989`).
  - *Filter Mismatches:* Toggle to isolate conflicting fields only.

#### 4.6 Tab: `/cases/[id]/evidence` (Hierarchical Evidence Finding Cards)
- **Purpose:** Comprehensive evidentiary findings inventory detailing every positive and negative check with statutory penal codes and error bounds.
- **Components:** `EvidenceCardGroup`, `SeverityFilter`, `ExpandableTelemetryDrawer`.
- **Interactions:**
  - *Expand/Collapse Telemetry:* Shows raw JSON payload from AI engine including bounding box coordinates, optical confidence intervals, and algorithm version.

#### 4.7 Tab: `/cases/[id]/timeline` (Chronological Case Audit Spine)
- **Purpose:** Temporal reconstruction of the passenger’s screening journey, tracking automated ingest events, sensor reads, and manual officer interventions down to the millisecond.
- **Components:** `VerticalTimelineSpine`, `EventPip`, `SeverityFilter`, `ActorBadge`.
- **Interactions:**
  - *Filter Event Types:* Toggle `SYSTEM INGEST`, `ALGORITHM ANOMALY`, `OFFICER INTERACTION`.

#### 4.8 Tab: `/cases/[id]/review` (Pre-Adjudication Dossier Review)
- **Purpose:** Consolidated summary checklist ensuring the officer has reviewed all critical evidence before rendering a legal border disposition.
- **Components:** `PreDecisionChecklist`, `SummaryMetrics`, `OpenDecisionModalButton`.
- **Interactions:**
  - *Checkbox Verification:* Officer confirms inspection of Photo, Substrate, and Cross-check.
  - *Launch Adjudication:* Opens `OfficerDecisionModal`.

---

### Module 5: Officer Adjudication & Decision

#### 5.1 Modal: `OfficerDecisionModal` (Statutory Adjudication Gate)
- **Purpose:** Enforce formal officer sign-off with mandatory legal notes, statutory action codes, and electronic signature verification.
- **Components:** `DispositionRadioGroup`, `StatutoryAuthoritySelect`, `MandatoryNotesInput`, `SupervisorBadgeInput`, `ConfirmButton`, `CancelButton`.
- **Interactions:**
  - *Disposition Selection:*
    - `CLEARED_PRIMARY` (Admit traveler through primary lane)
    - `REFERRED_SECONDARY` (Escalate to secondary interrogation room)
    - `BORDER_HOLD` (Administrative detention pending document verification)
    - `DENIED_ENTRY` (Formal refusal of admission / statutory inadmissibility)
  - *Statutory Authority:* Selects applicable legal basis (e.g., `INA § 212(a)(6)(C)(i) - Fraud & Misrepresentation`).
  - *Mandatory Officer Justification:* Textarea requiring minimum 20 characters explaining decision rationale.
  - *Confirm Action:* Calls `POST /api/v1/cases/{id}/decisions`, invalidates case status, writes immutable audit record, and updates UI to `DECIDED`.

#### 5.2 Modal: `ExportBriefModal` (Evidentiary Intelligence Briefing)
- **Purpose:** Generate and export a standardized border enforcement dossier in PDF/Print format for secondary inspectors or consular authorities.
- **Components:** `PrintPreviewDossier`, `ClassificationBanner`, `PrintButton`.
- **Interactions:**
  - *Print / Save PDF:* Triggers browser print styling optimized for border case records.

---

### Module 6: Intelligence & Watchlist Management

#### 6.1 Screen: `/cases` (Historical Dossier Archive)
- **Purpose:** Search and audit all historical screening cases across past shifts and terminals.
- **Components:** `CaseArchiveTable`, `DateRangePicker`, `DispositionFilter`, `SearchInput`.
- **Interactions:**
  - *Deep Search:* Query by Case ID, Passport Number, or Subject Name.

#### 6.2 Screen: `/intelligence` (Identity Intelligence & Watchlist Records)
- **Purpose:** Maintain and search active travel watchlists, Interpol Red Notices, and organized document fraud syndicates.
- **Components:** `WatchlistTable`, `CategoryFilter`, `MatchConfidenceScore`, `SyndicateSummaryCard`.
- **Interactions:**
  - *Inspect Target:* View linked document fraud patterns and known travel aliases.

---

### Module 7: Governance & Audit Trail

#### 7.1 Screen: `/audit` (Immutable Statutory Governance Ledger)
- **Purpose:** Independent, tamper-evident audit ledger recording every query, document view, AI execution, and officer decision for statutory compliance and oversight.
- **Components:** `AuditTable`, `SeverityPills`, `HashDigestBadge`, `AuditSearchInput`, `ExportAuditButton`.
- **Interactions:**
  - *Inspect Event:* Opens modal displaying cryptographic event hash and actor badge metadata.
  - *Verify Chain Integrity:* Computes SHA-256 rolling digest to confirm no ledger tampering.

---

### Module 8: System Health & Diagnostic Telemetry

#### 8.1 Screen: `/system` (Hardware & Model Diagnostics)
- **Purpose:** Real-time health monitoring of local hardware platens, optical scanner drivers, GPU inference latency, and database connections.
- **Components:** `TelemetryCards`, `ServiceStatusTable`, `RestartWorkerButton`.
- **Interactions:**
  - *Ping Subsystem:* Calls `GET /api/v1/health` to re-verify PaddleOCR, OpenCV, and PostgreSQL status.

---

## Section C: Frontend Directory Structure & Reusable Component Inventory

### 1. Complete Frontend Directory Structure
```
veritas-app/
├── public/
│   ├── favicon.ico
│   └── icons/
├── src/
│   ├── app/
│   │   ├── globals.css                       # Design system CSS variables & tokens
│   │   ├── layout.tsx                        # Root layout with font definitions
│   │   ├── page.tsx                          # Root redirect to /overview
│   │   ├── login/page.tsx                    # Officer login & terminal handshake
│   │   ├── overview/page.tsx                 # Operational command overview
│   │   ├── screening/
│   │   │   ├── page.tsx                      # Live screening platen streams
│   │   │   ├── new/page.tsx                  # 4-step intake & document ingest wizard
│   │   │   └── queue/page.tsx                # Screening triage queue
│   │   ├── cases/
│   │   │   ├── page.tsx                      # Historical case archive
│   │   │   └── [id]/
│   │   │       ├── layout.tsx                # Client workspace layout with action gate
│   │   │       ├── page.tsx                  # Redirect to overview tab
│   │   │       ├── overview/page.tsx         # Tab 1: Executive risk overview
│   │   │       ├── documents/page.tsx        # Tab 2: Optical spectral viewer
│   │   │       ├── forensics/page.tsx        # Tab 3: Substrate anomaly markers
│   │   │       ├── identity/page.tsx         # Tab 4: 1:1 Biometric portrait dock
│   │   │       ├── cross-check/page.tsx      # Tab 5: Discrepancy correlation matrix
│   │   │       ├── evidence/page.tsx         # Tab 6: Evidentiary finding cards
│   │   │       ├── timeline/page.tsx         # Tab 7: Chronological audit spine
│   │   │       └── review/page.tsx           # Tab 8: Pre-adjudication review
│   │   ├── intelligence/page.tsx             # Watchlists & fraud syndicates
│   │   ├── audit/page.tsx                    # Statutory audit trail
│   │   └── system/page.tsx                   # Hardware & model diagnostics
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx                  # Global shell wrapper with state provider
│   │   │   ├── Sidebar.tsx                   # Workstation side navigation
│   │   │   └── TopHeader.tsx                 # Checkpoint lane, clock, search & profile
│   │   ├── case/
│   │   │   ├── CaseHeader.tsx                # Sticky case identity & risk bar
│   │   │   ├── CaseTabs.tsx                  # 8-tab workstation navigation
│   │   │   ├── CaseWorkspaceLayout.tsx       # Layout container with modals & brief
│   │   │   ├── DocumentViewer.tsx            # Multi-spectrum zoomable document viewer
│   │   │   ├── BiometricComparison.tsx       # 1:1 facial photo comparison dock
│   │   │   ├── CrossCheckMatrix.tsx          # Field correlation & mismatch table
│   │   │   ├── TimelineViewer.tsx            # Chronological event spine
│   │   │   ├── OfficerDecisionModal.tsx      # Formal adjudication modal
│   │   │   ├── EvidenceModal.tsx             # Detailed finding telemetry dialog
│   │   │   └── ExportBriefModal.tsx          # Printable briefing document modal
│   │   └── ui/
│   │       ├── Buttons.tsx                   # Primary, Secondary, Danger, Icon buttons
│   │       ├── Inputs.tsx                    # TextInput, SelectDropdown, SearchInput
│   │       ├── StatusBadge.tsx               # High-contrast risk & status badges
│   │       ├── RiskScore.tsx                 # Circular / linear risk score indicators
│   │       ├── EvidenceCard.tsx              # Structured telemetry finding card
│   │       ├── Modal.tsx                     # Accessible keyboard-aware dialog shell
│   │       ├── LoadingState.tsx              # Mission-critical pulsing loading blocks
│   │       ├── EmptyState.tsx                # Empty state banners with actionable guidance
│   │       └── FixtureBanner.tsx             # Persistent development fixture indicator
│   ├── context/
│   │   └── VeritasContext.tsx                # React Context for active cases, modals & session
│   ├── services/
│   │   └── api.ts                            # Abstracted API service client
│   ├── types/
│   │   └── veritas.ts                        # Master TypeScript domain definitions
│   └── lib/
│       └── fixtures/                         # Isolated development fixtures
│           ├── cases.ts                      # Synthetic border intake cases
│           ├── audit.ts                      # Synthetic audit trail events
│           └── system.ts                     # Synthetic system health metrics
```

### 2. Shared Component Inventory Table
| Component Name | File Path | Props Interface | Key Behaviors & Accessibility |
| :--- | :--- | :--- | :--- |
| `AppShell` | `components/layout/AppShell.tsx` | `{ children: ReactNode }` | Provides context provider, global keyboard shortcuts (`Ctrl+/` search, `Esc` modal dismiss), and workstation borders. |
| `Sidebar` | `components/layout/Sidebar.tsx` | None | Groups navigation into Operations, Intelligence, Governance, System. Semantic `<nav>` with `aria-current="page"`. |
| `TopHeader` | `components/layout/TopHeader.tsx` | None | Real-time UTC/Local clock ticker, active station selector, global search bar, officer session chip. |
| `CaseHeader` | `components/case/CaseHeader.tsx` | `{ caseData: CaseRecord }` | Displays risk gauge, passport number, traveler name, flight ID, and triggers for Adjudicate / Export modals. |
| `CaseTabs` | `components/case/CaseTabs.tsx` | `{ activeTab: string, caseId: string }` | 8-tab horizontal navigation with active cyan indicator (`#007ACC`) and alert counter pills. |
| `DocumentViewer` | `components/case/DocumentViewer.tsx` | `{ documentUrl: string, spectrums: string[] }` | Zoom/pan controls, spectrum toggles (White/IR/UV), and bounding-box overlay markers. |
| `BiometricComparison` | `components/case/BiometricComparison.tsx` | `{ docPhoto: string, livePhoto: string, similarity: number }` | Side-by-side 1:1 photo cells with targeting corner brackets, cosine similarity percentage, and advisory label. |
| `CrossCheckMatrix` | `components/case/CrossCheckMatrix.tsx` | `{ records: CrossCheckRecord[] }` | Compares fields across MRZ, VIZ, PNR, and Watchlist. Visual red flags on character mismatches. |
| `TimelineViewer` | `components/case/TimelineViewer.tsx` | `{ events: TimelineEvent[] }` | Monospace timestamp spine with square severity pips (cyan=system, red=anomaly, amber=officer). |
| `OfficerDecisionModal`| `components/case/OfficerDecisionModal.tsx`| `{ isOpen: boolean, onClose: () => void, onSubmit: (d: any) => void }`| Accessible dialog with focus trap. Enforces minimum notes length and supervisor badge if secondary referral. |
| `StatusBadge` | `components/ui/StatusBadge.tsx` | `{ status: string, variant: BadgeVariant }` | High-contrast pill matching `DESIGN.md` (Red `#2A1215`/`#EF4444`, Amber `#2B1E08`/`#F59E0B`, Green `#092419`/`#10B981`). |
| `RiskScore` | `components/ui/RiskScore.tsx` | `{ score: number, size?: 'sm' \| 'md' \| 'lg' }` | Tabular numeric display with risk-coded background and border ring. |

---

## Section D: Backend Directory Structure & Architecture (Python + FastAPI)

The backend service is structured under a dedicated `backend/` directory using Python 3.11+ and FastAPI. It follows clean architecture principles, cleanly separating REST presentation, domain business rules, database persistence, and AI pipelines.

```
backend/
├── pyproject.toml                            # Dependencies & tool configurations
├── Dockerfile                                # Containerization manifest
├── alembic.ini                               # Alembic migration configuration
├── alembic/
│   ├── env.py                                # Migration environment script
│   └── versions/                             # Versioned database migration scripts
├── app/
│   ├── main.py                               # FastAPI application entrypoint & middleware
│   ├── core/
│   │   ├── config.py                         # Pydantic BaseSettings (env configs)
│   │   ├── security.py                       # Passlib bcrypt hashing & PyJWT routines
│   │   ├── dependencies.py                   # FastAPI dependency injections (get_db, get_current_user)
│   │   └── exceptions.py                     # RFC 7807 problem detail exception handlers
│   ├── db/
│   │   ├── session.py                        # SQLAlchemy async engine & session maker
│   │   └── base.py                           # Declarative Base importing all models
│   ├── models/                               # SQLAlchemy 2.0 ORM Declarative Models
│   │   ├── user.py                           # User & Checkpoint models
│   │   ├── case.py                           # Case & CaseEvent models
│   │   ├── document.py                       # Document & ExtractedField models
│   │   ├── analysis.py                       # AnalysisRun model
│   │   ├── evidence.py                       # EvidenceFinding & RiskAssessment models
│   │   ├── decision.py                       # OfficerDecision model
│   │   ├── audit.py                          # AuditEvent model
│   │   └── identity.py                       # IdentityLink model
│   ├── schemas/                              # Pydantic v2 Request/Response Schemas
│   │   ├── auth.py                           # Login, Token, User schemas
│   │   ├── case.py                           # CaseCreate, CaseResponse, CaseFilter schemas
│   │   ├── document.py                       # DocumentUpload, DocumentResponse schemas
│   │   ├── analysis.py                       # AnalysisJobCreate, AnalysisStatus schemas
│   │   ├── evidence.py                       # FindingResponse, RiskScoreResponse schemas
│   │   ├── decision.py                       # DecisionCreate, DecisionResponse schemas
│   │   ├── audit.py                          # AuditLogResponse schemas
│   │   └── health.py                         # HealthCheck, DiagnosticResponse schemas
│   ├── api/
│   │   └── v1/
│   │       ├── router.py                     # Aggregated v1 API router
│   │       └── endpoints/
│   │           ├── auth.py                   # /auth/login, /auth/refresh, /auth/me
│   │           ├── dashboard.py              # /dashboard/metrics, /dashboard/lanes
│   │           ├── cases.py                  # /cases CRUD, /cases/{id}/summary
│   │           ├── documents.py              # /cases/{id}/documents, /documents/{id}/file
│   │           ├── analysis.py               # /cases/{id}/analysis, /analysis/{id}
│   │           ├── evidence.py               # /cases/{id}/evidence, /cases/{id}/forensics
│   │           ├── decisions.py              # /cases/{id}/decisions
│   │           ├── timeline.py               # /cases/{id}/timeline
│   │           ├── audit.py                  # /audit, /audit/export
│   │           ├── intelligence.py           # /intelligence/watchlist, /intelligence/graph
│   │           └── health.py                 # /health, /health/services
│   ├── services/                             # Business Logic Services
│   │   ├── auth_service.py                   # Authentication & token generation
│   │   ├── case_service.py                   # Case state transitions & identifier generation
│   │   ├── document_service.py               # File validation, SHA-256 calculation & disk persistence
│   │   ├── decision_service.py               # Officer sign-off validation & immutable lock
│   │   └── audit_service.py                  # Cryptographic audit logging with hash chaining
│   ├── pipeline/                             # AI & Forensic Processing Subsystems
│   │   ├── orchestrator.py                   # Multi-stage asynchronous analysis job manager
│   │   ├── ocr_engine.py                     # PaddleOCR wrapper for document text extraction
│   │   ├── mrz_parser.py                     # ICAO Doc 9303 checksum validator (TD1, TD2, TD3)
│   │   ├── forensics_engine.py               # OpenCV substrate incision & pixel alteration analyzer
│   │   ├── identity_engine.py                # Facial landmark detection & cosine similarity matcher
│   │   ├── cross_checker.py                  # Multi-source field discrepancy comparator
│   │   └── fusion_engine.py                  # Deterministic explainable risk fusion ruleset
│   └── storage/
│       └── file_store.py                     # Secure encrypted local disk / S3-compatible file storage
└── tests/
    ├── conftest.py                           # Pytest fixtures & async SQLite/Postgres test db
    ├── test_mrz_parser.py                    # Unit tests for Doc 9303 7-3-1 modulo 10 checksums
    ├── test_fusion_engine.py                 # Unit tests for risk rule weights and bounds
    ├── test_api_auth.py                      # Integration tests for auth and token refresh
    ├── test_api_cases.py                     # Integration tests for case lifecycle & decisions
    └── test_audit_integrity.py               # Integration tests for SHA-256 audit chaining
```

---

## Section E: PostgreSQL Relational Database Schema

The database design uses strict relational integrity, foreign key constraints, check constraints, explicit column typing, and B-tree indexes for fast query resolution.

```
+--------------------------------------------------------------------------------------------------+
|                                    ENTITY RELATIONSHIP SCHEMA                                    |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   +---------------+ 1        * +---------------+ 1         * +------------------+                |
|   |  checkpoints  |------------|     users     |-------------| officer_decisions|                |
|   +---------------+            +---------------+             +------------------+                |
|           | 1                          | 1                            | 1                        |
|           |                            |                              |                          |
|           | *                          | *                            |                          |
|   +---------------+ 1        * +---------------+                      |                          |
|   |     cases     |------------|  case_events  |                      |                          |
|   +---------------+            +---------------+                      |                          |
|     | 1        | 1                     |                              |                          |
|     |          +-----------------------|------------------------------+                          |
|     | *                                |                                                         |
|   +---------------+ 1        * +---------------+                                                 |
|   |   documents   |------------|analysis_runs  |                                                 |
|   +---------------+            +---------------+                                                 |
|     | 1                                | 1                                                       |
|     | *                                | *                                                       |
|   +---------------+            +------------------+ 1         * +------------------+             |
|   |extracted_field|            | evidence_findings|-------------| risk_assessments |             |
|   +---------------+            +------------------+             +------------------+             |
|                                                                                                  |
|   +---------------+            +---------------+                                                 |
|   | audit_events  |            | identity_links| (Independent Governance & Intelligence Tables)  |
|   +---------------+            +---------------+                                                 |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### 1. DDL Definitions for Core Entities

```sql
-- 1. Authorized Checkpoints / Stations
CREATE TABLE checkpoints (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    terminal VARCHAR(32) NOT NULL,
    sector VARCHAR(32) NOT NULL,
    lane_count INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Officers and System Users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    badge_number VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('OFFICER_L1', 'INSPECTOR_L2', 'SUPERVISOR', 'AUDITOR', 'ADMIN')),
    checkpoint_id VARCHAR(36) REFERENCES checkpoints(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Border Screening Cases
CREATE TABLE cases (
    id VARCHAR(36) PRIMARY KEY, -- Format: VRS-YYYY-XXXXXX
    checkpoint_id VARCHAR(36) NOT NULL REFERENCES checkpoints(id),
    created_by_officer_id VARCHAR(36) NOT NULL REFERENCES users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED' 
        CHECK (status IN ('CREATED', 'DOCUMENT_ATTACHED', 'IN_ANALYSIS', 'INVESTIGATION_READY', 'OFFICER_REVIEWING', 'DECIDED', 'ARCHIVED')),
    disposition VARCHAR(32) 
        CHECK (disposition IN ('CLEARED_PRIMARY', 'REFERRED_SECONDARY', 'BORDER_HOLD', 'DENIED_ENTRY')),
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(16) NOT NULL DEFAULT 'LOW' 
        CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    subject_name VARCHAR(256) NOT NULL,
    subject_dob DATE,
    subject_nationality VARCHAR(3) NOT NULL, -- ICAO 3-letter code
    subject_gender VARCHAR(8),
    subject_document_number VARCHAR(64) NOT NULL,
    flight_number VARCHAR(32),
    flight_carrier VARCHAR(64),
    flight_origin VARCHAR(3), -- IATA code
    flight_destination VARCHAR(3),
    seat_number VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_risk_score ON cases(risk_score DESC);
CREATE INDEX idx_cases_subject_doc ON cases(subject_document_number);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);

-- 4. Document Records
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(36) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    doc_type VARCHAR(32) NOT NULL CHECK (doc_type IN ('PASSPORT', 'VISA', 'ID_CARD', 'BOARDING_PASS')),
    issuing_country VARCHAR(3) NOT NULL,
    document_number VARCHAR(64) NOT NULL,
    storage_path_white VARCHAR(512) NOT NULL,
    storage_path_ir VARCHAR(512),
    storage_path_uv VARCHAR(512),
    file_hash_sha256 VARCHAR(64) NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_case_id ON documents(case_id);

-- 5. Analysis Processing Runs
CREATE TABLE analysis_runs (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(36) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_id VARCHAR(36) REFERENCES documents(id) ON DELETE CASCADE,
    engine_name VARCHAR(64) NOT NULL, -- e.g., 'PADDLE_OCR', 'ICAO_MRZ', 'OPENCV_FORENSICS', 'FACENET_BIO'
    engine_version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED' 
        CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'INCONCLUSIVE')),
    progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_runs_case_id ON analysis_runs(case_id);

-- 6. OCR and MRZ Extracted Fields
CREATE TABLE extracted_fields (
    id VARCHAR(36) PRIMARY KEY,
    analysis_run_id VARCHAR(36) NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    document_id VARCHAR(36) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_name VARCHAR(64) NOT NULL, -- e.g., 'SURNAME', 'GIVEN_NAME', 'DOC_NUMBER', 'EXPIRY_DATE'
    raw_value TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL CHECK (confidence >= 0.00 AND confidence <= 100.00),
    bounding_box JSONB, -- [x, y, width, height]
    checksum_valid BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extracted_fields_doc_id ON extracted_fields(document_id);

-- 7. Evidentiary Findings
CREATE TABLE evidence_findings (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(36) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    analysis_run_id VARCHAR(36) REFERENCES analysis_runs(id) ON DELETE SET NULL,
    category VARCHAR(32) NOT NULL 
        CHECK (category IN ('BIOMETRIC', 'SUBSTRATE', 'MRZ_INTEGRITY', 'CROSS_CHECK', 'WATCHLIST')),
    severity VARCHAR(16) NOT NULL 
        CHECK (severity IN ('CRITICAL', 'WARNING', 'VERIFIED', 'INCONCLUSIVE')),
    title VARCHAR(256) NOT NULL,
    summary TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    telemetry_payload JSONB NOT NULL,
    statutory_code VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_findings_case_id ON evidence_findings(case_id);

-- 8. Explainable Risk Assessments
CREATE TABLE risk_assessments (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(36) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    risk_level VARCHAR(16) NOT NULL,
    ruleset_version VARCHAR(32) NOT NULL,
    contributing_factors JSONB NOT NULL, -- Array of [{rule_id, points, explanation}]
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Officer Adjudication Decisions
CREATE TABLE officer_decisions (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(36) NOT NULL UNIQUE REFERENCES cases(id) ON DELETE RESTRICT,
    officer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision_type VARCHAR(32) NOT NULL 
        CHECK (decision_type IN ('CLEARED_PRIMARY', 'REFERRED_SECONDARY', 'BORDER_HOLD', 'DENIED_ENTRY')),
    rationale TEXT NOT NULL,
    statutory_authority VARCHAR(128) NOT NULL,
    supervisor_badge VARCHAR(32),
    signature_hash VARCHAR(64) NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Case Timeline Events
CREATE TABLE case_events (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(36) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    actor_type VARCHAR(16) NOT NULL CHECK (actor_type IN ('SYSTEM', 'OFFICER')),
    actor_id VARCHAR(64) NOT NULL,
    title VARCHAR(256) NOT NULL,
    details TEXT,
    severity VARCHAR(16) NOT NULL DEFAULT 'INFO',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_case_events_case_time ON case_events(case_id, timestamp ASC);

-- 11. Immutable Audit Ledger
CREATE TABLE audit_events (
    id VARCHAR(36) PRIMARY KEY,
    event_uuid UUID NOT NULL UNIQUE,
    officer_id VARCHAR(36) REFERENCES users(id),
    checkpoint_id VARCHAR(36) REFERENCES checkpoints(id),
    action VARCHAR(64) NOT NULL,
    target_resource VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(256),
    event_payload_hash VARCHAR(64) NOT NULL,
    previous_event_hash VARCHAR(64) NOT NULL, -- SHA-256 rolling chain link
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_time ON audit_events(timestamp DESC);

-- 12. Cross-Entity Identity Intelligence Links
CREATE TABLE identity_links (
    id VARCHAR(36) PRIMARY KEY,
    source_case_id VARCHAR(36) REFERENCES cases(id) ON DELETE CASCADE,
    subject_identifier VARCHAR(128) NOT NULL,
    linked_identifier VARCHAR(128) NOT NULL,
    link_type VARCHAR(32) NOT NULL CHECK (link_type IN ('SHARED_DOCUMENT', 'BIOMETRIC_MATCH', 'ALIAS', 'PNR_CO_TRAVELER')),
    confidence NUMERIC(5, 2) NOT NULL,
    notes TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Database Migration Strategy (Alembic)
- All schema changes must be versioned in `backend/alembic/versions/`.
- No direct schema mutation scripts are run against development or production databases.
- The base migration `001_initial_schema.py` establishes the 12 core tables and associated indexes.
- Downgrade scripts (`def downgrade()`) are mandatory for every migration to guarantee rollbacks during continuous deployment.

---

## Section F: REST API Contract Specification

All endpoints follow RESTful conventions, JSON payloads, and RFC 7807 Problem Details for errors. Bearer JWT authorization is required on all endpoints with role enforcement.

```
+-------------------------------------------------------------------------------------------------------------------+
| METHOD | ENDPOINT                          | ROLE REQUIRED   | PURPOSE                                            |
+--------+-----------------------------------+-----------------+----------------------------------------------------+
| POST   | /api/v1/auth/login                | Public          | Authenticate officer & return JWT bearer token     |
| POST   | /api/v1/auth/refresh              | Authenticated   | Refresh expired access token with refresh token    |
| GET    | /api/v1/auth/me                   | Authenticated   | Retrieve current officer profile and permissions   |
| POST   | /api/v1/auth/logout               | Authenticated   | Revoke current session                             |
| GET    | /api/v1/dashboard/metrics         | OFFICER_L1+     | Operational throughput & lane status               |
| POST   | /api/v1/cases                     | OFFICER_L1+     | Create a new screening case dossier                |
| GET    | /api/v1/cases                     | OFFICER_L1+     | Search and filter screening cases                  |
| GET    | /api/v1/cases/{id}                | OFFICER_L1+     | Retrieve full case dossier & telemetry             |
| PATCH  | /api/v1/cases/{id}                | OFFICER_L1+     | Update editable case metadata                      |
| POST   | /api/v1/cases/{id}/documents      | OFFICER_L1+     | Upload multi-spectral document images              |
| GET    | /api/v1/documents/{id}/file       | OFFICER_L1+     | Stream encrypted document raster with audit check  |
| POST   | /api/v1/cases/{id}/analysis       | OFFICER_L1+     | Dispatch OCR & forensic pipeline jobs              |
| GET    | /api/v1/cases/{id}/analysis/status| OFFICER_L1+     | Poll real-time pipeline execution progress         |
| GET    | /api/v1/cases/{id}/evidence       | OFFICER_L1+     | Retrieve categorized evidentiary findings          |
| GET    | /api/v1/cases/{id}/timeline       | OFFICER_L1+     | Fetch chronological microsecond event spine        |
| POST   | /api/v1/cases/{id}/decisions      | OFFICER_L1+     | Record binding legal officer adjudication          |
| GET    | /api/v1/audit                     | AUDITOR, ADMIN  | Query immutable statutory governance ledger        |
| GET    | /api/v1/health                    | Public          | System health, platen drivers & GPU inference ping |
+-------------------------------------------------------------------------------------------------------------------+
```

### Detailed Endpoint Specifications

#### 1. `POST /api/v1/auth/login`
- **Request Body:**
```json
{
  "badge_number": "OFFICER-4491",
  "password": "CorrectSecretPassword123!",
  "checkpoint_code": "CP-B3-LANE-04"
}
```
- **Response 200 OK:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": "usr-8812-4491",
    "badge_number": "OFFICER-4491",
    "full_name": "J. MORRISON",
    "role": "INSPECTOR_L2",
    "checkpoint_id": "cp-04-delta"
  }
}
```
- **Errors:** `401 Unauthorized` (Invalid credentials), `422 Unprocessable Entity` (Bad schema).

#### 2. `POST /api/v1/cases`
- **Request Body:**
```json
{
  "subject_name": "ROHAN CHANDRAKAAR",
  "subject_dob": "1988-08-14",
  "subject_nationality": "GBR",
  "subject_gender": "M",
  "subject_document_number": "Z4567123",
  "flight_number": "BA-0178",
  "flight_carrier": "British Airways",
  "flight_origin": "LHR",
  "flight_destination": "JFK",
  "seat_number": "14B"
}
```
- **Response 201 Created:** Returns full `CaseRecord` object with generated ID `VRS-2026-001824` and status `CREATED`.

#### 3. `POST /api/v1/cases/{id}/documents`
- **Request:** `multipart/form-data` containing `doc_type`, `issuing_country`, `document_number`, and files `file_white`, optional `file_ir`, `file_uv`.
- **Response 201 Created:** Returns array of uploaded `DocumentItem` records including SHA-256 hashes.

#### 4. `POST /api/v1/cases/{id}/analysis`
- **Request Body:**
```json
{
  "engines": ["PADDLE_OCR", "ICAO_MRZ", "OPENCV_FORENSICS", "FACENET_BIO", "CROSS_CHECK"]
}
```
- **Response 202 Accepted:**
```json
{
  "case_id": "VRS-2026-001824",
  "analysis_job_id": "job-run-90214",
  "status": "QUEUED",
  "message": "Analysis pipeline successfully scheduled"
}
```

#### 5. `POST /api/v1/cases/{id}/decisions`
- **Request Body:**
```json
{
  "decision_type": "REFERRED_SECONDARY",
  "rationale": "Micro-incision detected around portrait edge; facial similarity below threshold (42.8%). Escalated for physical document delamination testing.",
  "statutory_authority": "INA § 212(a)(6)(C)(i) - Fraud & Misrepresentation",
  "supervisor_badge": "SUP-0091"
}
```
- **Response 200 OK:**
```json
{
  "id": "dec-99214-88",
  "case_id": "VRS-2026-001824",
  "decision_type": "REFERRED_SECONDARY",
  "decided_at": "2026-10-12T14:22:10Z",
  "signature_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
- **Errors:** `400 Bad Request` (Case already decided), `422 Unprocessable Entity` (Notes less than 20 chars).

---

## Section G: Document Processing & AI Pipeline Architecture

The document intelligence pipeline executes as an asynchronous, deterministic workflow. The pipeline runs locally without sending sensitive passenger data to commercial external AI cloud APIs.

```
+------------------------------------------------------------------------------------------------------+
|                              DOCUMENT INTELLIGENCE & FORENSICS PIPELINE                              |
+------------------------------------------------------------------------------------------------------+
|                                                                                                      |
|   1. INGESTION & OPTICAL PREPROCESSING                                                               |
|      - Minimum 300 DPI resolution check                                                              |
|      - Perspective crop & unwarp (quadrilateral contour normalization)                               |
|      - Glare suppression & CLAHE contrast equalization                                               |
|                                       |                                                              |
|                                       v                                                              |
|   2. PARALLEL FEATURE EXTRACTION      |                                                              |
|      +--------------------------------+--------------------------------+                             |
|      |                                |                                |                             |
|      v                                v                                v                             |
|   [ 2A. OCR & MRZ ]                [ 2B. FORENSIC TAMPERING ]       [ 2C. 1:1 BIOMETRIC MATCH ]      |
|   - PaddleOCR Text Extraction      - Error Level Analysis (ELA)     - Face detection on crop         |
|   - ICAO Doc 9303 Checksums        - Sobel edge discontinuity       - Live capture face alignment    |
|   - Modulo 10 7-3-1 validation     - 0.12mm photo incision cut      - ArcFace / InsightFace embed    |
|   - Field confidence scoring       - UV fluorescent ink presence    - Cosine similarity metric       |
|      |                                |                                |                             |
|      +--------------------------------+--------------------------------+                             |
|                                       |                                                              |
|                                       v                                                              |
|   3. CROSS-DOCUMENT & MANIFEST RECONCILIATION                                                        |
|      - Compare MRZ data vs VIZ (Visual Inspection Zone) OCR text                                     |
|      - Compare Passport Name / DOB vs Airline PNR Manifest                                           |
|      - Query synthetic Interpol SLTD (Stolen & Lost Travel Documents) schema                         |
|                                       |                                                              |
|                                       v                                                              |
|   4. DETERMINISTIC EXPLAINABLE RISK FUSION ENGINE                                                    |
|      - Base Risk Score = Weighted sum of individual anomaly finding scores                           |
|      - Hard cap at 100                                                                               |
|      - Generate structured EvidenceFinding records with error bounds & explanations                  |
|                                                                                                      |
+------------------------------------------------------------------------------------------------------+
```

### 1. Optical Ingestion & Preprocessing
- **Platen Verification:** Validates that submitted passport image is at least `1920x1080` (minimum 300 DPI for ICAO MRZ readability).
- **Dewarping & Deskewing:** Employs OpenCV `findContours` and `approxPolyDP` to isolate the 4 corners of the identity page, applying a perspective transform matrix to standardize the visual canvas.
- **Spectral Separation:** Channels are split into Red, Green, Blue, IR-reflectance, and UV-luminescence rasters.

### 2. OCR & MRZ Parsing (ICAO Doc 9303 Compliance)
- **Engine:** PaddleOCR (OCR-B alphanumeric recognition).
- **MRZ Standard Support:**
  - `TD1`: 3 lines, 30 characters each (National ID / Resident Card).
  - `TD2`: 2 lines, 36 characters each (Machine-readable Visa).
  - `TD3`: 2 lines, 44 characters each (Standard International Passport).
- **Modulo 10 Checksum Algorithm (7-3-1 Weighting):**
  - Checksum characters are verified by multiplying each character's numeric value ($0-9 \to 0-9$, $A-Z \to 10-35$, $<\ \to 0$) by repeating sequence weights $\{7, 3, 1\}$.
  - Mathematical formula:
    $$\text{Checksum} = \left( \sum_{i=1}^n \text{val}(c_i) \times w_{(i-1) \pmod 3} \right) \pmod{10}$$
  - Evaluated on: Document Number Checksum, Date of Birth Checksum, Expiry Date Checksum, and Composite Checksum.
  - If any checksum fails, an `EvidenceFinding` is immediately registered with severity `CRITICAL`.

### 3. Image Forensics & Substrate Alteration Detection
- **Error Level Analysis (ELA):** Resaves image at 95% JPEG quality and computes pixel-by-pixel difference map. Inconsistencies around the passport portrait photo indicate digital manipulation.
- **Edge Contiguity & Incision Detection:** Uses morphological gradient filters and Canny edge detection around the portrait bounding perimeter. Physical photo substitution introduces micro-incisions ($0.10\text{mm} - 0.25\text{mm}$) that rupture paper fibers.
- **UV Fluorescent Response:** Inspects UV 365nm channel for absence of paper brighteners (security paper remains dark under UV) and validates presence of glowing synthetic security threads.

### 4. 1:1 Biometric Face Comparison
- **Face Detection:** MTCNN / RetinaFace isolates portrait on document and traveler live capture.
- **Alignment:** Aligns facial coordinates based on 5 primary facial landmarks (eyes, nose, mouth corners).
- **Embedding Generation:** ArcFace / InsightFace model produces 512-dimensional unit vector $\vec{u}$ and $\vec{v}$.
- **Cosine Similarity:**
  $$\text{Similarity} = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|} \times 100\%$$
- **Telemetry Policy:** The UI explicitly states the similarity percentage along with non-definitive advisory guidance:
  - $\ge 75\%$: `HIGH SIMILARITY — BIOMETRIC CONCORDANCE OBSERVED`
  - $60\% - 74\%$: `MODERATE SIMILARITY — VISUAL REVIEW RECOMMENDED`
  - $< 60\%$: `LOW SIMILARITY — SECONDARY VERIFICATION REQUIRED`

### 5. Explainable Evidence Fusion Ruleset
Risk score is calculated deterministically via versioned rules:
$$\text{Total Risk Score} = \min\left(100, \sum_{i} \text{Weight}(\text{TriggeredRule}_i)\right)$$

| Rule Code | Trigger Condition | Points | Severity | Category |
| :--- | :--- | :--- | :--- | :--- |
| `RULE-SUB-01` | Substrate incision detected around photo perimeter ($>0.10\text{mm}$) | +40 | `CRITICAL` | Substrate |
| `RULE-BIO-01` | Facial cosine similarity $< 50\%$ | +35 | `CRITICAL` | Biometric |
| `RULE-BIO-02` | Facial cosine similarity between $50\%$ and $65\%$ | +15 | `WARNING` | Biometric |
| `RULE-MRZ-01` | Any ICAO Doc 9303 checksum fails modulo 10 verification | +35 | `CRITICAL` | MRZ Integrity |
| `RULE-DATA-01` | Date of birth discrepancy between MRZ and PNR manifest | +20 | `WARNING` | Cross-Check |
| `RULE-DATA-02` | Surname or given name mismatch between MRZ and Visa | +25 | `CRITICAL` | Cross-Check |
| `RULE-WL-01` | Direct hit on Interpol SLTD stolen passport database | +50 | `CRITICAL` | Watchlist |

*Explainability Guarantee:* Every point in `Total Risk Score` is backed by an `EvidenceFinding` object containing algorithmic confidence, error bounds, and exact physical measurements.

---

## Section H: Case Status State Machine & Governance Lifecycles

### 1. Case Lifecycle State Machine
```
   [ NEW INTAKE ]
          |
          v
     +---------+      Upload Docs      +-------------------+
     | CREATED | --------------------> | DOCUMENT_ATTACHED |
     +---------+                       +-------------------+
                                                 |
                                                 | Dispatch Analysis
                                                 v
+---------------------+     Completed      +-------------+
| INVESTIGATION_READY | <----------------- | IN_ANALYSIS |
+---------------------+                    +-------------+
          |                                      | (Error)
          | Officer Opens Tab                    v
          v                                +-------------+
+-------------------+                      | FAILED /    |
| OFFICER_REVIEWING |                      | INCONCLUSIVE|
+-------------------+                      +-------------+
          |
          | Submit Adjudication
          v
    +-----------+
    |  DECIDED  |  (CLEARED_PRIMARY | REFERRED_SECONDARY | BORDER_HOLD | DENIED_ENTRY)
    +-----------+
          |
          | Shift Close / Archival Policy
          v
    +-----------+
    | ARCHIVED  |  (Read-Only Persistent Record)
    +-----------+
```

### 2. Analysis Job State Machine
1. `QUEUED`: Analysis job placed into Redis/Postgres task queue.
2. `RUNNING`: Worker process has acquired lock; updates `progress_pct` ($0 \to 100$).
3. `COMPLETED`: Findings generated and aggregated into `risk_assessments`.
4. `FAILED`: Unhandled error recorded in `error_message`; does not stall officer UI.
5. `INCONCLUSIVE`: Image quality insufficient for confident automated extraction.

### 3. Officer Decision Workflow & Immutability Rules
- A case cannot transition to `DECIDED` without an authorized officer session.
- Notes must contain a minimum of 20 characters explaining the disposition.
- If disposition is `REFERRED_SECONDARY`, `BORDER_HOLD`, or `DENIED_ENTRY`, a supervisor badge is recorded.
- Once decided, the case record is cryptographically sealed: further edits to subject metadata or evidence findings are blocked by database triggers and API validation.

### 4. Cryptographic Audit Event Ledger (SHA-256 Chaining)
Every security-relevant action generates an `AuditEvent` where:
$$\text{EventHash}_n = \text{SHA256}(\text{EventUUID} + \text{OfficerID} + \text{Action} + \text{PayloadHash} + \text{EventHash}_{n-1})$$
Any retroactive modification of past events invalidates the cryptographic hash chain.

---

## Section I: File Storage, Privacy, Encryption & Security Governance

### 1. PII & Biometric Protection
- **No Raw Biometrics in Logs:** Bounding box coordinates and numerical similarity scores may be logged; raw biometric image bytes and facial landmark embeddings are excluded from standard logging.
- **Field-Level Masking:** Unprivileged roles (e.g., L1 screeners from other sectors) view masked passport numbers (`Z456****`) on queue listings.

### 2. Encryption at Rest & Secure Document Access
- High-resolution document scans and traveler portraits are stored on an encrypted filesystem volume (AES-256-XTS or LUKS).
- Direct HTTP access to raw image paths is forbidden. All image retrieval routes through `GET /api/v1/documents/{id}/file`, requiring an active bearer token with `CASE_VIEW` permission for that case.
- Document streaming checks session validity and writes an audit event (`ACTION: VIEW_DOCUMENT_RASTER`).

### 3. Role-Based Access Control (RBAC) Matrix
| Permission | L1 Primary Officer | L2 Secondary Inspector | Watch Commander / Supervisor | Auditor |
| :--- | :---: | :---: | :---: | :---: |
| `CASE_CREATE` | Yes | Yes | Yes | No |
| `CASE_VIEW` | Yes | Yes | Yes | Yes |
| `ANALYSIS_RUN` | Yes | Yes | Yes | No |
| `DECIDE_PRIMARY_CLEAR` | Yes | Yes | Yes | No |
| `DECIDE_SECONDARY_REFER`| Yes | Yes | Yes | No |
| `DECIDE_HOLD_DENY` | No (Requires L2) | Yes | Yes | No |
| `AUDIT_VIEW_FULL` | No | No | Yes | Yes |
| `SYSTEM_TELEMETRY` | Yes | Yes | Yes | Yes |

### 4. Data Retention & Statutory Purge
- **Cleared Travelers (No Flag):** Ephemeral document cache deleted after 24 hours in compliance with privacy regulations.
- **Investigative / Flagged Cases:** Persisted for 5 years in compliance with border security statutory evidentiary rules.

---

## Section J: Multi-Tier Testing Strategy

```
+--------------------------------------------------------------------------------------------------+
|                                    VERITAS TEST ARCHITECTURE                                     |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   +------------------------------------------------------------------------------------------+   |
|   |  TIER 1: UNIT & ALGORITHMIC TESTS (Pytest & Jest)                                        |   |
|   |  - ICAO Doc 9303 Modulo 10 Checksum algorithms (TD1, TD2, TD3)                           |   |
|   |  - Modulo weight correctness on synthetic valid & corrupted passport strings             |   |
|   |  - Risk fusion rule scoring weights and boundary conditions (0-100 score bounds)          |   |
|   |  - Pydantic v2 validation constraints and input sanitizers                               |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                |                                                 |
|                                                v                                                 |
|   +------------------------------------------------------------------------------------------+   |
|   |  TIER 2: REST API & INTEGRATION TESTS (Pytest + HTTPX + Async Engine)                     |   |
|   |  - Complete case creation, document upload, and analysis trigger lifecycle               |   |
|   |  - Officer adjudication locking: assert case is immutable once decided                   |   |
|   |  - RBAC permission enforcement: verify L1 officers cannot execute BORDER_HOLD            |   |
|   |  - Audit ledger SHA-256 rolling chain verification                                       |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                |                                                 |
|                                                v                                                 |
|   +------------------------------------------------------------------------------------------+   |
|   |  TIER 3: FRONTEND INTERACTION & ACCESSIBILITY TESTS (Playwright)                         |   |
|   |  - Tab navigation between all 8 case workspace views without loss of dossier state       |   |
|   |  - Multi-spectrum document viewer zoom/pan interactions and spectral layer toggles        |   |
|   |  - Officer decision modal form validation (notes length, supervisor badge sign-off)      |   |
|   |  - Screening queue debounced search and multi-criteria risk filtering                    |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                |                                                 |
|                                                v                                                 |
|   +------------------------------------------------------------------------------------------+   |
|   |  TIER 4: SYNTHETIC DATASET VALIDATION (Calibration Pipeline)                             |   |
|   |  - 50 synthetic test travel documents with known ground-truth alterations               |   |
|   |  - Precision/recall metrics for 0.12mm substrate incision detection                      |   |
|   |  - False-match vs false-non-match calibration for facial similarity thresholds           |   |
|   +------------------------------------------------------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
```

---

## Section K: Ordered Implementation Plan with Clear Exit Criteria

```
+----------------------------------------------------------------------------------------------------+
|                                    PHASED IMPLEMENTATION TIMELINE                                  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ PHASE 1: Application Foundation & Complete Frontend Screens ]                                  |
|      |  - Next.js 16 app shell, dark mission-critical defense design system, 22 screens/tabs       |
|      |  - Working UI interactions, centralized state, mock fixtures, production Turbopack build    |
|      |  STATUS: IMPLEMENTED & VERIFIED                                                             |
|      v                                                                                             |
|  [ PHASE 2: Backend Architecture & PostgreSQL Relational Core ]                                   |
|      |  - FastAPI application structure, SQLAlchemy models, Alembic migrations                     |
|      |  - JWT authentication, RBAC middleware, Case & Document REST CRUD endpoints                 |
|      |  - Officer decision recording & SHA-256 cryptographic audit ledger                          |
|      v                                                                                             |
|  [ PHASE 3: Frontend-to-Backend Full-Stack Integration ]                                            |
|      |  - Swap frontend mock fixtures for live REST API client                                     |
|      |  - Verify real case creation, document uploads, live filtering, and decision persistence   |
|      |  - Handle network loading, empty states, and RFC 7807 problem details                       |
|      v                                                                                             |
|  [ PHASE 4: Core Document AI & Biometric Pipelines ]                                               |
|      |  - PaddleOCR integration, ICAO Doc 9303 MRZ 7-3-1 modulo 10 engine                         |
|      |  - OpenCV substrate micro-incision detection, ArcFace 1:1 facial embedding comparison       |
|      v                                                                                             |
|  [ PHASE 5: Evidence Fusion Engine, Governance & System Hardening ]                                |
|      |  - Versioned deterministic explainable risk fusion ruleset                                  |
|      |  - End-to-end integration testing, calibration dataset verification, production container   |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### Phase 1: Application Foundation & Complete Frontend Screens *(Current Phase)*
- **Scope:** Complete implementation of all 22 designed screens, 8 case workspace tabs, UI interactions, navigation, modals, and responsive layouts using clearly isolated development fixtures.
- **Exit Criteria:**
  - `npm run build` passes with zero TypeScript or Turbopack errors.
  - All 17 route endpoints return HTTP 200 with valid HTML.
  - Interactive elements (tab navigation, modals, search, filters) execute without exceptions.
  - Stitch design system tokens (`DESIGN.md`) strictly maintained.
  - Original Stitch files and `DESIGN.md` remain completely unmodified.

### Phase 2: Backend Architecture & PostgreSQL Relational Core
- **Scope:** FastAPI application structure, SQLAlchemy models, Alembic migrations, JWT authentication, RBAC middleware, Case and Document REST CRUD endpoints, officer decision recording, and SHA-256 cryptographic audit ledger.
- **Exit Criteria:**
  - Alembic migrations apply cleanly against PostgreSQL.
  - Pytest API integration test suite passes with $>90\%$ branch coverage.
  - Case state transitions enforce immutability once decided.
  - Audit log chain verification test passes without broken links.

### Phase 3: Frontend-to-Backend Full-Stack Integration
- **Scope:** Connect Next.js frontend to FastAPI backend, replacing development fixtures with live HTTP calls.
- **Exit Criteria:**
  - Creating a case in the UI persists a real record in PostgreSQL.
  - Uploading a document stores file on disk and registers database record.
  - Deciding a case updates status in database and prevents further mutations.
  - Network timeouts and 4xx/5xx errors render clean workstation alerts.

### Phase 4: Core Document AI & Biometric Pipelines
- **Scope:** Integrate PaddleOCR, ICAO Doc 9303 MRZ engine, OpenCV substrate forensics, and ArcFace biometric comparison.
- **Exit Criteria:**
  - Accurate extraction of MRZ lines from test passport images.
  - Modulo 10 checksum tests pass on 100% of valid test vectors.
  - Substrate incision detector correctly flags altered test bio-pages.
  - Facial similarity engine outputs normalized cosine similarity metrics with explicit error bounds.

### Phase 5: Evidence Fusion Engine, Governance & System Hardening
- **Scope:** Implement deterministic risk fusion ruleset, explainable risk calculations, end-to-end acceptance tests, and Docker deployment orchestration.
- **Exit Criteria:**
  - Every single point of risk in `risk_score` is accounted for by a verified `EvidenceFinding`.
  - Full end-to-end user screening test passes from ingest to final adjudication.
  - Security audit confirms no raw PII in logs and files encrypted at rest.

---

## Section L: Open Architectural Questions & Missing Dependencies

1. **Hardware Platen Driver Protocols:**  
   *Question:* Will physical border e-Gates and flatbed document scanners connect via direct TWAIN/SANE USB daemons, or will a dedicated local hardware agent bridge them via WebSockets?  
   *Working Assumption:* In Phase 1 and 2, accept standard multi-part optical uploads (`TIFF`, `PNG`, `JPEG`); implement a WebSocket hardware driver abstraction in Phase 4.
2. **Biometric Inference Hardware (GPU vs CPU Fallback):**  
   *Question:* What hardware target is available at border workstations (NVIDIA TensorRT GPU vs CPU-only ONNX Runtime)?  
   *Recommendation:* Package the face-verification engine using ONNX Runtime with an automatic CUDA provider check and CPU fallback, guaranteeing deployment compatibility on standard checkpoint mini-PCs.
3. **Database & Cache Infrastructure Selection:**  
   *Question:* Should background analysis tasks run via Celery + Redis, ARQ, or FastAPI background tasks with PostgreSQL state tracking?  
   *Recommendation:* For air-gapped sovereign setups, start with PostgreSQL-backed async task queues to eliminate extra infrastructure dependencies, introducing Redis/Celery only when concurrent lane throughput exceeds 50 req/sec.
4. **Third-Party Government Mainframe Connectors:**  
   *Question:* What format will live national border databases and Interpol SLTD feeds use?  
   *Working Assumption:* Maintain strict interface isolation using local mock connectors (`InterpolMockClient`, `NationalVisaMockClient`) that follow standard ICAO/INTERPOL XML and JSON message schemas. Never claim live government connectivity without verified credentials.

---

## Specification Verification & Document Location

- **Artifact Document:** `veritas_master_architecture_blueprint.md`
- **Workspace Permanent Copy:** `c:\Users\krish\OneDrive\Desktop\SIH PROJECT\VERITAS_MASTER_ARCHITECTURE_BLUEPRINT.md`
- **Design System Reference:** `c:\Users\krish\OneDrive\Desktop\SIH PROJECT\stitch_design_system_generator\mission_critical_defense_workstation\DESIGN.md`
- **Current Status:** Blueprint completed. Awaiting user review and authorization before proceeding to Phase 2 implementation.
