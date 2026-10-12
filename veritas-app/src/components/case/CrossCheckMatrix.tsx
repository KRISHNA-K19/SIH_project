"use client";

import React from "react";
import { CrossCheckRecord } from "@/types/veritas";

interface CrossCheckMatrixProps {
  records: CrossCheckRecord[];
}

export function CrossCheckMatrix({ records }: CrossCheckMatrixProps) {
  return (
    <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-lg w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-forensic-cyan text-[20px]">sync_problem</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase">
              Cross-Document & Consular Registry Schema Correlation
            </h3>
            <p className="font-body-sm text-outline">
              Syntactic validation between primary travel document, electronic visa records, and flight manifest
            </p>
          </div>
        </div>
        <span className="font-label-xs text-label-xs bg-status-critical-bg text-status-critical px-2 py-0.5 rounded font-bold border border-status-critical/30">
          1 CHRONO CONFLICT
        </span>
      </div>

      {/* Discrepancy Highlight Banner */}
      <div className="p-space-md rounded bg-status-warning-bg border border-status-warning/40 flex items-start gap-space-md">
        <span className="material-symbols-outlined text-status-warning text-[24px] shrink-0 mt-0.5">calendar_clock</span>
        <div className="flex flex-col">
          <span className="font-label-md uppercase font-bold text-status-warning">
            Date of Birth Chronological Divergence (+1 Year Variance)
          </span>
          <p className="font-body-sm text-on-surface-variant mt-0.5">
            Passport document records birthdate as <strong className="text-on-surface font-mono font-bold">14 APR 1997</strong>, while US Consular Visa Foil schema repository registers birthdate as <strong className="text-status-critical font-mono font-bold">14 APR 1998</strong>. Discrepancy category: Schema Mismatch / Fraud Vector.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded border border-border-subtle overflow-hidden">
        <table className="w-full text-left font-body-sm border-collapse">
          <thead>
            <tr className="bg-surface-panel font-label-xs text-outline uppercase tracking-wider border-b border-border-subtle">
              <th className="p-space-md font-semibold">Verification Field</th>
              <th className="p-space-md font-semibold">Primary Value (Passport)</th>
              <th className="p-space-md font-semibold">Secondary Extract (Visa / PNR)</th>
              <th className="p-space-md font-semibold">Variance / Delta</th>
              <th className="p-space-md font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-on-surface">
            {records.map((r, i) => (
              <tr key={i} className="hover:bg-surface-panel transition-colors">
                <td className="p-space-md font-label-md font-semibold text-on-surface">
                  {r.field}
                </td>
                <td className="p-space-md font-mono text-[13px]">
                  <div className="flex flex-col">
                    <span>{r.primaryValue}</span>
                    <span className="text-[10px] text-outline font-sans">{r.primarySource}</span>
                  </div>
                </td>
                <td className="p-space-md font-mono text-[13px]">
                  <div className="flex flex-col">
                    <span className={r.status === "DISCREPANCY" ? "text-status-critical font-bold" : ""}>
                      {r.secondaryValue}
                    </span>
                    <span className="text-[10px] text-outline font-sans">{r.secondarySource}</span>
                  </div>
                </td>
                <td className="p-space-md font-mono text-[12px]">
                  {r.delta ? (
                    <span className="text-status-warning bg-status-warning-bg px-2 py-0.5 rounded border border-status-warning/30 font-bold">
                      {r.delta}
                    </span>
                  ) : (
                    <span className="text-outline">0</span>
                  )}
                </td>
                <td className="p-space-md text-right">
                  {r.status === "MATCH" ? (
                    <span className="inline-flex items-center gap-1 text-status-success font-label-xs font-bold uppercase">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      MATCH
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-status-critical font-label-xs font-bold uppercase">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      CONFLICT
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
