"use client";

import React from "react";
import Link from "next/link";
import { useVeritas } from "@/context/VeritasContext";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function Overview() {
  const { cases } = useVeritas();

  const highRiskCount = cases.filter((c) => c.riskLevel === "HIGH").length;
  const mediumRiskCount = cases.filter((c) => c.riskLevel === "MEDIUM").length;
  const clearedCount = cases.filter((c) => c.riskLevel === "LOW").length;

  return (
    <div className="flex flex-col gap-space-xl max-w-7xl mx-auto pb-space-2xl">
      {/* Page Title & Shift Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            Operations Overview
          </h1>
          <p className="font-body-md text-outline">
            Delta Checkpoint Workstation · Active Shift: Insp. S. Jenkins (#VR-8842)
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <Link href="/screening/queue">
            <SecondaryButton icon="hourglass_empty">VIEW QUEUE</SecondaryButton>
          </Link>
          <Link href="/screening/new">
            <PrimaryButton icon="add">START SCREENING</PrimaryButton>
          </Link>
        </div>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <MetricCard
          title="Active Intake"
          value={cases.length.toString()}
          icon="radar"
          color="text-forensic-cyan"
          subtitle="Screening cases in local dock"
        />
        <MetricCard
          title="Secondary Review"
          value={mediumRiskCount.toString()}
          icon="warning"
          color="text-status-warning"
          alert={mediumRiskCount > 0}
          subtitle="Mandatory officer inquiry"
        />
        <MetricCard
          title="High Risk Flags"
          value={highRiskCount.toString()}
          icon="crisis_alert"
          color="text-status-critical"
          alert={highRiskCount > 0}
          subtitle="Tampering / Anomaly threshold"
        />
        <MetricCard
          title="Cleared Cases"
          value={(clearedCount + 140).toString()}
          icon="verified"
          color="text-status-success"
          subtitle="Cryptographic & Biometric pass"
        />
      </div>

      {/* Live Checkpoint Lanes Grid */}
      <div className="bg-surface-workstation rounded-lg p-space-lg shadow-md border border-border-subtle flex flex-col gap-space-md">
        <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-forensic-cyan text-[20px]">lan</span>
            <span className="font-headline-md text-on-surface font-bold uppercase">
              Live Terminal 4 Screening Lanes Status
            </span>
          </div>
          <span className="font-label-xs text-status-success font-bold uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> All Sensors Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <LaneTile
            lane="LANE 01 (AIRSIDE)"
            caseId="VRS-2026-001824"
            subject="CHANDRAKAAR, R."
            status="CRITICAL ANOMALY"
            riskScore={82}
            badgeColor="critical"
          />
          <LaneTile
            lane="LANE 02 (DIPLOMATIC)"
            caseId="VRS-2026-001825"
            subject="AL-MANSOOR, T."
            status="SECONDARY ADVISORY"
            riskScore={54}
            badgeColor="warning"
          />
          <LaneTile
            lane="LANE 03 (E-GATE)"
            caseId="VRS-2026-001826"
            subject="LINDQVIST, E."
            status="CLEARED PASS"
            riskScore={12}
            badgeColor="success"
          />
          <LaneTile
            lane="LANE 04 (PRIMARY)"
            caseId="VRS-2026-001827"
            subject="OKONKWO, C."
            status="INTERPOL SLTD HIT"
            riskScore={89}
            badgeColor="critical"
          />
        </div>
      </div>

      {/* Recent Screening Queue Dossiers */}
      <div className="bg-surface-workstation rounded-lg p-space-lg shadow-md border border-border-subtle flex flex-col gap-space-md">
        <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-forensic-cyan text-[20px]">folder_shared</span>
            <span className="font-headline-md text-on-surface font-bold uppercase">
              Recent Inspection Intake Records
            </span>
          </div>
          <Link
            href="/screening/queue"
            className="text-primary hover:text-secondary font-label-md uppercase tracking-wider flex items-center gap-1"
          >
            Full Queue <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="rounded border border-border-subtle overflow-hidden">
          <table className="w-full text-left font-body-sm border-collapse">
            <thead>
              <tr className="bg-surface-panel font-label-xs text-outline uppercase tracking-wider border-b border-border-subtle">
                <th className="p-space-md font-semibold">Case ID / Created</th>
                <th className="p-space-md font-semibold">Subject Name & Nationality</th>
                <th className="p-space-md font-semibold">Flight / Lane</th>
                <th className="p-space-md font-semibold">Threat Assessment</th>
                <th className="p-space-md font-semibold">Status / Directive</th>
                <th className="p-space-md font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {cases.slice(0, 4).map((c) => (
                <tr key={c.id} className="hover:bg-surface-panel transition-colors">
                  <td className="p-space-md">
                    <div className="flex flex-col">
                      <span className="font-code-md text-forensic-cyan font-bold">{c.id}</span>
                      <span className="text-outline text-label-xs font-mono">{c.createdAt.substring(11, 19)} UTC</span>
                    </div>
                  </td>
                  <td className="p-space-md">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">{c.subject.name}</span>
                      <span className="text-outline text-[11px]">{c.subject.nationality}</span>
                    </div>
                  </td>
                  <td className="p-space-md">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-mono">{c.flight.number}</span>
                      <span className="text-outline text-[11px]">{c.lane}</span>
                    </div>
                  </td>
                  <td className="p-space-md">
                    <StatusBadge
                      status={c.riskLevel === "HIGH" ? "critical" : c.riskLevel === "MEDIUM" ? "warning" : "success"}
                      text={`${c.riskLevel} (${c.riskScore})`}
                    />
                  </td>
                  <td className="p-space-md">
                    <span className="text-outline text-[12px]">{c.decisionRecommendation}</span>
                  </td>
                  <td className="p-space-md text-right">
                    <Link
                      href={`/cases/${c.id}/overview`}
                      className="inline-flex items-center gap-1 text-primary hover:text-secondary font-label-md uppercase tracking-wider font-semibold"
                    >
                      Inspect <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
  alert,
  subtitle,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
  alert?: boolean;
  subtitle: string;
}) {
  return (
    <div
      className={`bg-surface-panel rounded-lg p-space-lg border ${
        alert ? "border-status-critical/40" : "border-border-subtle"
      } flex flex-col gap-space-md shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md uppercase tracking-wider text-outline font-semibold">
          {title}
        </span>
        <span className={`material-symbols-outlined ${color} text-[24px]`}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display-lg text-[32px] font-bold text-on-surface">{value}</span>
        <span className="font-body-sm text-outline mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
}

function LaneTile({
  lane,
  caseId,
  subject,
  status,
  riskScore,
  badgeColor,
}: {
  lane: string;
  caseId: string;
  subject: string;
  status: string;
  riskScore: number;
  badgeColor: "critical" | "warning" | "success";
}) {
  return (
    <Link
      href={`/cases/${caseId}/overview`}
      className="p-space-md bg-surface-panel hover:bg-surface-elevated rounded border border-border-subtle hover:border-status-info transition-colors flex flex-col justify-between gap-space-sm group"
    >
      <div className="flex items-center justify-between">
        <span className="font-label-xs text-outline uppercase font-mono font-bold">{lane}</span>
        <StatusBadge status={badgeColor} text={`${riskScore}`} />
      </div>
      <div>
        <h4 className="font-label-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
          {subject}
        </h4>
        <span className="text-outline font-code-md text-xs">#{caseId}</span>
      </div>
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px]">
        <span className="text-outline">{status}</span>
        <span className="text-primary material-symbols-outlined text-[14px]">arrow_forward</span>
      </div>
    </Link>
  );
}
