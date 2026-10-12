"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CaseRecord, OfficerDecision, AuditLogEntry, SystemHealthMetric, EvidenceFinding } from "@/types/veritas";
import { apiService } from "@/services/api";
import { FIXTURE_CASES } from "@/lib/fixtures/cases";

interface VeritasContextType {
  cases: CaseRecord[];
  activeCase: CaseRecord | null;
  setActiveCase: (c: CaseRecord | null) => void;
  loadCase: (id: string) => Promise<CaseRecord | null>;
  createCase: (newCase: Omit<CaseRecord, "id" | "createdAt" | "isDevFixture">) => Promise<CaseRecord>;
  submitDecision: (decision: OfficerDecision) => Promise<void>;
  
  // UI Dialog States
  selectedEvidence: EvidenceFinding | null;
  setSelectedEvidence: (ev: EvidenceFinding | null) => void;
  isDecisionModalOpen: boolean;
  setIsDecisionModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;

  // Search & Global State
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  officer: { name: string; badge: string; checkpoint: string; lane: string };
  
  // Refresh data
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const VeritasContext = createContext<VeritasContextType | undefined>(undefined);
const ActiveCaseContext = createContext<CaseRecord | null>(null);

export function ActiveCaseProvider({ value, children }: { value: CaseRecord | null; children: React.ReactNode }) {
  return <ActiveCaseContext.Provider value={value}>{children}</ActiveCaseContext.Provider>;
}

export function VeritasProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseRecord[]>(() => FIXTURE_CASES);
  const [activeCase, setActiveCase] = useState<CaseRecord | null>(() => FIXTURE_CASES[0] || null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceFinding | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const officer = {
    name: "Insp. S. Jenkins",
    badge: "VR-8842",
    checkpoint: "DELTA CHECKPOINT",
    lane: "DELTA-01 AIRSIDE",
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const allCases = await apiService.getCases();
      setCases(allCases);
      if (!activeCase && allCases.length > 0) {
        setActiveCase(allCases[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const loadCase = async (id: string): Promise<CaseRecord | null> => {
    const c = await apiService.getCaseById(id);
    if (c) {
      setActiveCase(c);
    }
    return c;
  };

  const createCase = async (newCase: Omit<CaseRecord, "id" | "createdAt" | "isDevFixture">): Promise<CaseRecord> => {
    const created = await apiService.createScreeningCase(newCase);
    await refreshData();
    setActiveCase(created);
    return created;
  };

  const submitDecision = async (decision: OfficerDecision): Promise<void> => {
    const updated = await apiService.recordOfficerDecision(decision);
    if (updated) {
      setActiveCase({ ...updated });
    }
    await refreshData();
    setIsDecisionModalOpen(false);
  };

  return (
    <VeritasContext.Provider
      value={{
        cases,
        activeCase,
        setActiveCase,
        loadCase,
        createCase,
        submitDecision,
        selectedEvidence,
        setSelectedEvidence,
        isDecisionModalOpen,
        setIsDecisionModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        globalSearch,
        setGlobalSearch,
        officer,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </VeritasContext.Provider>
  );
}

export function useVeritas() {
  const context = useContext(VeritasContext);
  const activeCaseFromLayout = useContext(ActiveCaseContext);
  if (!context) {
    throw new Error("useVeritas must be used within a VeritasProvider");
  }
  return {
    ...context,
    activeCase: activeCaseFromLayout || context.activeCase,
  };
}
