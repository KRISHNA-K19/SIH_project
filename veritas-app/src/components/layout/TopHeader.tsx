"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useVeritas } from "@/context/VeritasContext";

export function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { globalSearch, setGlobalSearch, cases } = useVeritas();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState("06 OCT 2026 · 08:42 UTC");

  useEffect(() => {
    // Keep a stable UTC time format
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toUTCString().split(" ").slice(1, 4).join(" ").toUpperCase();
      const timePart = now.toTimeString().substring(0, 5);
      setCurrentTime(`${datePart} · ${timePart} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (pathname === "/login") return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/screening/queue?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const highRiskCount = cases.filter((c) => c.riskLevel === "HIGH").length;

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-surface-workstation border-b border-border-subtle z-40 px-space-lg flex items-center justify-between">
      {/* Left Checkpoint Telemetry */}
      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-outline text-[18px]">location_searching</span>
          <span className="font-label-md text-label-md text-outline uppercase tracking-wider">Checkpoint:</span>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold uppercase">DELTA CHECKPOINT</span>
        </div>
        <div className="h-4 w-px bg-border-subtle"></div>
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
          <span className="font-code-md text-code-md text-on-surface-variant font-mono">
            {currentTime}
          </span>
        </div>
        <div className="h-4 w-px bg-border-subtle"></div>
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
          <span className="font-label-xs text-label-xs uppercase font-bold text-status-success tracking-wider">
            Operational
          </span>
        </div>
      </div>

      {/* Right Utility: Search, Alerts, Officer Avatar */}
      <div className="flex items-center gap-space-md">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px]">search</span>
          <input
            className="bg-surface-panel border border-border-subtle rounded text-on-surface placeholder:text-outline font-body-sm pl-8 pr-space-md py-1.5 w-64 focus:outline-none focus:border-border-active transition-colors"
            placeholder="Quick search (Case ID, passport...)"
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </form>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded border border-border-subtle bg-surface-panel flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors relative"
            type="button"
            title="Operational Notifications"
            aria-label="Operational Notifications"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            {highRiskCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-critical"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-workstation border border-border-strong rounded-lg shadow-2xl p-space-md flex flex-col gap-space-sm z-50">
              <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                <span className="font-label-md text-on-surface uppercase font-bold">Priority Alerts</span>
                <span className="text-[10px] text-outline uppercase font-mono">{highRiskCount} Unresolved</span>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {cases
                  .filter((c) => c.riskLevel === "HIGH")
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setShowNotifications(false);
                        router.push(`/cases/${c.id}/overview`);
                      }}
                      className="p-2 rounded bg-surface-panel hover:bg-surface-elevated border border-status-critical/30 cursor-pointer transition-colors flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-code-md text-status-critical text-[11px] font-bold">
                          #{c.id}
                        </span>
                        <span className="text-status-critical text-[10px] font-bold">
                          RISK {c.riskScore}
                        </span>
                      </div>
                      <span className="font-bold text-[12px] text-on-surface">{c.subject.name}</span>
                      <span className="text-[11px] text-outline">{c.decisionRecommendation}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-border-subtle"></div>

        {/* Officer Avatar Badge */}
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-status-info flex items-center justify-center text-white font-bold text-label-xs">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
}
