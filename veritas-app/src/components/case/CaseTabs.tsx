"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const CASE_TABS = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "documents", label: "Documents", icon: "badge", badge: "2", alert: "neutral" },
  { id: "forensics", label: "Forensics", icon: "smb_share", badge: "1 Flag", alert: "critical" },
  { id: "identity", label: "Identity", icon: "face_retouching_natural", badge: "42.8%", alert: "warning" },
  { id: "cross-check", label: "Cross-Check", icon: "sync_problem", badge: "1 Conflict", alert: "critical" },
  { id: "evidence", label: "Evidence", icon: "inventory_2" },
  { id: "timeline", label: "Timeline", icon: "schedule" },
  { id: "review", label: "Review & Decision", icon: "gavel" },
];

export function CaseTabs({ caseId }: { caseId: string }) {
  const pathname = usePathname();

  return (
    <div className="bg-surface-workstation rounded-lg p-1.5 mb-space-lg flex items-center gap-1 overflow-x-auto shadow-md border border-border-subtle scrollbar-none">
      {CASE_TABS.map((tab) => {
        const isOverview = tab.id === "overview";
        const isActive =
          pathname === `/cases/${caseId}/${tab.id}` ||
          (isOverview && pathname === `/cases/${caseId}`);

        return (
          <Link
            key={tab.id}
            href={`/cases/${caseId}/${tab.id}`}
            className={`px-space-lg py-2 rounded font-label-lg text-label-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
              isActive
                ? "bg-surface-elevated text-primary border-b-2 border-status-info font-bold"
                : "text-on-surface-variant hover:bg-surface-elevated hover:text-on-surface"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                tab.alert === "critical"
                  ? "text-status-critical"
                  : tab.alert === "warning"
                  ? "text-status-warning"
                  : ""
              }`}
            >
              {tab.icon}
            </span>
            {tab.label}
            {tab.badge && (
              <span
                className={`font-label-xs px-1.5 py-0.5 rounded font-bold ${
                  tab.alert === "critical"
                    ? "bg-status-critical-bg text-status-critical border border-status-critical/30"
                    : tab.alert === "warning"
                    ? "bg-status-warning-bg text-status-warning border border-status-warning/30"
                    : "bg-surface-panel text-outline border border-border-subtle"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
