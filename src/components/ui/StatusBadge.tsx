import * as React from 'react';
import type { StatusTone } from '@/types/dashboard';

export interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
  className?: string;
}

const TONE_STYLES: Record<StatusTone, string> = {
  success:
    'bg-bis-success-soft text-bis-success border-bis-success/25',
  warning:
    'bg-bis-warning-soft text-[#92400E] dark:text-[#FBBF24] border-bis-warning/30',
  danger:
    'bg-bis-danger-soft text-bis-danger dark:text-[#FCA5A5] border-bis-danger/30',
  accent:
    'bg-bis-accent-soft text-bis-accent dark:text-[#93B9E6] border-bis-accent/25',
  neutral:
    'bg-bis-surface-subtle text-bis-muted border-bis-border',
};

const DOT_STYLES: Record<StatusTone, string> = {
  success: 'bg-bis-success',
  warning: 'bg-bis-warning',
  danger: 'bg-bis-danger',
  accent: 'bg-bis-accent',
  neutral: 'bg-bis-muted',
};

/**
 * Semantic status indicator pill. Uses status colors strictly for actual
 * transaction or system states.
 */
export function StatusBadge({
  label,
  tone = 'neutral',
  dot = true,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_STYLES[tone]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT_STYLES[tone]}`}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}
