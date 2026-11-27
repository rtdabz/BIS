'use client';

import * as React from 'react';
import Dialog, { type DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { X } from 'lucide-react';

export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: React.ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  paperClassName?: string;
}

/**
 * Standardized accessible modal dialog aligned with BIS Slate/Navy tokens.
 */
export function AppModal({
  open,
  onClose,
  title,
  subtitle,
  eyebrow,
  badge,
  maxWidth = 'sm',
  children,
  footer,
  contentClassName = '',
  paperClassName = '',
}: AppModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          className: paperClassName,
          sx: {
            backgroundColor: 'var(--bis-surface)',
            color: 'var(--bis-text-primary)',
            border: '1px solid var(--bis-border)',
            borderRadius: '12px',
            boxShadow: 'var(--bis-shadow-md)',
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        className="bis-no-print flex items-start justify-between gap-3 border-b border-bis-border px-5 py-4"
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
              {eyebrow}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
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
          aria-label="Close modal"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle text-bis-muted transition-colors hover:border-bis-border-strong hover:text-bis-text focus-visible:outline-2 focus-visible:outline-bis-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogTitle>

      <DialogContent className={`px-5 py-4 ${contentClassName}`}>
        {children}
      </DialogContent>

      {footer && (
        <DialogActions className="bis-no-print border-t border-bis-border bg-bis-surface-subtle/60 px-5 py-3.5 gap-2">
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
}
