import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "search_off", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-space-2xl text-center bg-surface-workstation rounded-lg border border-dashed border-border-subtle my-space-md">
      <div className="w-12 h-12 rounded-full bg-surface-panel flex items-center justify-center text-outline mb-space-md border border-border-subtle">
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-1">
        {title}
      </h3>
      <p className="font-body-sm text-body-sm text-outline max-w-md mb-space-lg">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
