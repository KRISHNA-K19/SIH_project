"use client";

import React, { useState } from "react";
import { CaseRecord } from "@/types/veritas";
import { Modal } from "@/components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";

interface ExportBriefModalProps {
  caseData: CaseRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportBriefModal({ caseData, isOpen, onClose }: ExportBriefModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="EXPORT TACTICAL SCREENING DOSSIER"
      subtitle={`Evidentiary Summary · Case #${caseData.id}`}
      icon="print"
      maxWidth="xl"
      footer={
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={handlePrint} icon="print">
            PRINT DOSSIER
          </SecondaryButton>
          <PrimaryButton onClick={handleDownload} icon="download">
            {downloaded ? "DOSSIER GENERATED" : "DOWNLOAD PDF"}
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-space-md font-mono text-body-sm text-on-surface">
        <div className="p-space-md bg-surface-panel rounded border border-border-subtle flex flex-col gap-1">
          <div className="flex items-center justify-between border-b border-border-subtle pb-1">
            <span className="font-bold text-forensic-cyan">VERITAS FORENSIC DOSSIER</span>
            <span className="text-outline text-label-xs">CLASSIFICATION: LAW ENFORCEMENT SENSITIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-outline">
            <div>CASE ID: <span className="text-on-surface font-semibold">{caseData.id}</span></div>
            <div>STATUS: <span className="text-status-critical font-semibold">{caseData.decisionRecommendation}</span></div>
            <div>SUBJECT: <span className="text-on-surface font-semibold">{caseData.subject.name}</span></div>
            <div>NATIONALITY: <span className="text-on-surface">{caseData.subject.nationality}</span></div>
            <div>FLIGHT: <span className="text-on-surface">{caseData.flight.number} ({caseData.flight.route})</span></div>
            <div>COMPOSITE RISK: <span className="text-status-critical font-bold">{caseData.riskScore} / 100</span></div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-label-xs uppercase text-outline font-bold">KEY PRIMARY ANOMALIES</span>
          {caseData.evidence.map((ev, i) => (
            <div key={i} className="p-2 bg-surface-elevated rounded border border-border-subtle flex items-start gap-2">
              <span className="text-status-critical font-bold">[{ev.severity.toUpperCase()}]</span>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface">{ev.category}: {ev.finding}</span>
                <span className="text-outline text-body-xs">{ev.description}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-space-md bg-surface-panel rounded border border-border-subtle text-[11px] text-outline">
          DIGITAL INTEGRITY SEAL: SHA-256 (b8a2e4...91c0) · GENERATED UNDER ICAO 9303 PROTOCOL
        </div>
      </div>
    </Modal>
  );
}
