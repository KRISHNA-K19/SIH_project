import React from "react";

export function FixtureBanner() {
  return (
    <div className="bg-surface-elevated/80 border-b border-border-subtle px-space-md py-1 flex items-center justify-between text-[11px] font-mono select-none">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-status-info animate-pulse"></span>
        <span className="text-forensic-cyan font-semibold tracking-wider uppercase">
          PHASE 1 FOUNDATION WORKSTATION
        </span>
        <span className="text-outline">|</span>
        <span className="text-outline">
          Synthetic Development Fixtures Loaded (No Live Production Biometrics / AI Services)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-outline uppercase text-[10px] bg-surface-panel px-1.5 py-0.5 rounded border border-border-subtle">
          STATION DELTA-01
        </span>
      </div>
    </div>
  );
}
