"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const isActive = (path: string) => {
    if (path === "/overview") return pathname === "/overview" || pathname === "/";
    if (path === "/screening") return pathname === "/screening" || pathname === "/screening/new";
    return pathname.startsWith(path);
  };

  const NavLink = ({
    href,
    icon,
    label,
    path,
    badge,
  }: {
    href: string;
    icon: string;
    label: string;
    path: string;
    badge?: string;
  }) => {
    const active = isActive(path);
    return (
      <Link
        href={href}
        className={`flex items-center justify-between px-space-md py-1.5 transition-colors font-body-sm ${
          active
            ? "bg-surface-elevated text-primary border-l-2 border-status-info pl-space-md font-label-lg font-semibold"
            : "text-on-surface-variant hover:bg-surface-panel hover:text-on-surface"
        }`}
      >
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
          <span>{label}</span>
        </div>
        {badge && (
          <span className="bg-surface-panel text-outline text-label-xs px-1.5 py-0.5 rounded font-mono">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-workstation border-r border-border-subtle z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-14 shrink-0 px-space-md border-b border-border-subtle flex flex-col justify-center bg-surface-panel/40">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-forensic-cyan text-[20px]">security</span>
            <span className="font-headline-md text-headline-md tracking-wider text-on-surface uppercase font-bold">
              VERITAS
            </span>
            <span className="font-label-xs text-label-xs bg-surface-overlay text-forensic-cyan px-1.5 py-0.5 rounded border border-border-subtle">
              v4.2
            </span>
          </div>
          <span className="font-label-xs text-label-xs text-outline uppercase tracking-wider mt-0.5">
            AI-Assisted Security Screening
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex flex-col py-space-sm gap-space-2xs overflow-y-auto flex-1">
          <div className="px-space-md pt-space-sm pb-space-xs">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
              OPERATIONS
            </span>
          </div>
          <NavLink href="/overview" icon="grid_view" label="Overview" path="/overview" />
          <NavLink href="/screening" icon="radar" label="Live Screening" path="/screening" />
          <NavLink href="/screening/queue" icon="hourglass_empty" label="Screening Queue" path="/screening/queue" />

          <div className="px-space-md pt-space-md pb-space-xs">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
              INTELLIGENCE
            </span>
          </div>
          <NavLink href="/cases" icon="folder_supervised" label="Cases" path="/cases" />
          <NavLink href="/intelligence" icon="fingerprint" label="Identity Intelligence" path="/intelligence" />

          <div className="px-space-md pt-space-md pb-space-xs">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
              GOVERNANCE
            </span>
          </div>
          <NavLink href="/audit" icon="history" label="Audit Trail" path="/audit" />

          <div className="px-space-md pt-space-md pb-space-xs">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
              SYSTEM
            </span>
          </div>
          <NavLink href="/system" icon="monitor_heart" label="System Health" path="/system" />
        </nav>
      </div>

      {/* Officer Session Footer */}
      <div className="p-space-md border-t border-border-subtle bg-surface-dim flex flex-col gap-space-xs shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">
              Insp. S. Jenkins
            </span>
            <span className="font-code-md text-code-md text-outline">DELTA-01 CHECKPOINT</span>
          </div>
          <span className="material-symbols-outlined text-forensic-cyan text-[18px]">verified_user</span>
        </div>
        <div className="mt-space-2xs pt-space-2xs border-t border-border-subtle flex flex-col">
          <span className="font-label-xs text-label-xs text-status-success flex items-center gap-1 font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>Secure Session
          </span>
          <span className="font-label-xs text-label-xs text-outline">Authorized Access Only</span>
        </div>
        <Link
          href="/login"
          className="mt-space-xs flex items-center justify-between text-on-surface-variant hover:text-status-critical text-body-sm transition-colors pt-space-xs border-t border-border-subtle"
        >
          <span className="font-label-md text-label-md uppercase tracking-wider">Terminate Session</span>
          <span className="material-symbols-outlined text-[16px]">logout</span>
        </Link>
      </div>
    </aside>
  );
}
