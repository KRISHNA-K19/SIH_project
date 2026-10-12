import React from "react";

export function LoadingState({ message = "Retrieving biometric and telemetry records..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-space-2xl text-center bg-surface-workstation rounded-lg border border-border-subtle my-space-md min-h-[300px]">
      <div className="relative w-16 h-16 mb-space-lg flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-border-subtle border-t-status-info animate-spin"></div>
        <span className="material-symbols-outlined text-forensic-cyan text-[24px]">radar</span>
      </div>
      <span className="font-label-xs text-label-xs uppercase tracking-widest text-forensic-cyan font-bold">
        TELEMETRY ACQUISITION IN PROGRESS
      </span>
      <p className="font-body-sm text-body-sm text-outline mt-1">{message}</p>
    </div>
  );
}
