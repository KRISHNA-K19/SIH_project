"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { VeritasProvider, useVeritas } from "@/context/VeritasContext";
import { FixtureBanner } from "@/components/ui/FixtureBanner";
import { EvidenceModal } from "@/components/case/EvidenceModal";
import { OfficerDecisionModal } from "@/components/case/OfficerDecisionModal";
import { ExportBriefModal } from "@/components/case/ExportBriefModal";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const {
    activeCase,
    selectedEvidence,
    setSelectedEvidence,
    isDecisionModalOpen,
    setIsDecisionModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
  } = useVeritas();

  if (isLogin) {
    return <main className="w-full min-h-screen bg-surface-base">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-surface-base">
      <Sidebar />
      <div className="flex flex-col flex-1 pl-64 w-full">
        <TopHeader />
        <div className="pt-14">
          <FixtureBanner />
          <main className="relative w-full min-h-[calc(100vh-56px-28px)] bg-surface-base px-space-lg py-space-lg">
            {children}
          </main>
        </div>
      </div>

      {/* Global Interactive Modals */}
      {selectedEvidence && (
        <EvidenceModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}

      {activeCase && isDecisionModalOpen && (
        <OfficerDecisionModal
          caseData={activeCase}
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
        />
      )}

      {activeCase && isExportModalOpen && (
        <ExportBriefModal
          caseData={activeCase}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <VeritasProvider>
      <ShellContent>{children}</ShellContent>
    </VeritasProvider>
  );
}
