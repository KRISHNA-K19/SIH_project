"use client";

import React from "react";
import { EvidenceFinding } from "@/types/veritas";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SecondaryButton } from "@/components/ui/Buttons";

interface EvidenceModalProps {
  evidence: EvidenceFinding | null;
  onClose: () => void;
}

export function EvidenceModal({ evidence, onClose }: EvidenceModalProps) {
  if (!evidence) return null;

  return (
    <Modal
      isOpen={!!evidence}
      onClose={onClose}
      title={`EVIDENCE TELEMETRY: ${evidence.category}`}
      subtitle={`Source: ${evidence.source} · Finding Ref: #${evidence.id.toUpperCase()}`}
      icon="biotech"
      maxWidth="2xl"
      footer={
        <SecondaryButton onClick={onClose} icon="check">
          DISMISS TELEMETRY DOCK
        </SecondaryButton>
      }
    >
      <div className="flex flex-col gap-space-lg">
        {/* Finding Overview */}
        <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {evidence.finding}
            </span>
            <StatusBadge status={evidence.severity} text={evidence.status || evidence.severity} />
          </div>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            {evidence.description}
          </p>
        </div>

        {/* Forensic Telemetry Matrix */}
        <div className="flex flex-col gap-2">
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
            Extracted Sensor & Model Telemetry
          </span>
          <div className="grid grid-cols-2 gap-space-sm">
            {evidence.metrics?.map((m, i) => (
              <div key={i} className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col">
                <span className="font-label-xs text-outline uppercase">{m.label}</span>
                <span className={`font-headline-md font-mono mt-1 ${m.pass === false ? "text-status-critical font-bold" : m.pass === true ? "text-status-success font-bold" : "text-on-surface font-semibold"}`}>
                  {m.value}
                </span>
              </div>
            ))}
            <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col">
              <span className="font-label-xs text-outline uppercase">Algorithm Model</span>
              <span className="font-headline-md font-mono mt-1 text-forensic-cyan font-semibold">
                {evidence.algorithmConfidence ? `Confidence: ${evidence.algorithmConfidence}` : "ICAO 9303 Compliant"}
              </span>
            </div>
            <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col">
              <span className="font-label-xs text-outline uppercase">Sensor Hardware</span>
              <span className="font-headline-md font-mono mt-1 text-on-surface font-semibold">
                {evidence.source}
              </span>
            </div>
          </div>
        </div>

        {/* Statutory Integrity Note */}
        <div className="p-space-md rounded bg-surface-elevated border border-border-subtle flex items-start gap-space-sm text-outline font-body-sm">
          <span className="material-symbols-outlined text-status-warning text-[18px] shrink-0 mt-0.5">policy</span>
          <div>
            <span className="text-on-surface font-semibold">Statutory Evidentiary Chain: </span>
            This telemetry was generated during automated intake and cryptographic platen scan. All raw optical rasters and biometric vector distance calculations are preserved in the immutable governance audit ledger.
          </div>
        </div>
      </div>
    </Modal>
  );
}
