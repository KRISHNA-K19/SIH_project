"use client";

import React from "react";
import { useVeritas } from "@/context/VeritasContext";
import { TimelineViewer } from "@/components/case/TimelineViewer";

export default function CaseTimelinePage() {
  const { activeCase } = useVeritas();

  if (!activeCase) return null;

  return (
    <div className="flex flex-col gap-space-lg w-full">
      <TimelineViewer timeline={activeCase.timeline} />
    </div>
  );
}
