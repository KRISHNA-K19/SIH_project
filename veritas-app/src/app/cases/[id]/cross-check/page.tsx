"use client";

import React from "react";
import { useVeritas } from "@/context/VeritasContext";
import { CrossCheckMatrix } from "@/components/case/CrossCheckMatrix";

export default function CaseCrossCheckPage() {
  const { activeCase } = useVeritas();

  if (!activeCase) return null;

  return (
    <div className="flex flex-col gap-space-lg w-full">
      <CrossCheckMatrix records={activeCase.crossChecks} />

      {/* Consular Database Query Summary */}
      <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-sm font-body-sm">
        <span className="font-label-xs uppercase text-outline font-bold border-b border-border-subtle pb-1">
          Government Integration Schemas (Simulation Mode)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-1 text-outline">
          <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex flex-col gap-1">
            <span className="font-label-xs text-on-surface uppercase font-bold">Inbound Flight Manifest (PNR)</span>
            <span className="text-[11px]">Flight: {activeCase.flight.number} · Checked Bags: 2 · Status: Boarded</span>
            <span className="text-status-success font-mono font-bold text-[11px]">NAME & DOB MATCH PASSPORT</span>
          </div>
          <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex flex-col gap-1">
            <span className="font-label-xs text-on-surface uppercase font-bold">Consular Visa Repository</span>
            <span className="text-[11px]">Visa Foil: VR-0914-US · Issuance: London · Category: B1/B2</span>
            <span className="text-status-critical font-mono font-bold text-[11px]">DOB MISMATCH: 14 APR 1998 (+1 YR)</span>
          </div>
          <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex flex-col gap-1">
            <span className="font-label-xs text-on-surface uppercase font-bold">Watchlist & Interpol SLTD</span>
            <span className="text-[11px]">National Security Watchlist · Red Notices · SLTD Query</span>
            <span className="text-status-success font-mono font-bold text-[11px]">CLEAR / NO RECORD FOUND</span>
          </div>
        </div>
      </div>
    </div>
  );
}
