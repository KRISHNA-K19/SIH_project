"use client";

import React, { useState } from "react";
import { DocumentItem } from "@/types/veritas";

interface DocumentViewerProps {
  document: DocumentItem;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [spectralBand, setSpectralBand] = useState<"WHITE_LIGHT" | "UV_380NM" | "IR_850NM">("UV_380NM");
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>("incision");
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Top Document Controls Bar */}
      <div className="bg-surface-workstation rounded-lg p-space-md border border-border-subtle flex flex-wrap items-center justify-between gap-space-md shadow-md">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
            <span className="font-headline-md text-on-surface font-bold uppercase">
              {document.type} (#{document.documentNumber})
            </span>
          </div>
          <span className="bg-surface-panel border border-border-subtle text-status-success font-label-xs text-label-xs px-2 py-0.5 rounded uppercase font-bold">
            {document.status}
          </span>
        </div>

        {/* Spectral Band Selector */}
        <div className="flex items-center gap-1 bg-surface-panel p-1 rounded border border-border-subtle">
          <button
            onClick={() => setSpectralBand("WHITE_LIGHT")}
            className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
              spectralBand === "WHITE_LIGHT"
                ? "bg-surface-elevated text-on-surface font-bold"
                : "text-outline hover:text-on-surface"
            }`}
            type="button"
          >
            White Light (Standard)
          </button>
          <button
            onClick={() => setSpectralBand("UV_380NM")}
            className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
              spectralBand === "UV_380NM"
                ? "bg-status-critical-bg text-status-critical font-bold border border-status-critical/40"
                : "text-outline hover:text-on-surface"
            }`}
            type="button"
          >
            UV 380nm (Spectral)
          </button>
          <button
            onClick={() => setSpectralBand("IR_850NM")}
            className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
              spectralBand === "IR_850NM"
                ? "bg-status-warning-bg text-status-warning font-bold border border-status-warning/40"
                : "text-outline hover:text-on-surface"
            }`}
            type="button"
          >
            IR 850nm (Coaxial)
          </button>
        </div>
      </div>

      {/* Main Dual-View Canvas: High-Resolution Optical Inspection Plane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Interactive Micro-Inspector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-workstation rounded-lg p-space-md border border-border-subtle shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-forensic-cyan text-[18px]">center_focus_strong</span>
                <span className="font-label-md text-label-md uppercase font-semibold text-on-surface">
                  Optical Platen Surface ({spectralBand})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="px-2 py-1 rounded bg-surface-panel hover:bg-surface-elevated text-outline hover:text-on-surface text-label-xs font-mono uppercase flex items-center gap-1 border border-border-subtle"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isZoomed ? "zoom_out" : "zoom_in"}
                  </span>
                  {isZoomed ? "400% Zoom" : "100% Fit"}
                </button>
                <span className="font-code-md text-code-md text-status-critical bg-status-critical-bg px-2 py-0.5 rounded border border-status-critical/30 font-bold">
                  FLAGGED ANOMALY
                </span>
              </div>
            </div>

            {/* Document Image Surface with Forensic Vector Overlays */}
            <div className="relative w-full h-[380px] rounded bg-[#07090E] border border-border-strong overflow-hidden flex items-center justify-center group select-none">
              {/* Technical 16px grid background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />

              <img
                src={spectralBand === "UV_380NM" && document.uvImage ? document.uvImage : document.docImage}
                alt="Document optical scan"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? "scale-150 origin-bottom-right" : "scale-100"
                }`}
              />

              {/* Anomaly Vector 1: 0.12mm Razor Incision Box */}
              <div
                onClick={() => setSelectedOverlay("incision")}
                className={`absolute bottom-16 right-16 w-32 h-20 rounded border-2 ${
                  selectedOverlay === "incision"
                    ? "border-status-critical bg-status-critical/15 ring-2 ring-status-critical/50"
                    : "border-status-warning bg-status-warning/10"
                } cursor-pointer transition-all flex flex-col justify-between p-1.5`}
              >
                <div className="bg-status-critical text-white font-label-xs text-[9px] font-bold px-1 py-0.5 rounded self-start">
                  0.12mm CUT
                </div>
                <div className="bg-black/80 text-status-critical font-code-md text-[10px] px-1 py-0.5 rounded self-end">
                  X.441 Y.892
                </div>
              </div>

              {/* Anomaly Vector 2: Hologram OVI Marker */}
              <div
                onClick={() => setSelectedOverlay("ovi")}
                className={`absolute top-12 left-16 w-24 h-16 rounded border ${
                  selectedOverlay === "ovi"
                    ? "border-forensic-cyan bg-forensic-cyan/20 ring-2 ring-forensic-cyan/50"
                    : "border-forensic-cyan/60 bg-forensic-cyan/5"
                } cursor-pointer transition-all flex flex-col justify-between p-1`}
              >
                <span className="text-forensic-cyan font-label-xs text-[9px] font-bold">OVI SEAL</span>
                <span className="text-outline font-code-md text-[9px] self-end">PASS</span>
              </div>
            </div>

            {/* Active Anomaly Inspector Tooltip Box */}
            {selectedOverlay === "incision" ? (
              <div className="bg-surface-panel p-space-md rounded border border-status-critical/40 flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-status-critical text-[20px] shrink-0 mt-0.5">content_cut</span>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-on-surface font-semibold text-status-critical">
                      Substrate Incision & Microprint Disruption
                    </span>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">
                      Sharp 0.12mm incision line identified under 850nm IR adjacent to passport photo border. Security fibers do not fluoresce continuously across margin.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col text-right shrink-0">
                  <span className="font-code-md text-status-critical font-bold">CUT: 0.12mm</span>
                  <span className="font-label-xs text-outline">CONFIDENCE: 98.6%</span>
                </div>
              </div>
            ) : (
              <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex items-center justify-between">
                <span className="font-label-md text-on-surface">Optical Variable Ink (OVI) Seal</span>
                <span className="text-status-success font-code-md font-bold text-label-xs">VERIFIED VALID</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: ICAO 9303 MRZ Optical & Cryptographic Breakdown (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* MRZ Card */}
          <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-forensic-cyan text-[20px]">document_scanner</span>
                <span className="font-headline-md text-on-surface font-bold">ICAO Doc 9303 MRZ Analysis</span>
              </div>
              <span className={`font-label-xs text-label-xs px-2 py-0.5 rounded font-bold uppercase ${document.mrzValid ? "bg-status-success-bg text-status-success border border-status-success/30" : "bg-status-critical-bg text-status-critical border border-status-critical/30"}`}>
                {document.mrzValid ? "MRZ CHECKSUM PASS" : "CHECKSUM FAIL"}
              </span>
            </div>

            {/* Raw OCR-B Text Block */}
            <div className="flex flex-col gap-1">
              <span className="font-label-xs uppercase text-outline font-semibold">Raw OCR-B Machine Readable Zone</span>
              <div className="bg-[#07090E] border border-border-strong rounded p-3 font-mono text-[13px] leading-relaxed text-forensic-cyan tracking-wider select-all overflow-x-auto">
                {document.mrzRaw.map((line, idx) => (
                  <div key={idx} className="whitespace-pre">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Parsed MRZ Field Table */}
            <div className="flex flex-col gap-1">
              <span className="font-label-xs uppercase text-outline font-semibold">Syntactic & MOD 10 Field Decomposition</span>
              <div className="rounded border border-border-subtle overflow-hidden">
                <table className="w-full text-left font-body-sm">
                  <tbody className="divide-y divide-border-subtle">
                    {document.mrzFields.map((field, i) => (
                      <tr key={i} className="hover:bg-surface-panel transition-colors">
                        <td className="p-2 text-outline font-label-xs uppercase bg-surface-panel/40 w-1/3">
                          {field.label}
                        </td>
                        <td className="p-2 font-mono text-[12px] text-on-surface">
                          {field.parsed}
                        </td>
                        <td className="p-2 text-right">
                          {field.valid ? (
                            <span className="text-status-success material-symbols-outlined text-[16px]">check_circle</span>
                          ) : (
                            <span className="text-status-critical material-symbols-outlined text-[16px]">cancel</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chip Cryptographic Security */}
            <div className="bg-surface-panel p-space-md rounded border border-border-subtle flex flex-col gap-1 font-body-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-xs uppercase text-outline font-semibold">Cryptographic E-Chip Protocol</span>
                <span className="text-status-success text-label-xs font-bold uppercase">DG1 & DG2 EXTRACTED</span>
              </div>
              <span className="text-on-surface font-mono text-[12px]">{document.chipProtocol}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
