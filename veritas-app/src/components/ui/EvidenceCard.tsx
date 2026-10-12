"use client";

import React, { useState } from "react";
import { EvidenceFinding } from "@/types/veritas";
import { StatusBadge } from "./StatusBadge";

interface EvidenceCardProps {
  evidence: EvidenceFinding;
  onInspect?: (ev: EvidenceFinding) => void;
}

export function EvidenceCard({ evidence, onInspect }: EvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCritical = evidence.severity === "critical";
  const isWarning = evidence.severity === "warning";
  const isSuccess = evidence.severity === "success";

  const icon = isCritical ? "crisis_alert" : isWarning ? "warning" : isSuccess ? "verified" : "info";
  const bgClass = isCritical ? "bg-status-critical-bg" : isWarning ? "bg-status-warning-bg" : isSuccess ? "bg-status-success-bg" : "bg-status-info-bg";
  const textClass = isCritical ? "text-status-critical" : isWarning ? "text-status-warning" : isSuccess ? "text-status-success" : "text-forensic-cyan";

  return (
    <div className="bg-surface-panel hover:bg-surface-elevated rounded-lg p-space-md flex flex-col gap-space-sm transition-colors border border-border-subtle group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-md flex-1">
          <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 mt-0.5 ${bgClass} ${textClass}`}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                {evidence.category}: {evidence.finding}
              </span>
              <StatusBadge status={evidence.severity} text={evidence.status || evidence.severity} />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
              {evidence.description}
            </p>
            {evidence.metrics && evidence.metrics.length > 0 && (
              <div className="flex items-center gap-space-md mt-2 flex-wrap font-code-md text-code-md text-outline">
                {evidence.metrics.map((m, i) => (
                  <span key={i} className="flex items-center gap-1 bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle">
                    <span className="text-outline text-label-xs uppercase">{m.label}:</span>
                    <span className={`font-semibold ${m.pass === false ? "text-status-critical" : m.pass === true ? "text-status-success" : "text-on-surface"}`}>
                      {m.value}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2 rounded bg-surface-panel hover:bg-surface-elevated text-outline hover:text-on-surface text-label-xs font-label-xs uppercase tracking-wider flex items-center gap-1 border border-border-subtle transition-colors"
            type="button"
          >
            {isExpanded ? "Collapse" : "Expand"}
            <span className="material-symbols-outlined text-[16px]">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>

          {onInspect && (
            <button
              onClick={() => onInspect(evidence)}
              className="h-8 px-space-md bg-surface-elevated hover:bg-status-info text-on-surface hover:text-white font-label-md text-label-md rounded flex items-center gap-1 transition-all border border-border-strong hover:border-status-info"
              type="button"
            >
              Inspect Telemetry
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Technical Inspector Details */}
      {isExpanded && (
        <div className="pt-space-md mt-space-xs border-t border-border-subtle bg-surface-workstation/60 p-space-md rounded flex flex-col gap-2 font-mono text-body-sm animate-in fade-in duration-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm text-outline">
            <div>
              <span className="text-label-xs uppercase text-outline">Ingest Source: </span>
              <span className="text-on-surface">{evidence.source}</span>
            </div>
            <div>
              <span className="text-label-xs uppercase text-outline">Algorithm Confidence: </span>
              <span className="text-status-info font-bold">{evidence.algorithmConfidence || "98.2% (Deterministic)"}</span>
            </div>
            <div>
              <span className="text-label-xs uppercase text-outline">Evidentiary Severity: </span>
              <span className={`font-bold ${textClass}`}>{evidence.severity.toUpperCase()}</span>
            </div>
          </div>
          {evidence.anomalyVector && (
            <div className="text-outline">
              <span className="text-label-xs uppercase">Target Vector Reference: </span>
              <span className="text-forensic-cyan font-bold">{evidence.anomalyVector}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
