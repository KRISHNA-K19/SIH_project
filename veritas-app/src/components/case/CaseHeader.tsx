"use client";

import React from "react";
import { CaseRecord } from "@/types/veritas";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useVeritas } from "@/context/VeritasContext";

export function CaseHeader({ data }: { data: CaseRecord }) {
  const { setIsExportModalOpen } = useVeritas();

  const isHighRisk = data.riskLevel === "HIGH";

  return (
    <div className="bg-surface-workstation rounded-lg p-space-lg mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-xl border border-border-subtle">
      <div className="flex items-start md:items-center gap-space-lg">
        {/* Warning Icon Badge */}
        <div
          className={`w-12 h-12 rounded flex items-center justify-center shrink-0 ${
            isHighRisk
              ? "bg-status-critical-bg text-status-critical border border-status-critical/30"
              : data.riskLevel === "MEDIUM"
              ? "bg-status-warning-bg text-status-warning border border-status-warning/30"
              : "bg-status-success-bg text-status-success border border-status-success/30"
          }`}
        >
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isHighRisk ? "warning" : data.riskLevel === "MEDIUM" ? "help" : "verified_user"}
          </span>
        </div>

        {/* Case Metadata & Subject Identification */}
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="font-code-md text-code-md text-forensic-cyan tracking-wider font-semibold">
              CASE #{data.id}
            </span>
            <StatusBadge
              status={isHighRisk ? "critical" : data.riskLevel === "MEDIUM" ? "warning" : "success"}
              text={`${data.riskLevel} RISK · ${data.riskScore}/100`}
            />
            {data.decisionRecommendation && (
              <StatusBadge
                status={isHighRisk ? "warning" : "info"}
                text={data.decisionRecommendation}
              />
            )}
          </div>
          <div className="flex items-baseline gap-space-md mt-1 flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              {data.subject.name}
            </h1>
            <span className="font-body-sm text-body-sm text-outline">
              DOB: {data.subject.dob} · {data.subject.nationality} · PASSPORT: #{data.subject.documentNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Officer assignment & Export dossier */}
      <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0">
        <div className="bg-surface-elevated px-space-md py-1.5 rounded flex items-center gap-space-md border border-border-subtle">
          <div className="flex flex-col text-right">
            <span className="font-label-xs text-label-xs text-outline uppercase">Assigned Officer</span>
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">Insp. S. Jenkins</span>
          </div>
          <div className="w-8 h-8 rounded bg-status-info-bg text-forensic-cyan flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="h-9 px-space-md bg-surface-elevated hover:bg-surface-panel text-on-surface font-label-md text-label-md rounded flex items-center gap-1.5 transition-colors border border-border-subtle"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          EXPORT BRIEF
        </button>
      </div>
    </div>
  );
}
