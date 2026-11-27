'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { StatMetric } from '@/types/dashboard';
import { StatIcon } from './iconRegistry';
import { StatusBadge } from './StatusBadge';

export interface StatCardProps {
  metric: StatMetric;
  className?: string;
}

/**
 * Reusable administrative KPI card following the 60/30/10 Navy/Slate/White palette.
 * Status colors are restricted to actual semantic indicator pills.
 */
export function StatCard({ metric, className = '' }: StatCardProps) {
  const TrendIcon =
    metric.trend === 'up'
      ? TrendingUp
      : metric.trend === 'down'
        ? TrendingDown
        : Minus;

  const badgeTone =
    metric.tone === 'warning' || metric.tone === 'danger'
      ? metric.tone
      : 'neutral';

  return (
    <Link
      href={metric.href}
      className={`group flex h-full flex-col justify-between rounded-[10px] border border-bis-border bg-bis-surface p-3.5 shadow-[var(--bis-shadow-sm)] transition-colors duration-150 hover:border-bis-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bis-accent ${className}`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-bis-muted">
            {metric.label}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-bis-text">
            {metric.formattedValue}
          </p>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle text-bis-accent dark:text-[#93B9E6] transition-colors group-hover:border-bis-accent/35">
          <StatIcon name={metric.icon} className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-bis-border/70 pt-2">
        <div className="flex min-w-0 items-center gap-2">
          <StatusBadge
            tone={badgeTone}
            dot={false}
            label={metric.changeLabel}
            className="font-semibold"
          />
          <span className="truncate text-xs text-bis-muted flex items-center gap-1">
            <TrendIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{metric.changeContext}</span>
          </span>
        </div>
        <ArrowUpRight
          className="h-3.5 w-3.5 shrink-0 text-bis-muted opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
