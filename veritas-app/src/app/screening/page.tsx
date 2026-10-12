"use client";

import React from "react";
import Link from "next/link";
import { useVeritas } from "@/context/VeritasContext";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function LiveScreeningPage() {
  const { cases } = useVeritas();
  const activeQueued = cases[0];

  return (
    <div className="flex flex-col gap-space-xl max-w-7xl mx-auto pb-space-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            Live Checkpoint Screening Console
          </h1>
          <p className="font-body-md text-outline">
            Delta Airside Intake Gate · Realtime Optical Sensors & Platen Readers
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <Link href="/screening/queue">
            <SecondaryButton icon="list">FULL QUEUE ({cases.length})</SecondaryButton>
          </Link>
          <Link href="/screening/new">
            <PrimaryButton icon="add">MANUAL SCREENING INTAKE</PrimaryButton>
          </Link>
        </div>
      </div>

      {/* Live Lane Sensor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Active Sensor Live Monitor (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="bg-surface-workstation rounded-lg p-space-md border border-border-subtle shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-critical animate-ping"></span>
                <span className="font-label-md text-on-surface uppercase font-bold">
                  Active Camera Feed · Lane 4 (Airside)
                </span>
              </div>
              <span className="font-code-md text-status-critical bg-status-critical-bg px-2 py-0.5 rounded font-bold border border-status-critical/30">
                SUBJECT DETECTED · SUSPENDED FOR REVIEW
              </span>
            </div>

            {/* Video Feed Simulation Canvas */}
            <div className="relative w-full h-[400px] rounded bg-[#07090E] border border-border-strong overflow-hidden flex items-center justify-center select-none">
              <img
                src={activeQueued?.biometrics.livePhotoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDYuNxEDHFWRvznvfPNj7y-9O_rkn6sT53-tNBKJB0k15A5wyzLZvFzF_ftQP-oFb-o7Nde-xc3ObEKyJ9E7nswkUaBfpzyGMRIK5CymfzgQsV0WVaPenRATXYi4j6Rcn5BVkXOP7pMVhj4vioJITpPyGGoOKVtJ2IryERUeQQ3SJl6SYi1Owwn63lj9JDep79M6z0m4vEAJQ6zdd2G_q84PSFme6SKil7KdQ1TLs9L7QxZtpMCr9R6"}
                alt="Live Surveillance Capture"
                className="w-full h-full object-cover opacity-85"
              />

              {/* Facial Mesh Bounding Box Overlay */}
              <div className="absolute inset-x-1/3 top-12 bottom-16 border-2 border-forensic-cyan rounded flex flex-col justify-between p-2 pointer-events-none">
                <div className="flex items-center justify-between">
                  <span className="bg-forensic-cyan text-surface-base font-label-xs text-[10px] font-bold px-1 py-0.5 rounded">
                    FACE TRACKED #01
                  </span>
                  <span className="text-forensic-cyan font-mono text-[10px]">468 PTS</span>
                </div>
                <div className="bg-status-critical/90 text-white font-mono text-[11px] font-bold p-1 rounded text-center">
                  SIMILARITY: {activeQueued?.biometrics.similarityScore}% (FAIL)
                </div>
              </div>

              {/* Camera Metadata Overlay */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded font-mono text-[11px] text-outline">
                FPS: 59.9 · RES: 3840x2160 · ISO: 400 · LUX: 420
              </div>
            </div>

            {/* In-Console Quick Action */}
            {activeQueued && (
              <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-status-critical text-[24px]">crisis_alert</span>
                  <div>
                    <span className="font-headline-md text-on-surface font-bold">
                      {activeQueued.subject.name} (Flight {activeQueued.flight.number})
                    </span>
                    <p className="font-body-sm text-outline">
                      Case #{activeQueued.id} · Score: {activeQueued.riskScore}/100 · {activeQueued.decisionRecommendation}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/cases/${activeQueued.id}/overview`}
                  className="h-9 px-space-lg bg-status-info hover:bg-primary-container text-white font-label-md rounded font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shrink-0"
                >
                  OPEN CASE WORKSPACE
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sensor Pipeline Status & Quick Controls (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Station Diagnostics */}
          <div className="bg-surface-workstation rounded-lg p-space-md border border-border-subtle shadow-md flex flex-col gap-space-sm">
            <span className="font-label-xs uppercase text-outline font-bold border-b border-border-subtle pb-1">
              Active Hardware Intake Nodes
            </span>
            <div className="flex flex-col gap-2 font-body-sm">
              <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">Platen Reader 4K Coaxial</div>
                  <div className="text-outline text-[11px]">Optical MRZ + 380nm UV</div>
                </div>
                <StatusBadge status="success" text="ONLINE" />
              </div>
              <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">Biometric Face Sensor</div>
                  <div className="text-outline text-[11px]">Stereo IR Depth + RGB</div>
                </div>
                <StatusBadge status="success" text="ONLINE" />
              </div>
              <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">E-Passport Chip NFC Antenna</div>
                  <div className="text-outline text-[11px]">BAC/PACE/EAC v2</div>
                </div>
                <StatusBadge status="success" text="ONLINE" />
              </div>
              <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">Turnstile Barrier Gateway</div>
                  <div className="text-outline text-[11px]">DELTA-01 Airside Door</div>
                </div>
                <StatusBadge status="warning" text="HELD" />
              </div>
            </div>
          </div>

          {/* Quick Dispatch Actions */}
          <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-sm">
            <span className="font-label-xs uppercase text-outline font-bold border-b border-border-subtle pb-1">
              Screening Dispatch Shortcuts
            </span>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/screening/new"
                className="w-full h-10 px-space-md rounded bg-surface-elevated hover:bg-surface-panel text-on-surface font-label-md flex items-center justify-between border border-border-strong uppercase transition-colors"
              >
                <span>Initiate New Passenger Intake</span>
                <span className="material-symbols-outlined text-[18px]">add</span>
              </Link>
              <Link
                href="/screening/queue"
                className="w-full h-10 px-space-md rounded bg-surface-elevated hover:bg-surface-panel text-on-surface font-label-md flex items-center justify-between border border-border-strong uppercase transition-colors"
              >
                <span>Inspect Queue Records ({cases.length})</span>
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
