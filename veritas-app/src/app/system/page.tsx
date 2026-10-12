"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { SystemHealthMetric } from "@/types/veritas";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";

export default function SystemHealthPage() {
  const [metrics, setMetrics] = useState<SystemHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      const data = await apiService.getSystemHealth();
      setMetrics(data);
      setLoading(false);
    }
    loadMetrics();
  }, []);

  return (
    <div className="flex flex-col gap-space-xl max-w-7xl mx-auto pb-space-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            System Health & Telemetry
          </h1>
          <p className="font-body-md text-outline">
            Hardware platen drivers, biometric inferencing latency, and HSM gateway diagnostics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse"></span>
          <span className="font-label-xs text-status-success uppercase font-bold font-mono">
            ALL ENGINES NOMINAL
          </span>
        </div>
      </div>

      {/* Top Telemetry KPI Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-workstation p-space-lg rounded-lg border border-border-subtle flex flex-col gap-1 shadow-sm">
          <span className="font-label-xs uppercase text-outline">Overall Node Availability</span>
          <span className="font-display-lg text-[28px] font-bold text-status-success">99.98%</span>
          <span className="text-[11px] text-outline">Zero Unscheduled Downtime</span>
        </div>
        <div className="bg-surface-workstation p-space-lg rounded-lg border border-border-subtle flex flex-col gap-1 shadow-sm">
          <span className="font-label-xs uppercase text-outline">Biometric P99 Latency</span>
          <span className="font-display-lg text-[28px] font-bold text-forensic-cyan">142 ms</span>
          <span className="text-[11px] text-outline">512D Cosine Vector Match</span>
        </div>
        <div className="bg-surface-workstation p-space-lg rounded-lg border border-border-subtle flex flex-col gap-1 shadow-sm">
          <span className="font-label-xs uppercase text-outline">HSM Sign Throughput</span>
          <span className="font-display-lg text-[28px] font-bold text-on-surface">1,240 /s</span>
          <span className="text-[11px] text-outline">ICAO PKD CSCA Validations</span>
        </div>
        <div className="bg-surface-workstation p-space-lg rounded-lg border border-border-subtle flex flex-col gap-1 shadow-sm">
          <span className="font-label-xs uppercase text-outline">Optical Platen Temperature</span>
          <span className="font-display-lg text-[28px] font-bold text-on-surface">36.2 °C</span>
          <span className="text-[11px] text-outline">Coaxial 380nm UV Calibrated</span>
        </div>
      </div>

      {/* System Services Table */}
      <div className="bg-surface-workstation rounded-lg border border-border-subtle shadow-md overflow-hidden">
        <div className="p-space-md border-b border-border-subtle bg-surface-panel/50 flex items-center justify-between">
          <span className="font-headline-md font-bold text-on-surface uppercase">
            Registered Microservices & Drivers
          </span>
          <span className="text-outline text-label-xs font-mono">STATION DELTA-01</span>
        </div>

        {loading ? (
          <LoadingState message="Querying hardware health and engine heartbeats..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-sm">
              <thead>
                <tr className="bg-surface-panel font-label-xs text-outline uppercase tracking-wider border-b border-border-subtle">
                  <th className="p-space-md font-semibold">Service Name / ID</th>
                  <th className="p-space-md font-semibold">Classification</th>
                  <th className="p-space-md font-semibold">Latency</th>
                  <th className="p-space-md font-semibold">Uptime</th>
                  <th className="p-space-md font-semibold">Firmware / Version</th>
                  <th className="p-space-md font-semibold">Heartbeat</th>
                  <th className="p-space-md font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-on-surface">
                {metrics.map((m) => (
                  <tr key={m.serviceId} className="hover:bg-surface-panel transition-colors">
                    <td className="p-space-md">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{m.name}</span>
                        <span className="text-outline text-[11px] font-mono">#{m.serviceId}</span>
                        <span className="text-outline text-xs mt-0.5">{m.details}</span>
                      </div>
                    </td>
                    <td className="p-space-md">
                      <span className="font-label-xs bg-surface-base px-2 py-0.5 rounded border border-border-subtle text-outline font-mono">
                        {m.category}
                      </span>
                    </td>
                    <td className="p-space-md font-mono text-[13px]">
                      <span className={m.latencyMs > 100 ? "text-status-warning" : "text-status-success font-semibold"}>
                        {m.latencyMs} ms
                      </span>
                    </td>
                    <td className="p-space-md font-mono text-on-surface">
                      {m.uptime}
                    </td>
                    <td className="p-space-md font-mono text-outline text-[12px]">
                      {m.version}
                    </td>
                    <td className="p-space-md font-mono text-outline text-[12px]">
                      {m.lastHeartbeat}
                    </td>
                    <td className="p-space-md text-right">
                      <StatusBadge status="success" text={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
