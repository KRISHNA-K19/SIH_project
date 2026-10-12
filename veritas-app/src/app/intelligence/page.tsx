"use client";

import React, { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";

interface IntelligenceRecord {
  id: string;
  targetName: string;
  aliases: string[];
  nationality: string;
  category: "INTERPOL RED NOTICE" | "WATCHLIST TIER 1" | "DOCUMENT FRAUD RING" | "MONITORING ADVISORY";
  status: "ACTIVE" | "DETAINED" | "EXPIRING";
  matchConfidence: string;
  associatedDocuments: string[];
  lastObserved: string;
  notes: string;
}

const MOCK_INTELLIGENCE: IntelligenceRecord[] = [
  {
    id: "INT-2026-9041",
    targetName: "CHANDRAKAAR, ROHAN",
    aliases: ["CHANDRAKAR, R.", "CHANDRA, ROHAN"],
    nationality: "GBR / IND",
    category: "DOCUMENT FRAUD RING",
    status: "ACTIVE",
    matchConfidence: "88.4%",
    associatedDocuments: ["UK Z4567123", "US VR-0914-US"],
    lastObserved: "Delta Checkpoint (Today)",
    notes: "Subject flagged for recurring passport bio-page tampering and alternate identity presentation across European hubs.",
  },
  {
    id: "INT-2026-8812",
    targetName: "OKONKWO, CHIDI",
    aliases: ["OKONKWO, CHARLES"],
    nationality: "NGA",
    category: "INTERPOL RED NOTICE",
    status: "DETAINED",
    matchConfidence: "99.2%",
    associatedDocuments: ["A0923412 (Interpol SLTD)"],
    lastObserved: "Delta Checkpoint Lane 4 (Today)",
    notes: "Stolen passport identity match. Subject detained following biometric mismatch and database flag.",
  },
  {
    id: "INT-2026-7731",
    targetName: "PETROV, VIKTOR",
    aliases: ["PETROV, V. A."],
    nationality: "BGR",
    category: "WATCHLIST TIER 1",
    status: "ACTIVE",
    matchConfidence: "92.0%",
    associatedDocuments: ["BG789123"],
    lastObserved: "Terminal 1 Arrivals (04 OCT 2026)",
    notes: "Associated with counterfeit visa sticker ring operating across Southeast Europe transit corridors.",
  },
];

export default function IntelligencePage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filteredRecords = MOCK_INTELLIGENCE.filter((rec) => {
    const matchesSearch =
      rec.targetName.toLowerCase().includes(search.toLowerCase()) ||
      rec.associatedDocuments.some((d) => d.toLowerCase().includes(search.toLowerCase())) ||
      rec.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "ALL" || rec.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-space-xl max-w-7xl mx-auto pb-space-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            Identity Intelligence & Watchlist
          </h1>
          <p className="font-body-md text-outline">
            Cross-border identity graphs, INTERPOL SLTD feeds, and fraudulent syndicate telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-xs bg-surface-panel border border-border-subtle text-forensic-cyan px-2 py-1 rounded font-mono font-bold">
            INTERPOL SLTD FEED: SYNCED
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-workstation rounded-lg border border-border-subtle shadow-md p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="relative flex items-center w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">search</span>
          <input
            className="bg-surface-base border border-border-subtle rounded text-on-surface placeholder:text-outline font-body-sm pl-8 pr-space-md py-1.5 w-full focus:outline-none focus:border-border-active transition-colors"
            placeholder="Search Intelligence database (Name, Alias, Document serial)..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-base p-1 rounded border border-border-subtle">
          {["ALL", "INTERPOL RED NOTICE", "DOCUMENT FRAUD RING", "WATCHLIST TIER 1"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
                categoryFilter === cat
                  ? "bg-surface-elevated text-on-surface font-bold"
                  : "text-outline hover:text-on-surface"
              }`}
              type="button"
            >
              {cat === "ALL" ? "All Targets" : cat.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Intelligence Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filteredRecords.map((target) => (
          <div
            key={target.id}
            className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle hover:border-status-info transition-colors shadow-md flex flex-col justify-between gap-space-md group"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-code-md text-forensic-cyan font-bold text-xs">
                  #{target.id}
                </span>
                <StatusBadge
                  status={target.category.includes("RED") ? "critical" : target.category.includes("FRAUD") ? "warning" : "info"}
                  text={target.category}
                />
              </div>

              <div>
                <h3 className="font-headline-md text-on-surface font-bold group-hover:text-primary transition-colors">
                  {target.targetName}
                </h3>
                <span className="text-outline text-body-sm font-mono">{target.nationality}</span>
              </div>

              {target.aliases.length > 0 && (
                <div className="text-outline text-body-sm">
                  <span className="text-label-xs uppercase font-semibold">Aliases: </span>
                  <span className="text-on-surface-variant font-mono">{target.aliases.join(", ")}</span>
                </div>
              )}

              <p className="font-body-sm text-on-surface-variant leading-relaxed bg-surface-panel p-2 rounded border border-border-subtle">
                {target.notes}
              </p>
            </div>

            <div className="pt-space-sm border-t border-border-subtle flex flex-col gap-1 text-[11px] font-mono text-outline">
              <div className="flex justify-between">
                <span>Associated Documents:</span>
                <span className="text-on-surface">{target.associatedDocuments.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Observed:</span>
                <span className="text-forensic-cyan">{target.lastObserved}</span>
              </div>
              <div className="flex justify-between">
                <span>Match Correlation:</span>
                <span className="text-status-warning font-bold">{target.matchConfidence}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphical Network Telemetry Note */}
      <div className="bg-surface-panel p-space-md rounded-lg border border-border-subtle flex items-start gap-space-sm font-body-sm text-outline">
        <span className="material-symbols-outlined text-forensic-cyan text-[20px] shrink-0 mt-0.5">hub</span>
        <div>
          <span className="text-on-surface font-semibold">Identity Relationship Graph Telemetry: </span>
          Links entities based on shared passport issuers, synchronized flight PNR booking groups, credit card payment fingerprints, and shared biometric landmark clusters across multi-jurisdiction border points.
        </div>
      </div>
    </div>
  );
}
