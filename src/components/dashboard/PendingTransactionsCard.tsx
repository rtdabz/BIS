import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { SectionCard, StatusBadge } from '@/components/ui';
import type { PendingTransactionItem } from '@/types/dashboard';

export interface PendingTransactionsCardProps {
  transactions: PendingTransactionItem[];
}

/**
 * Actionable queue highlighting barangay clearances, hearings, and validations
 * that require prompt attention.
 */
export function PendingTransactionsCard({
  transactions,
}: PendingTransactionsCardProps) {
  return (
    <SectionCard
      title="Pending Actions"
      subtitle="Clearances, applications, and hearings needing review"
      headerAction={
        <StatusBadge
          label={`${transactions.length} open`}
          tone="warning"
        />
      }
    >
      <div className="space-y-2.5">
        {transactions.map((tx) => (
          <Link
            key={tx.id}
            href={tx.href}
            className="group flex items-start justify-between gap-3 rounded-lg border border-bis-border bg-bis-surface-subtle/60 p-3 transition-colors hover:border-bis-border-strong hover:bg-bis-surface-subtle"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-bis-accent dark:text-[#93B9E6]">
                  {tx.referenceNo}
                </span>
                <span className="text-[11px] text-bis-muted">• {tx.module}</span>
              </div>
              <p className="mt-1 truncate text-[13px] font-semibold text-bis-text">
                {tx.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-bis-muted">
                {tx.requester}
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-bis-muted">
                <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{tx.dueLabel}</span>
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch">
              <StatusBadge label={tx.priority} tone={tx.statusTone} />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-bis-accent opacity-80 transition-opacity group-hover:opacity-100 dark:text-[#93B9E6]">
                <span>Review</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
