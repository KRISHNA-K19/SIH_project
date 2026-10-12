"use client";

import React, { useState } from "react";
import { CaseRecord, DecisionType } from "@/types/veritas";
import { Modal } from "@/components/ui/Modal";
import { FormSelect, FormTextarea } from "@/components/ui/Inputs";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { useVeritas } from "@/context/VeritasContext";

interface OfficerDecisionModalProps {
  caseData: CaseRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function OfficerDecisionModal({ caseData, isOpen, onClose }: OfficerDecisionModalProps) {
  const { submitDecision, officer } = useVeritas();
  const [decision, setDecision] = useState<DecisionType>("SECONDARY_REVIEW");
  const [statutoryCode, setStatutoryCode] = useState("ICAO-9303-SEC-2B (Biometric Non-Convergence)");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Statutory rationale and officer observation notes are mandatory.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await submitDecision({
        caseId: caseData.id,
        decision,
        officerBadge: officer.badge,
        officerName: officer.name,
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
        statutoryDirective: statutoryCode,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OFFICER STATUTORY ADJUDICATION GATE"
      subtitle={`Case #${caseData.id} · Subject: ${caseData.subject.name}`}
      icon="gavel"
      iconColor="text-status-warning"
      maxWidth="2xl"
    >
      {isSuccess ? (
        <div className="py-space-xl flex flex-col items-center justify-center text-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-status-success-bg text-status-success flex items-center justify-center border border-status-success/30">
            <span className="material-symbols-outlined text-[28px]">check_circle</span>
          </div>
          <h3 className="font-headline-lg text-on-surface font-bold">Decision Recorded</h3>
          <p className="font-body-md text-outline">
            Statutory disposition logged to the immutable governance audit trail.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
          {/* Statutory Notice */}
          <div className="p-space-md rounded bg-surface-panel border border-border-subtle flex items-start gap-space-sm text-outline font-body-sm">
            <span className="material-symbols-outlined text-forensic-cyan text-[20px] shrink-0 mt-0.5">verified_user</span>
            <div>
              <span className="text-on-surface font-semibold">Statutory Authority: </span>
              Under border clearance regulations, AI flags provide decision support. You are the credentialed authority determining clearance, secondary referral, or entry refusal.
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-space-md">
            <FormSelect
              label="Adjudication Determination"
              value={decision}
              onChange={(e) => setDecision(e.target.value as DecisionType)}
              options={[
                { label: "REFER TO SECONDARY INSPECTION (Mandatory Interview)", value: "SECONDARY_REVIEW" },
                { label: "CLEAR FOR ENTRY (Officer Override of Automated Flag)", value: "CLEARED" },
                { label: "REFUSE ENTRY (Imposter / Fraudulent Document)", value: "ENTRY_REFUSED" },
                { label: "ESCALATE TO WATCH COMMANDER", value: "ESCALATED" },
              ]}
            />

            <FormSelect
              label="Statutory Directive Code"
              value={statutoryCode}
              onChange={(e) => setStatutoryCode(e.target.value)}
              options={[
                { label: "ICAO-9303-SEC-2B (Biometric Non-Convergence)", value: "ICAO-9303-SEC-2B (Biometric Non-Convergence)" },
                { label: "ICAO-9303-SEC-4A (Physical Substrate Alteration)", value: "ICAO-9303-SEC-4A (Physical Substrate Alteration)" },
                { label: "INA-212-A-7 (Documentation Inconsistency / Date Mismatch)", value: "INA-212-A-7 (Documentation Inconsistency / Date Mismatch)" },
                { label: "CLEAR-101 (Officer Visual Verification Confirmed)", value: "CLEAR-101 (Officer Visual Verification Confirmed)" },
                { label: "INTERPOL-SLTD (Stolen/Lost Document Hit)", value: "INTERPOL-SLTD (Stolen/Lost Document Hit)" },
              ]}
            />

            <FormTextarea
              label="Officer Evidentiary Rationale & Notes"
              placeholder="State observed behavioral signals, platen inspection findings, physical interview conclusions, or justification for clearance/referral..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              error={error}
              rows={4}
              required
            />
          </div>

          {/* Credential Confirmation */}
          <div className="p-space-md bg-surface-elevated rounded border border-border-subtle flex items-center justify-between font-mono text-body-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[18px]">badge</span>
              <span className="text-outline">AUTHENTICATING OFFICER:</span>
              <span className="text-on-surface font-bold">{officer.name} (#{officer.badge})</span>
            </div>
            <span className="text-status-success font-semibold text-label-xs uppercase">HSM Token Verified</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-xs">
            <SecondaryButton onClick={onClose} disabled={isSubmitting}>
              CANCEL
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting} icon="gavel">
              {isSubmitting ? "SIGNING DISPOSITION..." : "RECORD STATUTORY DECISION"}
            </PrimaryButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
