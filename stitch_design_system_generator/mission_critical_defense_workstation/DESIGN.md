---
name: Mission-Critical Defense Workstation
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#c0c7d3'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#8a919d'
  outline-variant: '#404751'
  surface-tint: '#9fcaff'
  primary: '#9fcaff'
  on-primary: '#003258'
  primary-container: '#007acc'
  on-primary-container: '#ffffff'
  inverse-primary: '#0061a4'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#b7c8e1'
  on-tertiary: '#213145'
  tertiary-container: '#68788f'
  on-tertiary-container: '#000510'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#9fcaff'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#00497d'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
  surface-base: '#07090E'
  surface-workstation: '#0B0E14'
  surface-panel: '#111622'
  surface-elevated: '#181F2E'
  surface-overlay: '#1E273A'
  border-subtle: '#1E2638'
  border-strong: '#2D384E'
  border-active: '#007ACC'
  status-critical: '#EF4444'
  status-critical-bg: '#2A1215'
  status-warning: '#F59E0B'
  status-warning-bg: '#2B1E08'
  status-success: '#10B981'
  status-success-bg: '#092419'
  status-info: '#007ACC'
  status-info-bg: '#0B2238'
  forensic-cyan: '#06B6D4'
  forensic-magenta: '#D946EF'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-xs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
  code-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-lg: 1rem
  margin: 1rem
  margin-lg: 1.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style
This design system defines an authoritative, high-density aviation security, border management, and digital forensics workstation. Designed strictly for credentialed officers, intelligence analysts, and station commanders, the visual language rejects consumer-grade SaaS conventions, decorative rounded cards, and theatrical "futuristic" AI clichés. Instead, it embodies institutional discipline, scientific rigor, and forensic traceability.

The aesthetic fuses modern defense ergonomics with digital-forensics precision. The visual baseline is deep graphite and carbon, reducing eye fatigue during prolonged low-light tactical operations. Color is never decorative; every chromatic value corresponds to a deterministic operational state: authoritative maritime blue/cyan for system intelligence and active telemetry, forensic amber for warnings and anomalies, critical crimson for anomalies and tampering flags, and verified emerald for confirmed checksums and matched baselines.

The interface projects quiet authority: high information density without visual chaos, mathematical typographic rhythm, 1px structural datum lines, and restrained physical elevation. The interaction posture treats the operator as the ultimate authority, framing AI and biometric matching as decision-support telemetry rather than infallible automated judgment.

## Colors
The color architecture enforces strict operational telemetry. Deep near-black values establish a noise-free substrate, minimizing visual fatigue across multi-monitor control centers.

### Primary Palette & Roles
- **Primary (`#007ACC`)**: Authoritative maritime/cyan blue. Serves as the primary operational driver—active screening frames, primary confirmed navigation points, focused inputs, and system heartbeat indicators.
- **Secondary (`#38BDF8`)**: High-visibility technical sky blue used for secondary forensic metadata, active cross-document matching vectors, and biometric boundary highlights.
- **Tertiary (`#64748B`)**: Industrial slate slate for passive system metrics, unselected timeline steps, and structural coordinate labels.
- **Neutral (`#0B0E14`)**: Foundational workstation carbon. Deepened to `#07090E` for root canvases and stepped incrementally (`#111622`, `#181F2E`, `#1E273A`) to define structural panels without cast shadows.

### Forensic & Operational Semantics
- **Critical / Anomaly (`#EF4444` / `#2A1215`)**: Document tampering, MRZ checksum failures, deepfake alerts, and secondary review recommendations. Used with razor-thin borders and solid badges.
- **Warning / Discrepancy (`#F59E0B` / `#2B1E08`)**: Expiring documentation, mild biometric threshold variance, glare detection, or partial name transliterations.
- **Verified / Compliant (`#10B981` / `#092419`)**: Cryptographic chip verification, ICAO standard match, and clear clearance indicators.
- **Telemetry Cyan (`#06B6D4`)**: Extracted OCR vectors, bounding boxes, and node links in identity graphs.

## Typography
Typographic composition emphasizes instant scannability and absolute clarity under time-pressured border operations. `Inter` is utilized exclusively across all hierarchy levels to preserve mechanical uniformity, leveraging its neutral grotesque apertures and tall x-height.

### Typographic Hierarchy Rules
- **Structural Identity**: Headings (`headline-xl`, `headline-lg`) utilize tight negative tracking (-0.02em to -0.015em) and semi-bold weights to delineate workstation zones cleanly without dominating viewport real estate.
- **Operational Labels (`label-xs`, `label-md`)**: Rendered in uppercase with generous positive tracking (`0.04em` to `0.08em`) to designate status tags, telemetry categories (e.g., `MRZ CHECKSUM`, `BIO-MATCH SCORE`), and system stamps.
- **Forensic & Tabular Metrics**: Data figures, passport serials, ICAO hashes, and chronological audit timestamps utilize tabular figures (`font-feature-settings: "tnum" on, "zero" on`) to guarantee vertical column alignment across queue tables and multi-pane inspection docks.

## Layout & Spacing
The layout system enforces a modular, high-density 12-column analytical workstation grid optimized for wide-aspect multi-screen security stations, adapting systematically down to operational tactical tablets.

### Density & Rhythms
- **Screen Base Grid**: A strict 4px base increment (`0.25rem`) governs all internal components. Spacing values prioritize information packing: `space-xs` (4px) and `space-sm` (8px) define tight pairings between metadata keys and telemetry values.
- **Workstation Layout Engine**: Screen layouts feature a permanent 240px operational navigation sidebar, a persistent 48px global status and checkpoint utility header, and a responsive multi-dock core area. 
- **Analytical Split-Panes**: Multi-document inspection workflows split the viewport into 50/50 dual-canvases (e.g., Document vs. Live Biometric, or Passport vs. Visa extracted schema) separated by a mandatory 1px technical border divider with `0.75rem` (`gutter`) clearance.
- **Reflow & Breakpoints**:
  - `Desktop (>= 1280px)`: Full multi-pane analysis with side-by-side forensic document inspection, real-time telemetry inspector, and docked queue list.
  - `Laptop / Compact Workstation (1024px - 1279px)`: Forensic overlays collapse secondary metadata into expandable accordion drawers; split-pane document view remains lock-stepped.
  - `Tablet / Field Unit (< 1024px)`: Left navigation collapses into an icon rail; dual-evidence inspection shifts to a high-speed segmented tab toggle.

## Elevation & Depth
In a mission-critical defense workstation, artificial drop shadows are strictly avoided as they dilute contrast, obscure micro-data, and create visual sluggishness. Elevation is achieved solely through calibrated tonal layering, high-precision hair-thin borders, and selective inner luminescence.

### Elevation Hierarchy
- **Level 0 (Canvas Base - `#07090E`)**: The fundamental monitor substrate. Hosts static layout frames, inactive workspace dividers, and background gridlines.
- **Level 1 (Workstation Panels - `#0B0E14`)**: Standard operational surfaces containing queues, tabular records, and sidebars. Defined by a crisp `1px solid #1E2638` border.
- **Level 2 (Active Evidence Cells - `#111622`)**: Foreground work cells, active document inspection viewports, and identity graph canvases. Surface shift provides immediate visual lift over Level 1.
- **Level 3 (Inspection Drawers & Modals - `#181F2E`)**: Officer confirmation dialogs, forensic finding popovers, and override overlays. Framed with a prominent `1px solid #2D384E` border and supported by a hard, dark 16px ambient scrim (`rgba(0, 0, 0, 0.75)`).

### Forensic Overlays & Bounding Indicators
Active target boundaries (faces, MRZ zones, microprint anomalies) project zero blur. Instead, they utilize a `1px` high-contrast stroke (`#007ACC` or `#EF4444`) with an ultra-subtle tinted wash (`rgba(0, 122, 204, 0.08)`) directly over the document substrate.

## Shapes
Shape geometry reinforces military-grade precision, operational discipline, and mechanical clarity. This design system specifies **Level 1 (Soft / 4px base)** corner styling.

### Geometric Rules
- **Base Components**: Standard inputs, action triggers, status chips, and tabular rows employ a strict `4px` (`0.25rem`) border radius. This subtle rounding eliminates raw, sharp optical artifacts on dark high-DPI panels while maintaining a disciplined architectural profile.
- **Structural Panels & Document Viewports**: Major workstation containers, document scan envelopes, and modal windows scale up to `8px` (`0.5rem`, `rounded-lg`).
- **Pills & Circular Geometry**: Circular shapes are strictly reserved for unread counters, identity graph relationship nodes, and active system health status pulses (`w-2 h-2 rounded-full`). Pill shapes for buttons or inputs are prohibited to prevent consumer-app aesthetic contamination.

## Components

### Buttons & Interactive Triggers
- **Primary Operational (`[ START SCREENING ]`, `[ CONFIRM DECISION ]`)**: Solid maritime blue (`#007ACC`) background, `#FFFFFF` text, `font-weight: 600`, `letter-spacing: 0.02em`, `height: 36px`, `padding: 0 16px`, `border-radius: 4px`. Hover state: `#008CE6`. Active/Pressed: `#0062A3`.
- **Secondary / Action Frame**: Transparent background with a `1px solid #2D384E` stroke, text color `#F1F5F9`. Hover: background `#181F2E`, border `#38BDF8`.
- **Destructive / Escalation (`[ ESCALATE CASE ]`)**: Dark crimson fill (`#2A1215`), border `1px solid #EF4444`, text `#EF4444`. Hover: background `#EF4444`, text `#FFFFFF`.
- **Icon Actions**: 32x32px square targets, `1px solid #1E2638`, neutral slate icons (`#94A3B8`).

### Status Badges & Risk Tags
- **Structural Token**: `height: 20px`, `padding: 0 8px`, `border-radius: 2px`, `font-size: 10px`, `font-weight: 700`, uppercase, tabular tracking.
- **Critical Anomaly (`HIGH RISK`, `TAMPERING DETECTED`)**: Red background `#2A1215`, border `1px solid #EF4444`, text `#FCA5A5`. Accompanied by a leading 6px crimson dot indicator.
- **Advisory (`SECONDARY REVIEW`, `WARNING`)**: Amber background `#2B1E08`, border `1px solid #F59E0B`, text `#FCD34D`.
- **Clearance (`CLEARED`, `VALID`)**: Green background `#092419`, border `1px solid #10B981`, text `#6EE7B7`.

### Forensic Document Viewer & Overlays
- **Central Canvas**: High-resolution zoom/pan workspace set on `#07090E` with a subtle 16px technical dotted grid pattern (`rgba(255, 255, 255, 0.04)`).
- **Inspection Markers**: Interactive vector frames positioned over anomalies. 
  - Red vector box = Forensic anomaly / pixel alteration.
  - Cyan vector box = OCR extracted data block.
  - Yellow vector box = Low-confidence optical read / specular glare.
- Clicking an anomaly frame triggers an anchored analytical tooltip detailing error code, algorithm confidence (e.g., `CONFIDENCE: 94.2%`), and cross-reference schema.

### Biometric Face-Comparison Dock
- Two standardized 1:1 ratio visual cells displaying `DOCUMENT PORTRAIT` vs. `PRESENTED PERSON`.
- Framed with 4-corner targeting brackets (`2px` cyan corner ticks).
- Center telemetry bridge displays numerical similarity (`SIMILARITY SCORE: 42.8%`) utilizing `display-lg` tabular numerals, paired with an explicit, non-definitive advisory label (`LOW SIMILARITY - SECONDARY VERIFICATION REQUIRED`).

### Input Fields & Search Bars
- Background `#0B0E14`, border `1px solid #1E2638`, height `36px`, text `#F1F5F9`, placeholder `#475569`, border-radius `4px`.
- Focus state: `border-color: #007ACC`, zero outer glow rings, replacing subtle border with a crisp 1px active indicator.

### Audit Trail & Chronological Timelines
- Vertical left-aligned timeline spine (`1px solid #1E2638`).
- Monospace timestamp prefix (`08:41:09`) rendered in `label-md` neutral slate (`#64748B`).
- Event nodes use 6px solid square pips: cyan for automated system ingest, red for anomaly discovery, and amber for manual officer interventions.