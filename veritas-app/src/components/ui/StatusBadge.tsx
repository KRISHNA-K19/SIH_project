export type StatusLevel = "critical" | "warning" | "success" | "info" | "neutral";

export function StatusBadge({
  status,
  text,
  showDot = true,
}: {
  status: StatusLevel;
  text: string;
  showDot?: boolean;
}) {
  const styles = {
    critical: "bg-status-critical-bg text-[#FCA5A5] border-[#EF4444]/40",
    warning: "bg-status-warning-bg text-[#FCD34D] border-[#F59E0B]/40",
    success: "bg-status-success-bg text-[#6EE7B7] border-[#10B981]/40",
    info: "bg-status-info-bg text-forensic-cyan border-status-info/40",
    neutral: "bg-surface-elevated text-outline border-border-subtle",
  };

  const dotStyles = {
    critical: "bg-status-critical",
    warning: "bg-status-warning",
    success: "bg-status-success",
    info: "bg-forensic-cyan",
    neutral: "bg-outline",
  };

  return (
    <span
      className={`border ${styles[status]} font-label-xs text-label-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold inline-flex items-center gap-1.5 shrink-0`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]} shrink-0`} />
      )}
      {text}
    </span>
  );
}
