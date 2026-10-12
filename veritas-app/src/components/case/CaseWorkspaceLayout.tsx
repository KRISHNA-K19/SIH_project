"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CaseRecord } from "@/types/veritas";
import { CaseHeader } from "./CaseHeader";
import { CaseTabs } from "./CaseTabs";
import { useVeritas, ActiveCaseProvider } from "@/context/VeritasContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

interface CaseWorkspaceLayoutProps {
  caseId: string;
  initialCase?: CaseRecord | null;
  children: React.ReactNode;
}

export function CaseWorkspaceLayout({ caseId, initialCase, children }: CaseWorkspaceLayoutProps) {
  const { loadCase, activeCase, setActiveCase, setIsDecisionModalOpen } = useVeritas();
  const [currentCase, setCurrentCase] = useState<CaseRecord | null>(initialCase ?? null);
  const [loading, setLoading] = useState(initialCase === undefined);

  useEffect(() => {
    async function fetchCase() {
      if (initialCase !== undefined) {
        if (initialCase && (!activeCase || activeCase.id !== initialCase.id)) {
          setActiveCase(initialCase);
        }
        return;
      }
      if (activeCase && activeCase.id === caseId) {
        setCurrentCase(activeCase);
        setLoading(false);
        return;
      }
      setLoading(true);
      const c = await loadCase(caseId);
      if (c) {
        setCurrentCase(c);
        setActiveCase(c);
      }
      setLoading(false);
    }
    fetchCase();
  }, [caseId, initialCase, activeCase, loadCase, setActiveCase]);

  if (loading) {
    return <LoadingState message={`Retrieving case records for #${caseId}...`} />;
  }

  if (!currentCase) {
    return (
      <EmptyState
        icon="folder_off"
        title={`Case #${caseId} Not Found`}
        description="The requested screening case dossier does not exist in the local inspection registry or may have been purged."
        action={
          <Link
            href="/screening/queue"
            className="h-9 px-space-md rounded bg-status-info text-white font-label-md flex items-center gap-1 uppercase"
          >
            RETURN TO SCREENING QUEUE
          </Link>
        }
      />
    );
  }

  return (
    <ActiveCaseProvider value={currentCase}>
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-space-2xl">
        {/* CASE WORKSPACE CONTEXT BAR */}
        <CaseHeader data={currentCase} />

        {/* DEDICATED WORKSPACE TABS */}
        <CaseTabs caseId={currentCase.id} />

        {/* ACTIVE TAB CONTENT */}
        <div className="w-full">{children}</div>

        {/* BOTTOM OFFICER ACTION GATE (PERSISTENT WORKSPACE TOOLBAR) */}
        <div className="sticky bottom-4 z-30 mt-space-xl bg-surface-workstation rounded-lg p-space-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md border border-border-subtle">
          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded bg-status-warning-bg text-status-warning flex items-center justify-center shrink-0 border border-status-warning/30">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                Officer Action Gate Required
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Evidence threshold requires credentialed intervention before passenger release.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap w-full sm:w-auto justify-end">
            <Link
              href={`/cases/${currentCase.id}/forensics`}
              className="h-10 px-space-md bg-surface-elevated hover:bg-surface-panel text-on-surface font-label-lg text-label-lg rounded flex items-center gap-2 transition-colors border border-border-subtle"
            >
              <span className="material-symbols-outlined text-status-critical text-[18px]">smb_share</span>
              OPEN FORENSIC VIEWER
            </Link>

            <Link
              href={`/cases/${currentCase.id}/identity`}
              className="h-10 px-space-md bg-surface-elevated hover:bg-surface-panel text-on-surface font-label-lg text-label-lg rounded flex items-center gap-2 transition-colors border border-border-subtle"
            >
              <span className="material-symbols-outlined text-forensic-cyan text-[18px]">compare</span>
              OPEN BIOMETRIC COMPARATOR
            </Link>

            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="h-10 px-space-lg bg-status-info hover:bg-secondary-container text-white font-label-lg text-label-lg rounded font-semibold flex items-center gap-2 shadow-lg transition-colors uppercase tracking-wider"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              PROCEED TO OFFICER DECISION
            </button>
          </div>
        </div>
      </div>
    </ActiveCaseProvider>
  );
}
