"use client";

import React, { useState } from "react";
import { useVeritas } from "@/context/VeritasContext";
import { DocumentViewer } from "@/components/case/DocumentViewer";

export default function CaseDocumentsPage() {
  const { activeCase } = useVeritas();
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  if (!activeCase) return null;

  const currentDoc = activeCase.documents[selectedDocIndex] || activeCase.documents[0];

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Document Selector Pills */}
      <div className="flex items-center gap-space-sm bg-surface-workstation p-2 rounded-lg border border-border-subtle">
        <span className="font-label-xs uppercase text-outline px-2 font-bold">Attached Specimens:</span>
        {activeCase.documents.map((doc, idx) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDocIndex(idx)}
            className={`px-space-md py-1.5 rounded font-label-md text-label-md uppercase tracking-wider flex items-center gap-2 transition-colors border ${
              selectedDocIndex === idx
                ? "bg-surface-elevated text-primary border-status-info font-bold"
                : "bg-surface-panel text-on-surface-variant hover:text-on-surface border-border-subtle"
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {doc.type.includes("Passport") ? "menu_book" : "verified"}
            </span>
            Specimen {String.fromCharCode(65 + idx)}: {doc.type} (#{doc.documentNumber})
          </button>
        ))}
      </div>

      {/* Render Document Viewer */}
      {currentDoc && <DocumentViewer document={currentDoc} />}
    </div>
  );
}
