"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { AuditLogEntry } from "@/types/veritas";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SecondaryButton } from "@/components/ui/Buttons";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const res = await apiService.getAuditLogs();
      setLogs(res);
      setLoading(false);
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.officerName.toLowerCase().includes(search.toLowerCase()) ||
      l.officerBadge.toLowerCase().includes(search.toLowerCase()) ||
      l.caseId.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || l.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="flex flex-col gap-space-xl max-w-7xl mx-auto pb-space-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            Governance & Audit Trail
          </h1>
          <p className="font-body-md text-outline">
            Immutable statutory event ledger · ICAO 9303 protocol compliance and officer accountability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton icon="download" onClick={() => alert("Audit log export generated.")}>
            EXPORT CSV LOG
          </SecondaryButton>
        </div>
      </div>

      {/* Audit Log Table Container */}
      <div className="bg-surface-workstation rounded-lg border border-border-subtle shadow-md overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-space-md border-b border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-panel/50">
          <div className="relative flex items-center w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">search</span>
            <input
              className="bg-surface-base border border-border-subtle rounded text-on-surface placeholder:text-outline font-body-sm pl-8 pr-space-md py-1.5 w-full focus:outline-none focus:border-border-active transition-colors"
              placeholder="Search audit trail..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-base p-1 rounded border border-border-subtle">
            {["ALL", "CRITICAL", "WARN", "INFO"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
                  severityFilter === sev
                    ? "bg-surface-elevated text-on-surface font-bold"
                    : "text-outline hover:text-on-surface"
                }`}
                type="button"
              >
                {sev === "ALL" ? "All Severity" : sev}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Fetching immutable audit events..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-sm">
              <thead>
                <tr className="bg-surface-panel font-label-xs text-outline uppercase tracking-wider border-b border-border-subtle">
                  <th className="p-space-md font-semibold">Audit Event ID / Timestamp</th>
                  <th className="p-space-md font-semibold">Actor / Officer</th>
                  <th className="p-space-md font-semibold">Action Trigger</th>
                  <th className="p-space-md font-semibold">Case Reference</th>
                  <th className="p-space-md font-semibold">Audit Details & Rationale</th>
                  <th className="p-space-md font-semibold text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-on-surface font-mono text-[12px]">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-panel transition-colors">
                    <td className="p-space-md">
                      <div className="flex flex-col">
                        <span className="text-forensic-cyan font-bold">{l.id}</span>
                        <span className="text-outline text-[11px] font-sans mt-0.5">{l.timestamp}</span>
                      </div>
                    </td>
                    <td className="p-space-md">
                      <div className="flex flex-col font-sans">
                        <span className="font-semibold text-on-surface">{l.officerName}</span>
                        <span className="text-outline text-[11px] font-mono">#{l.officerBadge} · {l.lane}</span>
                      </div>
                    </td>
                    <td className="p-space-md font-bold text-on-surface">
                      {l.action}
                    </td>
                    <td className="p-space-md">
                      {l.caseId.startsWith("VRS") ? (
                        <span className="text-primary font-bold">#{l.caseId}</span>
                      ) : (
                        <span className="text-outline">{l.caseId}</span>
                      )}
                    </td>
                    <td className="p-space-md font-sans text-on-surface-variant max-w-md">
                      {l.details}
                    </td>
                    <td className="p-space-md text-right">
                      <StatusBadge
                        status={l.severity === "CRITICAL" ? "critical" : l.severity === "WARN" ? "warning" : "info"}
                        text={l.severity}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-space-md bg-surface-panel/40 border-t border-border-subtle flex items-center justify-between text-outline text-label-xs font-mono">
          <span>SHA-256 LEDGER HASH: 91bfa3c...9801a · WORM STORAGE ACTIVE</span>
          <span>{filteredLogs.length} AUDIT RECORDS RENDERED</span>
        </div>
      </div>
    </div>
  );
}
