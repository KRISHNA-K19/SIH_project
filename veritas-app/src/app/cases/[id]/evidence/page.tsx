"use client";

import React from "react";
import { useVeritas } from "@/context/VeritasContext";
import { EvidenceCard } from "@/components/ui/EvidenceCard";

export default function CaseEvidencePage() {
  const { activeCase, setSelectedEvidence } = useVeritas();

  if (!activeCase) return null;

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Category Diagnostic Matrix (4-Card Bento Grid from Stitch) */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase tracking-wide">
            Category Diagnostic Matrix
          </h3>
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-mono">
            Deterministic Engine Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Module 1: Document */}
          <div className="flex flex-col justify-between p-space-lg rounded-lg bg-surface-panel shadow-md border border-border-subtle">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-xs text-outline uppercase font-bold">Module 01</span>
                <span className="w-8 h-8 rounded-full bg-status-success-bg text-status-success flex items-center justify-center border border-status-success/30">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </span>
              </div>
              <div>
                <span className="font-label-md text-outline uppercase">Substrate Integrity</span>
                <h4 className="font-headline-md text-status-success font-bold mt-0.5">VALIDATION PASSED</h4>
              </div>
            </div>
            <div className="pt-space-md mt-space-sm border-t border-border-subtle flex flex-col gap-1 text-body-sm text-outline">
              <div className="flex justify-between">
                <span>Hologram Seal:</span>
                <span className="text-on-surface font-mono font-medium">Valid OVI</span>
              </div>
              <div className="flex justify-between">
                <span>ICAO 9303 MRZ:</span>
                <span className="text-status-success font-mono font-bold">Verified</span>
              </div>
            </div>
          </div>

          {/* Module 2: Identity */}
          <div className="flex flex-col justify-between p-space-lg rounded-lg bg-surface-panel shadow-md border border-status-critical/30">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-xs text-outline uppercase font-bold">Module 02</span>
                <span className="w-8 h-8 rounded-full bg-status-critical-bg text-status-critical flex items-center justify-center border border-status-critical/30">
                  <span className="material-symbols-outlined text-[18px]">person_alert</span>
                </span>
              </div>
              <div>
                <span className="font-label-md text-outline uppercase">Biometric Match</span>
                <h4 className="font-headline-md text-status-critical font-bold mt-0.5">LOW SIMILARITY</h4>
              </div>
            </div>
            <div className="pt-space-md mt-space-sm border-t border-border-subtle flex flex-col gap-1 text-body-sm text-outline">
              <div className="flex justify-between">
                <span>Live Vector:</span>
                <span className="text-status-critical font-mono font-bold">{activeCase.biometrics.similarityScore}% Match</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Band:</span>
                <span className="text-on-surface font-mono">High Variance</span>
              </div>
            </div>
          </div>

          {/* Module 3: Forensics */}
          <div className="flex flex-col justify-between p-space-lg rounded-lg bg-surface-panel shadow-md border border-status-warning/30">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-xs text-outline uppercase font-bold">Module 03</span>
                <span className="w-8 h-8 rounded-full bg-status-warning-bg text-status-warning flex items-center justify-center border border-status-warning/30">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </span>
              </div>
              <div>
                <span className="font-label-md text-outline uppercase">Physical Tamper Scan</span>
                <h4 className="font-headline-md text-status-warning font-bold mt-0.5">ANOMALY DETECTED</h4>
              </div>
            </div>
            <div className="pt-space-md mt-space-sm border-t border-border-subtle flex flex-col gap-1 text-body-sm text-outline">
              <div className="flex justify-between">
                <span>UV 380nm Scan:</span>
                <span className="text-status-warning font-mono font-bold">Razor Boundary</span>
              </div>
              <div className="flex justify-between">
                <span>Guilloche:</span>
                <span className="text-on-surface font-mono">Discontinuous</span>
              </div>
            </div>
          </div>

          {/* Module 4: Cross-Document */}
          <div className="flex flex-col justify-between p-space-lg rounded-lg bg-surface-panel shadow-md border border-status-critical/30">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-xs text-outline uppercase font-bold">Module 04</span>
                <span className="w-8 h-8 rounded-full bg-status-critical-bg text-status-critical flex items-center justify-center border border-status-critical/30">
                  <span className="material-symbols-outlined text-[18px]">rule</span>
                </span>
              </div>
              <div>
                <span className="font-label-md text-outline uppercase">Data Synthesis</span>
                <h4 className="font-headline-md text-status-critical font-bold mt-0.5">INCONSISTENCY FLAGGED</h4>
              </div>
            </div>
            <div className="pt-space-md mt-space-sm border-t border-border-subtle flex flex-col gap-1 text-body-sm text-outline">
              <div className="flex justify-between">
                <span>DOB Cross-Check:</span>
                <span className="text-status-critical font-mono font-bold">+1 Year Variance</span>
              </div>
              <div className="flex justify-between">
                <span>Visa Record:</span>
                <span className="text-error font-mono">Non-congruent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Evidentiary Locker */}
      <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-forensic-cyan text-[20px]">inventory_2</span>
            <span className="font-headline-md text-on-surface font-bold uppercase">
              Evidentiary Findings Locker ({activeCase.evidence.length})
            </span>
          </div>
          <span className="text-outline text-label-xs font-mono">ISO/IEC 27037 FORENSIC CHAIN COMPLIANT</span>
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
    </div>
  );
}
