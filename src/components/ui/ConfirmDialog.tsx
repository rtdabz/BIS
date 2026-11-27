'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'accent';
  loading?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

/**
 * Reusable confirmation dialog supporting optional reason input for sensitive actions.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  requireReason = false,
  reasonLabel = 'Reason / Remarks',
  reasonPlaceholder = 'Provide details for the audit log...',
}: ConfirmDialogProps) {
  const [reason, setReason] = React.useState('');
  const [reasonError, setReasonError] = React.useState<string | null>(null);

  const handleClose = () => {
    setReason('');
    setReasonError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && !reason.trim()) {
      setReasonError('Please enter a brief explanation before continuing.');
      return;
    }
    const val = reason.trim() || undefined;
    setReason('');
    setReasonError(null);
    onConfirm(val);
  };

  const iconClasses =
    tone === 'danger'
      ? 'bg-bis-danger-soft text-bis-danger'
      : tone === 'warning'
        ? 'bg-bis-warning-soft text-bis-warning'
        : 'bg-bis-accent-soft text-bis-accent dark:text-[#93B9E6]';

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth="xs"
      footer={
        <>
          <AppButton variant="outline" onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </AppButton>
          <AppButton
            type="submit"
            form="bis-confirm-form"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            loading={loading}
          >
            {confirmLabel}
          </AppButton>
        </>
      }
    >
      <form id="bis-confirm-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClasses}`}
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm leading-relaxed text-bis-muted">{description}</p>
        </div>

        {requireReason && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-bis-text">
              {reasonLabel} <span className="text-bis-danger">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError(null);
              }}
              placeholder={reasonPlaceholder}
              className="w-full rounded-lg border border-bis-border bg-bis-surface-subtle px-3 py-2 text-sm text-bis-text placeholder:text-bis-muted focus:border-bis-accent focus:bg-bis-surface focus:outline-none focus:ring-2 focus:ring-bis-accent-soft"
            />
            {reasonError && (
              <p className="mt-1 text-xs text-bis-danger">{reasonError}</p>
            )}
          </div>
        )}
      </form>
    </AppModal>
  );
}
