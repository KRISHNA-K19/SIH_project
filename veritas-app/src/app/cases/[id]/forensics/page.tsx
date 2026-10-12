"use client";

import React, { useState } from "react";
import { useVeritas } from "@/context/VeritasContext";

export default function CaseForensicsPage() {
  const { activeCase } = useVeritas();
  const [selectedAnomalyIndex, setSelectedAnomalyIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterBand, setFilterBand] = useState<"UV_380NM" | "IR_850NM" | "WHITE_LIGHT">("UV_380NM");

  if (!activeCase) return null;

  const anomalies = activeCase.forensics || [];
  const currentAnomaly = anomalies[selectedAnomalyIndex] || anomalies[0];

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Header Banner */}
      <div className="bg-surface-workstation rounded-lg p-space-md border border-border-subtle flex flex-wrap items-center justify-between gap-space-md shadow-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-status-critical text-[24px]">biotech</span>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold uppercase">
              Micro-Spectroscopy Substrate Forensic Analyzer
            </h2>
            <p className="font-body-sm text-outline">
              Co-axial optical platen 4K sensor with multispectral UV/IR fluorescence analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-status-critical-bg text-status-critical font-label-xs text-label-xs px-2 py-0.5 rounded border border-status-critical/30 font-bold uppercase">
            {anomalies.length} Forensic Anomalies Flagged
          </span>
        </div>
      </div>

      {/* Main Forensic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: High Magnification Microscopy Surface (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="bg-surface-workstation rounded-lg p-space-md border border-border-subtle shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-forensic-cyan text-[18px]">zoom_in</span>
                <span className="font-label-md text-on-surface uppercase font-bold">
                  Spectroscopy Viewport ({filterBand})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(zoomLevel === 1 ? 2 : 1)}
                  className="px-2 py-1 rounded bg-surface-panel hover:bg-surface-elevated text-outline hover:text-on-surface text-label-xs font-mono uppercase border border-border-subtle"
                  type="button"
                >
                  {zoomLevel === 1 ? "Zoom 200%" : "Fit Canvas"}
                </button>
                <div className="flex items-center gap-1 bg-surface-panel p-1 rounded border border-border-subtle">
                  <button
                    onClick={() => setFilterBand("WHITE_LIGHT")}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${filterBand === "WHITE_LIGHT" ? "bg-surface-elevated text-white font-bold" : "text-outline"}`}
                    type="button"
                  >
                    White
                  </button>
                  <button
                    onClick={() => setFilterBand("UV_380NM")}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${filterBand === "UV_380NM" ? "bg-status-critical-bg text-status-critical font-bold" : "text-outline"}`}
                    type="button"
                  >
                    UV 380nm
                  </button>
                  <button
                    onClick={() => setFilterBand("IR_850NM")}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${filterBand === "IR_850NM" ? "bg-status-warning-bg text-status-warning font-bold" : "text-outline"}`}
                    type="button"
                  >
                    IR 850nm
                  </button>
                </div>
              </div>
            </div>

            {/* Microscope Viewport with Technical Reticle */}
            <div className="relative w-full h-[420px] rounded bg-[#07090E] border border-border-strong overflow-hidden flex items-center justify-center select-none">
              <img
                src={currentAnomaly?.imageUrl || activeCase.documents[0]?.docImage}
                alt="Microscopic examination"
                className={`w-full h-full object-cover transition-transform duration-300 ${zoomLevel === 2 ? "scale-150" : "scale-100"}`}
              />

              {/* Crosshair Target Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-status-critical/60 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-critical"></div>
                </div>
                <div className="absolute w-full h-px bg-status-critical/20"></div>
                <div className="absolute h-full w-px bg-status-critical/20"></div>
              </div>

              {/* Active Anomaly Bounding Frame */}
              <div className="absolute bottom-16 right-20 border-2 border-dashed border-status-critical bg-status-critical/10 p-2 rounded pointer-events-none">
                <span className="bg-status-critical text-white font-label-xs text-[10px] font-bold px-1.5 py-0.5 rounded">
                  0.12mm INCISION
                </span>
                <div className="font-mono text-status-critical text-[10px] mt-1 bg-black/80 px-1 rounded">
                  COORD: X.441 Y.892
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Anomaly Dossier & Technical Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Anomaly Selector List */}
          <div className="bg-surface-workstation rounded-lg p-space-md border border-border-subtle shadow-md flex flex-col gap-space-sm">
            <span className="font-label-xs uppercase text-outline font-bold border-b border-border-subtle pb-1">
              Detected Anomalies ({anomalies.length})
            </span>
            <div className="flex flex-col gap-2">
              {anomalies.map((anom, idx) => (
                <div
                  key={anom.id}
                  onClick={() => setSelectedAnomalyIndex(idx)}
                  className={`p-space-md rounded border cursor-pointer transition-colors flex flex-col gap-1 ${
                    selectedAnomalyIndex === idx
                      ? "bg-surface-elevated border-status-critical"
                      : "bg-surface-panel border-border-subtle hover:bg-surface-elevated"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-code-md text-status-critical font-bold text-[11px]">
                      #{anom.id}
                    </span>
                    <span className="font-label-xs text-status-critical uppercase font-bold">
                      {anom.type}
                    </span>
                  </div>
                  <span className="font-label-md text-on-surface font-semibold">{anom.title}</span>
                  <span className="font-body-sm text-outline text-[11px]">{anom.coordinates.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Forensic Metrics */}
          {currentAnomaly && (
            <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-sm">
              <span className="font-label-xs uppercase text-outline font-bold border-b border-border-subtle pb-1">
                Technical Sensor Findings
              </span>
              <div className="flex flex-col gap-2 font-body-sm text-outline pt-1">
                <div>
                  <span className="text-on-surface font-semibold">Description: </span>
                  {currentAnomaly.description}
                </div>
                {currentAnomaly.cutDepth && (
                  <div className="flex justify-between border-t border-border-subtle pt-1 font-mono">
                    <span>Measured Incision Depth:</span>
                    <span className="text-status-critical font-bold">{currentAnomaly.cutDepth}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border-subtle pt-1 font-mono">
                  <span>Spectral Band:</span>
                  <span className="text-forensic-cyan font-semibold">{currentAnomaly.band}</span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-1 font-mono">
                  <span>Photo Substitution Probability:</span>
                  <span className="text-status-critical font-bold">96.8%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
