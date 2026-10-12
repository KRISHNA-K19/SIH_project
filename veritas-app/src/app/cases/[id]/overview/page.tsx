"use client";

import React from "react";
import Link from "next/link";
import { useVeritas } from "@/context/VeritasContext";
import { RiskScore } from "@/components/ui/RiskScore";
import { EvidenceCard } from "@/components/ui/EvidenceCard";

export default function CaseOverview() {
  const { activeCase, setSelectedEvidence } = useVeritas();

  if (!activeCase) return null;

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* SECTION 01: WHAT IS THE RISK? (Risk Anchor Banner) */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-surface-panel to-surface-dim p-space-xl shadow-2xl border border-border-subtle">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-status-critical/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-space-lg">
          {/* Case Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-border-subtle/80 font-code-md">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs px-2.5 py-1 rounded bg-surface-elevated text-forensic-cyan tracking-wider">
                <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                CASE #{activeCase.id}
              </div>
              <span className="text-outline">/</span>
              <span className="font-headline-md text-on-surface uppercase tracking-wide">
                {activeCase.subject.name}
              </span>
            </div>
            <div className="flex items-center gap-space-lg text-on-surface-variant text-code-md">
              <div className="flex items-center gap-space-xs">
                <span className="text-outline uppercase font-label-xs">Nationality:</span>
                <span className="text-on-surface font-semibold">{activeCase.subject.nationality}</span>
              </div>
              <span className="text-outline">•</span>
              <div className="flex items-center gap-space-xs">
                <span className="text-outline uppercase font-label-xs">Inbound:</span>
                <span className="text-primary font-semibold">{activeCase.flight.number} ({activeCase.flight.route})</span>
              </div>
              <span className="text-outline">•</span>
              <div className="flex items-center gap-space-xs">
                <span className="text-outline uppercase font-label-xs">Lane:</span>
                <span className="text-on-surface">{activeCase.lane}</span>
              </div>
            </div>
          </div>

          {/* Threat Assessment & Risk Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center py-space-xs">
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
              <div className="flex items-center gap-space-md px-space-xl py-space-md rounded-lg bg-status-critical-bg shadow-lg border border-status-critical/30">
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-critical opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-status-critical"></span>
                </span>
                <div className="flex flex-col">
                  <span className="font-label-xs text-label-xs tracking-widest text-error uppercase font-bold">
                    Threat Assessment
                  </span>
                  <span className="text-[32px] sm:text-[38px] font-black tracking-tight text-status-critical leading-none font-display-lg">
                    {activeCase.riskLevel} RISK
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-xs text-label-xs tracking-wider uppercase text-outline">
                  Statutory Directive
                </span>
                <div className="flex items-center gap-space-xs text-on-surface font-headline-xl text-headline-xl">
                  <span className="material-symbols-outlined text-status-critical text-[28px]">warning</span>
                  <span className="font-bold text-error tracking-tight">
                    {activeCase.decisionRecommendation}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Automated border clearance suspended. Biometric & documentary discrepancies mandate physical inspection.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-start lg:justify-end border-t lg:border-t-0 lg:border-l border-border-subtle pt-space-md lg:pt-0 lg:pl-space-xl">
              <RiskScore score={activeCase.riskScore} level={activeCase.riskLevel === "HIGH" ? "high" : activeCase.riskLevel === "MEDIUM" ? "medium" : "low"} />
            </div>
          </div>
        </div>
      </section>

      {/* WORKSPACE OVERVIEW CONTENT: 2-COLUMN GRID */}
      <div className="grid grid-cols-12 gap-space-lg">
        {/* LEFT COLUMN: TRAVELER RECORD & SPECIMENS (5 COLS) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-space-lg">
          {/* Dossier Card */}
          <div className="bg-surface-workstation rounded-lg p-space-lg shadow-md flex flex-col border border-border-subtle">
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-border-subtle">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-forensic-cyan text-[20px]">person_pin</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">Traveler & Transit Record</span>
              </div>
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-status-success font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Active Manifest
              </span>
            </div>

            {/* Flight Grid */}
            <div className="bg-surface-panel rounded p-space-md grid grid-cols-3 gap-space-sm mb-space-md text-center border border-border-subtle">
              <div className="flex flex-col">
                <span className="font-label-xs text-outline uppercase">Flight</span>
                <span className="font-headline-md text-on-surface font-bold">{activeCase.flight.number}</span>
                <span className="font-body-sm text-outline">{activeCase.flight.route}</span>
              </div>
              <div className="flex flex-col bg-surface-elevated rounded p-1 border border-border-subtle">
                <span className="font-label-xs text-outline uppercase">Seat / Class</span>
                <span className="font-headline-md text-forensic-cyan font-bold">{activeCase.flight.seat}</span>
                <span className="font-body-sm text-on-surface-variant">{activeCase.flight.cabinClass}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-xs text-outline uppercase">Location</span>
                <span className="font-headline-md text-on-surface font-bold">{activeCase.checkpoint.split(" ")[0]}</span>
                <span className="font-body-sm text-status-info">{activeCase.lane.split(" ")[0]}</span>
              </div>
            </div>

            {/* Specimen Cards */}
            <div className="flex flex-col gap-space-sm">
              {activeCase.documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="bg-surface-panel rounded p-space-md flex flex-col gap-space-xs transition-colors hover:bg-surface-elevated border border-border-subtle"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        {doc.type.includes("Passport") ? "menu_book" : "verified"}
                      </span>
                      <span className="font-label-lg text-on-surface font-semibold">
                        Specimen {String.fromCharCode(65 + idx)}: {doc.type}
                      </span>
                    </div>
                    <span className="bg-surface-elevated text-forensic-cyan text-label-xs font-mono font-bold px-2 py-0.5 rounded border border-border-subtle">
                      #{doc.documentNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs text-body-sm pt-space-xs text-outline">
                    <div>Format: <span className="text-status-success font-semibold">{doc.status}</span></div>
                    <div>Expiry: <span className="text-on-surface-variant font-mono">{doc.expiryDate}</span></div>
                    <div>Post: <span className="text-on-surface-variant">{doc.issuePost}</span></div>
                    <div>Chip: <span className="text-status-success font-semibold">{doc.chipVerified ? "Verified" : "N/A"}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Biometric Snapshot Preview */}
            <div className="mt-space-md pt-space-md border-t border-border-subtle flex items-center justify-between gap-space-md">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full aspect-[4/5] bg-surface-base rounded overflow-hidden relative border border-border-subtle">
                  <img
                    className="w-full h-full object-cover"
                    src={activeCase.biometrics.passportPhotoUrl}
                    alt="Passport Chip Photo"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-surface-workstation/90 p-1 text-center">
                    <span className="font-label-xs text-outline uppercase tracking-wider">Passport Photo</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-status-critical-bg text-status-critical flex items-center justify-center font-bold text-label-xs border border-status-critical/30">
                  ≠
                </div>
                <span className="font-code-md text-status-critical font-bold mt-1">
                  {activeCase.biometrics.similarityScore}%
                </span>
                <span className="font-label-xs text-outline uppercase">Match</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full aspect-[4/5] bg-surface-base rounded overflow-hidden relative border border-border-subtle">
                  <img
                    className="w-full h-full object-cover"
                    src={activeCase.biometrics.livePhotoUrl}
                    alt="Live Kiosk Capture"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-surface-workstation/90 p-1 text-center">
                    <span className="font-label-xs text-forensic-cyan uppercase tracking-wider">Live Kiosk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deterministic Verification Matrix */}
          <div className="bg-surface-workstation rounded-lg p-space-lg shadow-md flex flex-col gap-space-md border border-border-subtle">
            <div className="flex items-center gap-space-sm pb-space-xs border-b border-border-subtle">
              <span className="material-symbols-outlined text-forensic-cyan text-[20px]">fact_check</span>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                Deterministic Verification Matrix
              </span>
            </div>

            {/* Matrix Row 1: Document Integrity */}
            <div className="bg-surface-panel rounded p-space-md flex flex-col gap-space-xs border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-label-md uppercase tracking-wider text-outline">Document Integrity</span>
                <span className="bg-status-warning-bg text-status-warning text-label-xs font-bold px-2 py-0.5 rounded border border-status-warning/30">
                  SUBSTRATE ALERT
                </span>
              </div>
              <div className="flex items-center gap-space-md flex-wrap pt-1 font-body-sm text-body-sm">
                <span className="flex items-center gap-1 text-status-success font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Checksum Valid
                </span>
                <span className="flex items-center gap-1 text-status-success font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Format Valid
                </span>
                <span className="flex items-center gap-1 text-status-critical font-bold">
                  <span className="material-symbols-outlined text-[16px]">warning</span> Substrate Anomaly
                </span>
              </div>
            </div>

            {/* Matrix Row 2: Identity Telemetry */}
            <div className="bg-surface-panel rounded p-space-md flex flex-col gap-space-xs border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-label-md uppercase tracking-wider text-outline">Identity Telemetry</span>
                <span className="bg-status-critical-bg text-status-critical text-label-xs font-bold px-2 py-0.5 rounded border border-status-critical/30">
                  NON-CONVERGENCE
                </span>
              </div>
              <div className="flex items-center gap-space-md flex-wrap pt-1 font-body-sm text-body-sm">
                <span className="flex items-center gap-1 text-status-critical font-bold">
                  <span className="material-symbols-outlined text-[16px]">cancel</span> {activeCase.biometrics.similarityScore}% Similarity Match
                </span>
                <span className="flex items-center gap-1 text-status-success font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span> Anti-Spoof {activeCase.biometrics.antiSpoofConfidence}%
                </span>
              </div>
            </div>

            {/* Matrix Row 3: Cross-Record Consistency */}
            <div className="bg-surface-panel rounded p-space-md flex flex-col gap-space-xs border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-label-md uppercase tracking-wider text-outline">Cross-Record Consistency</span>
                <span className="bg-status-critical-bg text-status-critical text-label-xs font-bold px-2 py-0.5 rounded border border-status-critical/30">
                  CHRONO CONFLICT
                </span>
              </div>
              <div className="flex items-center gap-space-md flex-wrap pt-1 font-body-sm text-body-sm">
                <span className="flex items-center gap-1 text-status-critical font-bold">
                  <span className="material-symbols-outlined text-[16px]">cancel</span> DOB Mismatch (+1 yr)
                </span>
                <span className="flex items-center gap-1 text-status-success font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Name Match
                </span>
                <span className="flex items-center gap-1 text-status-success font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Nationality Match
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRIMARY RISK SIGNALS & EVIDENCE (7 COLS) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-space-lg">
          {/* Signal Cards */}
          <div className="bg-surface-workstation rounded-lg p-space-lg shadow-md flex flex-col border border-border-subtle">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-status-critical text-[22px]">crisis_alert</span>
                <div>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold">
                    Primary Risk Signals
                  </span>
                  <p className="font-body-sm text-outline">
                    Deterministic factors driving the {activeCase.riskScore}/100 composite threat score
                  </p>
                </div>
              </div>
              <span className="font-label-xs text-label-xs bg-surface-panel text-outline px-2 py-1 rounded border border-border-subtle">
                {activeCase.evidence.length} DETECTED
              </span>
            </div>

            <div className="flex flex-col gap-space-md">
              {activeCase.evidence.map((ev) => (
                <EvidenceCard
                  key={ev.id}
                  evidence={ev}
                  onInspect={(e) => setSelectedEvidence(e)}
                />
              ))}
            </div>
          </div>

          {/* Micro-Inspector Callout Strip */}
          <div className="bg-surface-workstation rounded-lg p-space-lg shadow-md flex flex-col border border-border-subtle">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-forensic-cyan text-[20px]">center_focus_strong</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  Substrate Scan Micro-Inspector Preview
                </span>
              </div>
              <Link
                href={`/cases/${activeCase.id}/forensics`}
                className="font-label-xs text-primary hover:text-secondary uppercase font-bold flex items-center gap-1"
              >
                Full Forensics <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="bg-surface-base rounded overflow-hidden relative aspect-video flex items-center justify-center border border-border-strong">
                <img
                  className="w-full h-full object-cover"
                  src={activeCase.documents[0]?.docImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuCt5B8NqUydPjWJxu2BEWTvEpofK_SGm3-o3IW7oN3Gz6eOaL6KZ3vaDfUja1xqTCzlBERYB9_20oOgX1QOEycqm5xESEgEn76d7aElzU5ogtpmW_r78t-9oaa7lthdXXpdS36qgege-RikSZ6Ki8WfHMe40PE3S3bVDF5iXv5YLTj3F5OcH2BnUSVgLH8dP-BpQIaFuJ79TB7_pqGCo5BK70DlOdqd2LO0v-j9jj3aqQSGcbNwpwfr"}
                  alt="Microscopic cut preview"
                />
                <div className="absolute top-2 left-2 bg-status-critical-bg text-status-critical font-code-md text-code-md px-2 py-0.5 rounded font-bold border border-status-critical/30">
                  0.12mm CUT DETECTED
                </div>
              </div>
              <div className="bg-surface-panel rounded p-space-md flex flex-col justify-between border border-border-subtle">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-md uppercase text-outline">Forensic Finding</span>
                  <h3 className="font-headline-md text-on-surface font-bold">Substrate Delamination Detected</h3>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    Physical security layer shows evidence of photo-substitution attempt. Security fibers do not fluoresce consistently across right border boundary.
                  </p>
                </div>
                <div className="pt-space-sm flex items-center justify-between border-t border-border-subtle">
                  <span className="font-code-md text-outline">ANOMALY REF: #FOR-9921-X</span>
                  <span className="font-label-xs text-status-critical font-bold uppercase">Severity: Level 4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
