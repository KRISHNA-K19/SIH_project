"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput, FormSelect } from "@/components/ui/Inputs";
import { PrimaryButton } from "@/components/ui/Buttons";

export default function Login() {
  const router = useRouter();
  const [badgeId, setBadgeId] = useState("VR-8842");
  const [pin, setPin] = useState("••••••••");
  const [station, setStation] = useState("DELTA-01");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeId.trim()) {
      setError("Valid Officer Badge ID is required.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      router.push("/overview");
    }, 400);
  };

  const handleQuickFill = () => {
    setBadgeId("VR-8842");
    setPin("8842-DELTA");
    setStation("DELTA-01");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-space-lg select-none">
      <div className="w-full max-w-md bg-surface-workstation rounded-xl shadow-2xl border border-border-strong flex flex-col overflow-hidden">
        {/* Top Workstation Brand Header */}
        <div className="p-space-xl flex flex-col items-center gap-space-sm border-b border-border-subtle bg-surface-panel/70">
          <div className="w-14 h-14 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center text-forensic-cyan shadow-inner">
            <span className="material-symbols-outlined text-[32px]">security</span>
          </div>
          <div className="text-center">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              VERITAS
            </h1>
            <span className="font-label-xs text-label-xs text-forensic-cyan uppercase tracking-wider font-mono">
              DEFENSE WORKSTATION · v4.2
            </span>
          </div>
          <span className="font-body-sm text-outline text-center text-xs mt-1">
            Biometric Identity Screening & Document Forensics Platform
          </span>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleLogin} className="p-space-xl flex flex-col gap-space-lg">
          <FormSelect
            label="Assigned Terminal & Gate"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            options={[
              { label: "DELTA CHECKPOINT · Lane 01 (Airside)", value: "DELTA-01" },
              { label: "DELTA CHECKPOINT · Lane 02 (Diplomatic)", value: "DELTA-02" },
              { label: "DELTA CHECKPOINT · Lane 03 (E-Gate)", value: "DELTA-03" },
              { label: "ALPHA CHECKPOINT · Lane 04 (Secondary)", value: "ALPHA-04" },
            ]}
          />

          <FormInput
            label="Officer Badge ID"
            placeholder="e.g. VR-8842"
            value={badgeId}
            onChange={(e) => setBadgeId(e.target.value)}
            error={error}
            required
          />

          <FormInput
            label="Security Credential / PIN"
            type="password"
            placeholder="Enter secure workstation PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />

          <PrimaryButton
            type="submit"
            disabled={loading}
            icon="login"
            className="w-full h-10 mt-space-xs"
          >
            {loading ? "INITIALIZING SECURE SESSION..." : "INITIATE SECURE WORKSTATION SESSION"}
          </PrimaryButton>

          {/* Quick-Fill Preset Shortcut */}
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-xs text-outline hover:text-forensic-cyan underline font-mono text-center transition-colors"
          >
            Quick Preset: Insp. S. Jenkins (VR-8842 / DELTA-01)
          </button>
        </form>

        {/* Legal Disclaimer & Status Footer */}
        <div className="p-space-md bg-surface-panel flex flex-col gap-1 text-center border-t border-border-subtle">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-success"></span>
            <span className="font-label-xs text-outline uppercase font-mono">
              DEVELOPMENT WORKSTATION AUTHENTICATION · SIMULATION MODE
            </span>
          </div>
          <span className="text-[10px] text-outline/70">
            Authorized government personnel only. Unauthorized access is subject to criminal prosecution.
          </span>
        </div>
      </div>
    </div>
  );
}
