import * as React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Consistent administrative page header with title, context subtitle, and right-aligned actions.
 */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  metadata,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
            {eyebrow}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-bis-text">
            {title}
          </h1>
          {metadata}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-[#475569] dark:text-bis-muted">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
