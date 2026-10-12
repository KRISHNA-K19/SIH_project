"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVeritas } from "@/context/VeritasContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

function ScreeningQueueContent() {
  const { cases } = useVeritas();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialQuery);
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"risk_desc" | "risk_asc" | "time_desc">("risk_desc");

  const filteredCases = useMemo(() => {
    let result = [...cases];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.subject.name.toLowerCase().includes(q) ||
          c.subject.nationality.toLowerCase().includes(q) ||
          c.subject.documentNumber.toLowerCase().includes(q) ||
          c.flight.number.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== "ALL") {
      result = result.filter((c) => c.riskLevel === riskFilter);
    }

    if (sortBy === "risk_desc") {
      result.sort((a, b) => b.riskScore - a.riskScore);
    } else if (sortBy === "risk_asc") {
      result.sort((a, b) => a.riskScore - b.riskScore);
    } else if (sortBy === "time_desc") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [cases, search, riskFilter, sortBy]);

  return (
    <div className="flex flex-col gap-space-xl max-w-7xl mx-auto pb-space-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            Screening Queue
          </h1>
          <p className="font-body-md text-outline">
            Active checkpoint intake queue and priority referral docket
          </p>
        </div>
        <Link href="/screening/new">
          <PrimaryButton icon="add">NEW SCREENING</PrimaryButton>
        </Link>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-surface-workstation rounded-lg border border-border-subtle shadow-md overflow-hidden">
        <div className="p-space-md border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-panel/50">
          {/* Search Box */}
          <div className="relative flex items-center flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">search</span>
            <input
              className="bg-surface-base border border-border-subtle rounded text-on-surface placeholder:text-outline font-body-sm pl-8 pr-space-md py-1.5 w-full focus:outline-none focus:border-border-active transition-colors"
              placeholder="Search by Case ID, Passenger Name, Passport, Flight..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 text-outline hover:text-on-surface text-xs"
                type="button"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills and Sort */}
          <div className="flex items-center gap-space-md flex-wrap">
            {/* Risk Filter */}
            <div className="flex items-center gap-1 bg-surface-base p-1 rounded border border-border-subtle">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(level)}
                  className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
                    riskFilter === level
                      ? "bg-surface-elevated text-on-surface font-bold"
                      : "text-outline hover:text-on-surface"
                  }`}
                  type="button"
                >
                  {level === "ALL" ? "All Risks" : level}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-base border border-border-subtle rounded text-on-surface font-label-xs uppercase py-1.5 px-2 focus:outline-none"
            >
              <option value="risk_desc">Sort: Highest Threat</option>
              <option value="risk_asc">Sort: Lowest Threat</option>
              <option value="time_desc">Sort: Most Recent</option>
            </select>
          </div>
        </div>

        {/* High-Density Data Table */}
        {filteredCases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-sm">
              <thead>
                <tr className="bg-surface-panel font-label-xs text-outline uppercase tracking-wider border-b border-border-subtle select-none">
                  <th className="p-space-md font-semibold">Case ID / Intake Time</th>
                  <th className="p-space-md font-semibold">Traveler / Nationality</th>
                  <th className="p-space-md font-semibold">Flight / Seat / Lane</th>
                  <th className="p-space-md font-semibold">Threat Assessment</th>
                  <th className="p-space-md font-semibold">Statutory Status</th>
                  <th className="p-space-md font-semibold text-right">Workspace Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-on-surface">
                {filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-panel transition-colors group"
                  >
                    <td className="p-space-md">
                      <div className="flex flex-col">
                        <span className="font-code-md text-forensic-cyan font-bold">
                          #{c.id}
                        </span>
                        <span className="text-outline text-label-xs font-mono mt-0.5">
                          {c.createdAt.substring(11, 19)} UTC
                        </span>
                      </div>
                    </td>
                    <td className="p-space-md">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                          {c.subject.name}
                        </span>
                        <span className="text-outline text-[11px] font-mono">
                          {c.subject.nationality} · #{c.subject.documentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="p-space-md">
                      <div className="flex flex-col">
                        <span className="font-mono text-on-surface font-semibold">{c.flight.number}</span>
                        <span className="text-outline text-[11px]">{c.lane}</span>
                      </div>
                    </td>
                    <td className="p-space-md">
                      <StatusBadge
                        status={
                          c.riskLevel === "HIGH"
                            ? "critical"
                            : c.riskLevel === "MEDIUM"
                            ? "warning"
                            : "success"
                        }
                        text={`${c.riskLevel} (${c.riskScore}/100)`}
                      />
                    </td>
                    <td className="p-space-md">
                      <span className="text-outline text-[12px] font-medium leading-tight block max-w-xs">
                        {c.decisionRecommendation}
                      </span>
                    </td>
                    <td className="p-space-md text-right">
                      <Link
                        href={`/cases/${c.id}/overview`}
                        className="inline-flex items-center gap-1.5 h-8 px-space-md rounded bg-surface-elevated hover:bg-status-info text-on-surface hover:text-white font-label-md uppercase tracking-wider font-semibold transition-all border border-border-strong hover:border-status-info"
                      >
                        Inspect Dossier
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
            icon="search_off"
            title="No Matching Screening Records"
            description={`No screening records matched your query "${search}" with risk filter "${riskFilter}".`}
            action={
              <SecondaryButton
                onClick={() => {
                  setSearch("");
                  setRiskFilter("ALL");
                }}
              >
                RESET FILTERS
              </SecondaryButton>
            }
          />
        )}

        {/* Table Footer Count */}
        <div className="p-space-md bg-surface-panel/40 border-t border-border-subtle flex items-center justify-between text-outline text-label-xs font-mono">
          <span>SHOWING {filteredCases.length} OF {cases.length} REGISTERED CASES</span>
          <span>CHECKPOINT DELTA-01</span>
        </div>
      </div>
    </div>
  );
}

export default function ScreeningQueuePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading screening queue..." />}>
      <ScreeningQueueContent />
    </Suspense>
  );
}
