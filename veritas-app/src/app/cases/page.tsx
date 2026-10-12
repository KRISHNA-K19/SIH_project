"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useVeritas } from "@/context/VeritasContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CasesPage() {
  const { cases } = useVeritas();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.documentNumber.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || c.riskLevel === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-space-xl max-w-7xl mx-auto pb-space-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            Cases & Investigation Dossiers
          </h1>
          <p className="font-body-md text-outline">
            Comprehensive border investigation archive and active case records
          </p>
        </div>
        <Link href="/screening/new">
          <PrimaryButton icon="add">NEW INVESTIGATION CASE</PrimaryButton>
        </Link>
      </div>

      {/* Case Archive Container */}
      <div className="bg-surface-workstation rounded-lg border border-border-subtle shadow-md overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-space-md border-b border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-panel/50">
          <div className="relative flex items-center w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">search</span>
            <input
              className="bg-surface-base border border-border-subtle rounded text-on-surface placeholder:text-outline font-body-sm pl-8 pr-space-md py-1.5 w-full focus:outline-none focus:border-border-active transition-colors"
              placeholder="Search case records..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-base p-1 rounded border border-border-subtle">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
                  filter === level
                    ? "bg-surface-elevated text-on-surface font-bold"
                    : "text-outline hover:text-on-surface"
                }`}
                type="button"
              >
                {level === "ALL" ? "All Cases" : `${level} Risk`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredCases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-sm">
              <thead>
                <tr className="bg-surface-panel font-label-xs text-outline uppercase tracking-wider border-b border-border-subtle">
                  <th className="p-space-md font-semibold">Case Identifier</th>
                  <th className="p-space-md font-semibold">Subject Name</th>
                  <th className="p-space-md font-semibold">Nationality / Passport</th>
                  <th className="p-space-md font-semibold">Inbound Route</th>
                  <th className="p-space-md font-semibold">Threat Level</th>
                  <th className="p-space-md font-semibold">Status Recommendation</th>
                  <th className="p-space-md font-semibold text-right">Dossier Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-on-surface">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-panel transition-colors group">
                    <td className="p-space-md font-code-md text-forensic-cyan font-bold">
                      #{c.id}
                    </td>
                    <td className="p-space-md font-bold text-on-surface group-hover:text-primary transition-colors">
                      {c.subject.name}
                    </td>
                    <td className="p-space-md text-outline font-mono text-[12px]">
                      {c.subject.nationality} · #{c.subject.documentNumber}
                    </td>
                    <td className="p-space-md text-on-surface font-mono">
                      {c.flight.number} ({c.flight.route})
                    </td>
                    <td className="p-space-md">
                      <StatusBadge
                        status={c.riskLevel === "HIGH" ? "critical" : c.riskLevel === "MEDIUM" ? "warning" : "success"}
                        text={`${c.riskLevel} (${c.riskScore})`}
                      />
                    </td>
                    <td className="p-space-md text-outline text-[12px] max-w-xs truncate">
                      {c.decisionRecommendation}
                    </td>
                    <td className="p-space-md text-right">
                      <Link
                        href={`/cases/${c.id}/overview`}
                        className="inline-flex items-center gap-1.5 h-8 px-space-md rounded bg-surface-elevated hover:bg-status-info text-on-surface hover:text-white font-label-md uppercase tracking-wider font-semibold transition-all border border-border-strong hover:border-status-info"
                      >
                        Open Workspace
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="folder_off"
            title="No Matching Case Dossiers"
            description="No cases match your active filter."
            action={<SecondaryButton onClick={() => { setSearch(""); setFilter("ALL"); }}>RESET</SecondaryButton>}
          />
        )}
      </div>
    </div>
  );
}
