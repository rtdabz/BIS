import * as React from 'react';

export interface SectionCardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

/**
 * Standardized surface card (30% surface allocation) with subtle border and optional header.
 */
export function SectionCard({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  contentClassName = '',
  noPadding = false,
}: SectionCardProps) {
  const hasHeader = Boolean(title || subtitle || headerAction);

  return (
    <section
      className={`rounded-[10px] border border-bis-border bg-bis-surface shadow-[var(--bis-shadow-sm)] flex flex-col ${className}`}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-bis-border px-5 py-3.5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-semibold tracking-tight text-bis-text">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-bis-muted">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div className="flex items-center gap-2 shrink-0">{headerAction}</div>
          )}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-5'} flex-1 ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
