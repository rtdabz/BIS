import * as React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

/**
 * Reusable empty state panel for filtered views, search misses, and empty datasets.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  badge,
  compact = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-[10px] border border-dashed border-bis-border bg-bis-surface ${
        compact ? 'px-4 py-8' : 'px-6 py-12'
      } ${className}`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle text-bis-accent">
        {icon ?? <Inbox className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />}
      </div>
      {badge && <div className="mb-2">{badge}</div>}
      <h3 className="text-sm font-semibold text-bis-text">{title}</h3>
      <p className="mt-1 max-w-md text-xs sm:text-[13px] leading-relaxed text-bis-muted">
        {description}
      </p>
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
