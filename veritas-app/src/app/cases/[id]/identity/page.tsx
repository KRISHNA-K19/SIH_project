"use client";

import React from "react";
import { useVeritas } from "@/context/VeritasContext";
import { BiometricComparison } from "@/components/case/BiometricComparison";

export default function CaseIdentityPage() {
  const { activeCase } = useVeritas();

  if (!activeCase) return null;

  return (
    <div className="flex flex-col gap-space-lg w-full">
      <BiometricComparison biometrics={activeCase.biometrics} />

      {/* Additional Biometric Technical Log */}
      <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-forensic-cyan text-[20px]">terminal</span>
            <span className="font-headline-md text-on-surface font-bold uppercase">
              Biometric Engine Execution Log
            </span>
          </div>
          <span className="text-outline font-mono text-label-xs">MODEL: DEEPFACE-RESNET50 · EMBEDDING: 512D</span>
        </div>

        <div className="bg-[#07090E] p-space-md rounded border border-border-strong font-mono text-[12px] text-outline flex flex-col gap-1 overflow-x-auto leading-relaxed">
          <div className="text-on-surface-variant">[08:41:34.201] Platen DG2 JPEG2000 raster decoded: 480x600 px, 24-bit sRGB.</div>
          <div className="text-on-surface-variant">[08:41:34.312] Live camera optical stream acquired from Lane 4 sensor (1920x1080@60fps).</div>
          <div className="text-on-surface-variant">[08:41:34.504] MediaPipe / Dlib 468 facial landmark mesh fitted: Yaw -4.2°, Pitch +1.1°, Roll +0.4°.</div>
          <div className="text-status-success font-semibold">[08:41:34.619] Presentation Attack Detection (PAD): Anti-spoofing score 99.1% (Genuine skin texture verified).</div>
          <div className="text-status-critical font-bold">[08:41:34.882] Cosine distance computation: 0.572. Vector similarity: 42.8%. THRESHOLD VIOLATION (Min: 75.0%).</div>
          <div className="text-status-critical font-bold">[08:41:35.001] RESULT: NON_CONVERGENCE. Biometric referral triggered for Station Inspector S. Jenkins.</div>
        </div>
      </div>
    </div>
  );
}
