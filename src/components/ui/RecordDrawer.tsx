'use client';

import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import { X } from 'lucide-react';

export interface RecordDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Standardized right-side record inspection drawer with sticky header and action bar.
 */
export function RecordDrawer({
  open,
  onClose,
  title,
  subtitle,
  eyebrow,
  badge,
  width = 540,
  children,
  footer,
}: RecordDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width,
            maxWidth: '100vw',
            backgroundColor: 'var(--bis-surface)',
            color: 'var(--bis-text-primary)',
            borderLeft: '1px solid var(--bis-border)',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-bis-border bg-bis-surface px-5 py-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
              {eyebrow}
            </p>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-bis-text">
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-bis-muted">{subtitle}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle text-bis-muted transition-colors hover:border-bis-border-strong hover:text-bis-text focus-visible:outline-2 focus-visible:outline-bis-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

      {footer && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-bis-border bg-bis-surface-subtle/70 px-5 py-3.5">
          {footer}
        </div>
      )}
    </Drawer>
  );
}
