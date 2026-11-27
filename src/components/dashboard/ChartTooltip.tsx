'use client';

import * as React from 'react';
import type { TooltipContentProps } from 'recharts';

export interface ChartTooltipProps extends TooltipContentProps {
  labelSuffix?: string;
  valueSuffix?: string;
}

/**
 * Shared theme-reactive tooltip for all Recharts visualizations in the dashboard.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  labelSuffix = '',
  valueSuffix = '',
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-bis-border bg-bis-surface px-3 py-2.5 shadow-[var(--bis-shadow-md)]">
      {label !== undefined && label !== '' && (
        <p className="mb-1.5 text-xs font-semibold text-bis-text">
          {String(label)}
          {labelSuffix}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div
            key={`${String(entry.dataKey ?? entry.name)}-${idx}`}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-bis-muted">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span>{entry.name}</span>
            </span>
            <span className="font-semibold tabular-nums text-bis-text">
              {Number(entry.value ?? 0).toLocaleString()}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
