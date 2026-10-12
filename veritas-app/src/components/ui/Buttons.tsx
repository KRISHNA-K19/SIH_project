import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: string;
}

export function PrimaryButton({ children, icon, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`h-9 px-space-md rounded bg-status-info hover:bg-[#008CE6] active:bg-[#0062A3] text-white font-label-md text-label-md flex items-center justify-center gap-space-sm transition-all shadow-md active:scale-95 font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      type="button"
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, icon, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`h-9 px-space-md rounded bg-surface-elevated hover:bg-surface-panel active:bg-surface-container-highest text-on-surface hover:text-white font-label-md text-label-md flex items-center justify-center gap-space-sm transition-all border border-border-strong hover:border-secondary active:scale-95 font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      type="button"
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px] text-outline">{icon}</span>}
      {children}
    </button>
  );
}

export function DestructiveButton({ children, icon, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`h-9 px-space-md rounded bg-status-critical-bg hover:bg-status-critical text-status-critical hover:text-white font-label-md text-label-md flex items-center justify-center gap-space-sm transition-all border border-status-critical active:scale-95 font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      type="button"
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}

export function IconButton({ icon, title, className = "", ...props }: { icon: string; title: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      title={title}
      className={`w-8 h-8 rounded border border-border-subtle bg-surface-panel hover:bg-surface-elevated flex items-center justify-center text-outline hover:text-on-surface transition-colors focus:outline-none focus:border-border-active ${className}`}
      type="button"
      {...props}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}
