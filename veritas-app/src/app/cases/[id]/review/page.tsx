"use client";

import React, { useState } from "react";
import { useVeritas } from "@/context/VeritasContext";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { FormSelect, FormTextarea } from "@/components/ui/Inputs";
import { DecisionType } from "@/types/veritas";

export default function CaseReviewPage() {
  const { activeCase, submitDecision, officer } = useVeritas();
  const [decision, setDecision] = useState<DecisionType>("SECONDARY_REVIEW");
  const [statutoryCode, setStatutoryCode] = useState("ICAO-9303-SEC-2B (Biometric Non-Convergence)");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!activeCase) return null;

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
        caseId: activeCase.id,
        decision,
        officerBadge: officer.badge,
        officerName: officer.name,
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
        statutoryDirective: statutoryCode,
      });
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Existing Decision Record if already submitted */}
      {activeCase.decision && (
        <div className="bg-surface-workstation rounded-lg p-space-lg border border-status-info/40 shadow-xl flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-status-success text-[24px]">verified</span>
              <div>
                <h3 className="font-headline-md text-on-surface font-bold uppercase">
                  Officer Adjudication Recorded
                </h3>
                <span className="text-outline font-mono text-body-sm">
                  Logged at {activeCase.decision.timestamp}
                </span>
              </div>
            </div>
            <span className="bg-status-success-bg text-status-success font-label-xs font-bold px-2.5 py-1 rounded border border-status-success/30 uppercase">
              {activeCase.decision.decision}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md text-body-sm text-outline">
            <div>
              <span className="font-label-xs uppercase text-outline">Adjudicating Officer:</span>
              <p className="text-on-surface font-bold">{activeCase.decision.officerName} (#{activeCase.decision.officerBadge})</p>
            </div>
            <div>
              <span className="font-label-xs uppercase text-outline">Statutory Directive:</span>
              <p className="text-on-surface font-mono">{activeCase.decision.statutoryDirective}</p>
            </div>
            <div>
              <span className="font-label-xs uppercase text-outline">Action Disposition:</span>
              <p className="text-status-critical font-bold">{activeCase.decisionRecommendation}</p>
            </div>
          </div>

          <div className="p-space-md rounded bg-surface-panel border border-border-subtle">
            <span className="font-label-xs uppercase text-outline font-semibold">Officer Notes & Rationale:</span>
            <p className="font-body-md text-on-surface mt-1 leading-relaxed">{activeCase.decision.notes}</p>
          </div>
        </div>
      )}

      {/* Adjudication Workbench Form */}
      <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-xl flex flex-col gap-space-lg">
        <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-status-warning text-[24px]">gavel</span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase">
                {activeCase.decision ? "Update Officer Adjudication" : "Statutory Adjudication Workbench"}
              </h3>
              <p className="font-body-sm text-outline">
                Record official disposition under border management legal protocols
              </p>
            </div>
          </div>
          <span className="text-outline text-label-xs font-mono uppercase">
            STATION DELTA-01 · OFFICER #{officer.badge}
          </span>
        </div>

        {/* Legal Directive Callout */}
        <div className="p-space-md rounded bg-surface-panel border border-border-subtle flex items-start gap-space-sm text-outline font-body-sm">
          <span className="material-symbols-outlined text-forensic-cyan text-[20px] shrink-0 mt-0.5">policy</span>
          <div>
            <span className="text-on-surface font-semibold">Statutory Authority Notice: </span>
            AI-generated risk scores (82/100) and biometric non-convergence (42.8%) serve strictly as evidentiary telemetry. Legal clearance or referral authority is vested exclusively in the designated border officer.
          </div>
        </div>

        {isSuccess ? (
          <div className="py-space-xl flex flex-col items-center justify-center text-center gap-space-sm">
            <div className="w-12 h-12 rounded-full bg-status-success-bg text-status-success flex items-center justify-center border border-status-success/30">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h4 className="font-headline-lg text-on-surface font-bold">Adjudication Successfully Recorded</h4>
            <p className="font-body-sm text-outline">The case has been updated and the audit ledger has recorded your digital signature.</p>
            <SecondaryButton onClick={() => setIsSuccess(false)} className="mt-space-md">
              MODIFY OR APPEND NOTES
            </SecondaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <FormSelect
                label="Adjudication Determination"
                value={decision}
                onChange={(e) => setDecision(e.target.value as DecisionType)}
                options={[
                  { label: "REFER TO SECONDARY INSPECTION (Mandatory Physical Interview)", value: "SECONDARY_REVIEW" },
                  { label: "CLEAR FOR ENTRY (Officer Visual Override of Flag)", value: "CLEARED" },
                  { label: "REFUSE ENTRY (Imposter Presentation / Fraudulent Substrate)", value: "ENTRY_REFUSED" },
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
            </div>

            <FormTextarea
              label="Mandatory Officer Observations & Adjudication Rationale"
              placeholder="Record specific interview observations, explanation for overriding biometric alert if clearing, physical platen inspection notes, or referral instructions for secondary lane..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              error={error}
              rows={4}
              required
            />

            <div className="flex items-center justify-between border-t border-border-subtle pt-space-md">
              <div className="flex items-center gap-2 text-outline font-mono text-[12px]">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                DIGITAL SIGNATURE: {officer.name} · DELTA-01 CHECKPOINT
              </div>
              <PrimaryButton type="submit" disabled={isSubmitting} icon="gavel">
                {isSubmitting ? "RECORDING..." : "COMMIT OFFICIAL ADJUDICATION"}
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
