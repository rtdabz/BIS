'use client';

import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { StatusTone } from '@/types/dashboard';

export interface ToastInput {
  title: string;
  message?: string;
  tone?: Exclude<StatusTone, 'neutral'>;
}

interface ToastItem extends ToastInput {
  id: string;
  tone: Exclude<StatusTone, 'neutral'>;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TONE_BORDER: Record<Exclude<StatusTone, 'neutral'>, string> = {
  success: 'border-bis-success/35',
  warning: 'border-bis-warning/40',
  danger: 'border-bis-danger/40',
  accent: 'border-bis-accent/35',
};

const TONE_ICON_STYLE: Record<Exclude<StatusTone, 'neutral'>, string> = {
  success: 'bg-bis-success-soft text-bis-success',
  warning: 'bg-bis-warning-soft text-bis-warning',
  danger: 'bg-bis-danger-soft text-bis-danger',
  accent: 'bg-bis-accent-soft text-bis-accent dark:text-[#93B9E6]',
};

function ToastIcon({ tone }: { tone: Exclude<StatusTone, 'neutral'> }) {
  if (tone === 'success') return <CheckCircle2 className="h-4 w-4" />;
  if (tone === 'warning') return <AlertTriangle className="h-4 w-4" />;
  if (tone === 'danger') return <AlertCircle className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

/**
 * Application-wide toast feedback provider using BIS surface and semantic status tokens.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const counterRef = React.useRef(0);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ title, message, tone = 'accent' }: ToastInput) => {
      counterRef.current += 1;
      const id = `toast-${counterRef.current}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, tone }]);
      window.setTimeout(() => {
        dismiss(id);
      }, 3800);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="System notifications"
        className="bis-no-print pointer-events-none fixed right-4 bottom-4 z-[1400] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-[10px] border ${TONE_BORDER[toast.tone]} bg-bis-surface p-3.5 shadow-[var(--bis-shadow-md)]`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${TONE_ICON_STYLE[toast.tone]}`}
              aria-hidden="true"
            >
              <ToastIcon tone={toast.tone} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-bis-text">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-bis-muted">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-bis-muted transition-colors hover:bg-bis-surface-subtle hover:text-bis-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
