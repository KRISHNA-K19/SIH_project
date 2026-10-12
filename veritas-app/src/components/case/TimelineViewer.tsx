"use client";

import React, { useState } from "react";
import { TimelineEvent } from "@/types/veritas";

interface TimelineViewerProps {
  timeline: TimelineEvent[];
}

export function TimelineViewer({ timeline }: TimelineViewerProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredEvents = timeline.filter((e) => {
    if (filter === "ALL") return true;
    return e.type === filter;
  });

  return (
    <div className="bg-surface-workstation rounded-lg p-space-lg border border-border-subtle shadow-md flex flex-col gap-space-lg w-full">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-forensic-cyan text-[20px]">timeline</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold uppercase">
              Screening Progression Timeline
            </h3>
            <p className="font-body-sm text-outline">
              Deterministic chronological intake and event audit record
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-surface-panel p-1 rounded border border-border-subtle">
          {["ALL", "critical", "warning", "info"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-space-md py-1 rounded font-label-xs text-label-xs uppercase tracking-wider transition-colors ${
                filter === type
                  ? "bg-surface-elevated text-on-surface font-bold"
                  : "text-outline hover:text-on-surface"
              }`}
              type="button"
            >
              {type === "ALL" ? "All Events" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Spine */}
      <div className="relative pl-6 flex flex-col gap-space-lg before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
        {filteredEvents.map((evt) => {
          const pipColor =
            evt.type === "critical"
              ? "bg-status-critical"
              : evt.type === "warning"
              ? "bg-status-warning"
              : evt.type === "success"
              ? "bg-status-success"
              : "bg-forensic-cyan";

          return (
            <div key={evt.id} className="relative flex items-start gap-space-md group">
              {/* 6px solid square pip as per DESIGN.md */}
              <div
                className={`absolute -left-6 top-1.5 w-2 h-2 rounded-none ${pipColor} ring-4 ring-surface-workstation transition-transform group-hover:scale-125`}
              />

              {/* Monospace Timestamp */}
              <span className="font-code-md text-code-md font-mono shrink-0 text-outline pt-0.5">
                {evt.timestamp}
              </span>

              {/* Event Content Card */}
              <div className="flex flex-col flex-1 bg-surface-panel p-space-md rounded border border-border-subtle group-hover:bg-surface-elevated transition-colors">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`font-label-lg font-semibold ${
                      evt.type === "critical"
                        ? "text-status-critical"
                        : evt.type === "warning"
                        ? "text-status-warning"
                        : "text-on-surface"
                    }`}
                  >
                    {evt.title}
                  </span>
                  {evt.actor && (
                    <span className="font-label-xs text-outline bg-surface-base px-2 py-0.5 rounded border border-border-subtle">
                      {evt.actor}
                    </span>
                  )}
                </div>
                <p className="font-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-space-lg text-center text-outline font-body-sm">
            No events match the selected severity filter.
          </div>
        )}
      </div>
    </div>
  );
}
