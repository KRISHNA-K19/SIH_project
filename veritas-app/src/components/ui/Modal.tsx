"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconColor = "text-forensic-cyan",
  children,
  footer,
  maxWidth = "xl",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    "2xl": "max-w-3xl",
    "4xl": "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} bg-surface-workstation border border-border-strong rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md bg-surface-panel border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-space-sm">
            {icon && (
              <span className={`material-symbols-outlined text-[22px] ${iconColor}`}>
                {icon}
              </span>
            )}
            <div>
              <h2 id="modal-title" className="font-headline-md text-headline-md text-on-surface font-bold uppercase tracking-wide">
                {title}
              </h2>
              {subtitle && (
                <p className="font-body-sm text-body-sm text-outline">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-border-subtle bg-surface-elevated text-outline hover:text-on-surface hover:bg-surface-panel flex items-center justify-center transition-colors focus:outline-none focus:border-border-active"
            aria-label="Close dialog"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-lg overflow-y-auto flex-1 font-body-md text-on-surface">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-space-lg py-space-md bg-surface-panel/60 border-t border-border-subtle flex items-center justify-end gap-space-sm shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
