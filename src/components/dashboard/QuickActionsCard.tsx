'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  FilePlus2,
  Home,
  ShieldPlus,
  UserPlus,
} from 'lucide-react';
import { SectionCard } from '@/components/ui';
import type { QuickActionId, QuickActionItem } from '@/types/dashboard';

export interface QuickActionsCardProps {
  actions: QuickActionItem[];
  layout?: 'vertical' | 'horizontal';
}

const ACTION_ICON_MAP: Record<QuickActionId, typeof UserPlus> = {
  'register-resident': UserPlus,
  'add-household': Home,
  'issue-certificate': FilePlus2,
  'record-incident': ShieldPlus,
};

/**
 * Operational shortcuts jumping straight into real front-desk workflows.
 */
export function QuickActionsCard({
  actions,
  layout = 'horizontal',
}: QuickActionsCardProps) {
  return (
    <SectionCard
      title="Quick Actions"
      subtitle="Direct shortcuts to frequent barangay front-desk workflows"
    >
      <div
        className={
          layout === 'horizontal'
            ? 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4'
            : 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-1'
        }
      >
        {actions.map((action) => {
          const Icon = ACTION_ICON_MAP[action.id];

          return (
            <Link
              key={action.id}
              href={action.targetHref}
              className="group flex items-start gap-3 rounded-lg border border-bis-border bg-bis-surface-subtle/60 p-3 text-left transition-colors hover:border-bis-accent/50 hover:bg-bis-surface-subtle focus-visible:outline-2 focus-visible:outline-bis-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bis-accent text-bis-accent-contrast transition-transform group-hover:scale-[1.02]">
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-bis-text">
                    {action.label}
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-bis-muted transition-colors group-hover:text-bis-accent dark:group-hover:text-[#93B9E6]"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-0.5 text-xs leading-snug text-bis-muted">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
