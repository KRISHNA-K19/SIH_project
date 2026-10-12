"use client";

import React from "react";
import { BiometricTelemetry } from "@/types/veritas";

interface BiometricComparisonProps {
  biometrics: BiometricTelemetry;
}

export function BiometricComparison({ biometrics }: BiometricComparisonProps) {
  const isMatch = biometrics.similarityScore >= biometrics.thresholdRequired;

  return (
    <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-xl flex flex-col gap-space-lg w-full">
      {/* Biometric Header Bar */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-forensic-cyan text-[22px]">face</span>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold uppercase">
              Facial Landmark Vector Alignment & Liveness
            </h2>
            <p className="font-body-sm text-outline">
              ICAO Doc 9303 DG2 Digital Reference vs. 4K Kiosk Optical Capture
            </p>
          </div>
        </div>
        <span
          className={`font-label-xs text-label-xs px-2 py-0.5 rounded font-bold uppercase ${
            isMatch
              ? "bg-status-success-bg text-status-success border border-status-success/30"
              : "bg-status-critical-bg text-status-critical border border-status-critical/30"
          }`}
        >
          {biometrics.comparisonStatus}
        </span>
      </div>

      {/* Main Side-by-Side Face Dock with Central Telemetry Bridge */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-space-lg items-center">
        {/* Specimen 1: Passport Chip Baseline Photo (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center gap-space-xs">
          <div className="w-full max-w-[280px] aspect-square rounded bg-[#07090E] border border-border-strong relative overflow-hidden group">
            {/* 4-Corner Targeting Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-forensic-cyan pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-forensic-cyan pointer-events-none" />
            <div className="absolute bottom-8 left-2 w-3 h-3 border-b-2 border-l-2 border-forensic-cyan pointer-events-none" />
            <div className="absolute bottom-8 right-2 w-3 h-3 border-b-2 border-r-2 border-forensic-cyan pointer-events-none" />

            <img
              src={biometrics.passportPhotoUrl}
              alt="Passport Chip Baseline"
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-0 inset-x-0 bg-surface-panel/90 backdrop-blur-sm p-1.5 text-center border-t border-border-subtle">
              <span className="font-label-xs text-label-xs uppercase text-outline tracking-wider font-semibold">
                E-Passport Chip Baseline (DG2)
              </span>
            </div>
          </div>
          <span className="text-outline text-label-xs font-mono">ENCODING: JPEG2000 (ICAO 9303)</span>
        </div>

        {/* Central Telemetry Bridge (1 col) */}
        <div className="md:col-span-1 flex flex-col items-center justify-center my-4 md:my-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-headline-md border ${
              isMatch
                ? "bg-status-success-bg text-status-success border-status-success/40"
                : "bg-status-critical-bg text-status-critical border-status-critical/40"
            }`}
          >
            {isMatch ? "≈" : "≠"}
          </div>
          <span className="font-display-lg text-[22px] font-bold mt-1 text-on-surface">
            {biometrics.similarityScore}%
          </span>
          <span className="font-label-xs text-[10px] text-outline uppercase">Match</span>
        </div>

        {/* Specimen 2: Live Kiosk Sensor Optical Ingest (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center gap-space-xs">
          <div className="w-full max-w-[280px] aspect-square rounded bg-[#07090E] border border-border-strong relative overflow-hidden group">
            {/* 4-Corner Targeting Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-forensic-cyan pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-forensic-cyan pointer-events-none" />
            <div className="absolute bottom-8 left-2 w-3 h-3 border-b-2 border-forensic-cyan pointer-events-none" />
            <div className="absolute bottom-8 right-2 w-3 h-3 border-b-2 border-forensic-cyan pointer-events-none" />

            <img
              src={biometrics.livePhotoUrl}
              alt="Live Kiosk Optical Ingest"
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-0 inset-x-0 bg-surface-panel/90 backdrop-blur-sm p-1.5 text-center border-t border-border-subtle">
              <span className="font-label-xs text-label-xs uppercase text-forensic-cyan tracking-wider font-semibold">
                Live Sensor Ingest (Delta-01)
              </span>
            </div>
          </div>
          <span className="text-outline text-label-xs font-mono">SENSOR: 4K RGB + INFRARED DEPTH</span>
        </div>
      </div>

      {/* Advisory & Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
        <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col">
          <span className="font-label-xs uppercase text-outline">Similarity Score</span>
          <span className={`font-headline-lg font-bold mt-1 ${isMatch ? "text-status-success" : "text-status-critical"}`}>
            {biometrics.similarityScore}%
          </span>
          <span className="font-body-sm text-outline mt-0.5">Threshold: ≥ {biometrics.thresholdRequired}%</span>
        </div>

        <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col">
          <span className="font-label-xs uppercase text-outline">Delta Distance</span>
          <span className={`font-headline-lg font-bold mt-1 ${isMatch ? "text-status-success" : "text-status-critical"}`}>
            {biometrics.deltaDistance}
          </span>
          <span className="font-body-sm text-outline mt-0.5">Max Permitted: ≤ 0.350</span>
        </div>

        <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col">
          <span className="font-label-xs uppercase text-outline">Anti-Spoofing / PAD</span>
          <span className="font-headline-lg font-bold mt-1 text-status-success">
            {biometrics.antiSpoofConfidence}%
          </span>
          <span className="font-body-sm text-outline mt-0.5">ISO/IEC 30107-3 Liveness Pass</span>
        </div>

        <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col">
          <span className="font-label-xs uppercase text-outline">Facial Mesh Nodes</span>
          <span className="font-headline-lg font-bold mt-1 text-forensic-cyan">
            {biometrics.facialMeshPoints} Nodes
          </span>
          <span className="font-body-sm text-outline mt-0.5">Convergence Tested</span>
        </div>
      </div>

      {/* Advisory Directive */}
      <div
        className={`p-space-md rounded border flex items-start gap-space-sm font-body-sm ${
          isMatch
            ? "bg-status-success-bg border-status-success/30 text-on-surface"
            : "bg-status-critical-bg border-status-critical/30 text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
            isMatch ? "text-status-success" : "text-status-critical"
          }`}
        >
          {isMatch ? "verified" : "warning"}
        </span>
        <div className="flex flex-col">
          <span
            className={`font-label-md uppercase font-bold ${
              isMatch ? "text-status-success" : "text-status-critical"
            }`}
          >
            {isMatch ? "BIOMETRIC MATCH VERIFIED" : "LOW SIMILARITY - SECONDARY VERIFICATION REQUIRED"}
          </span>
          <p className="text-on-surface-variant mt-0.5">{biometrics.advisoryNote}</p>
        </div>
      </div>
    </div>
  );
}
