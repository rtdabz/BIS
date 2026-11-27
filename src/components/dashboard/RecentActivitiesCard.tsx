import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  FileCheck2,
  Megaphone,
  Settings2,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { SectionCard } from '@/components/ui';
import type { ActivityCategory, ActivityFeedItem } from '@/types/dashboard';

export interface RecentActivitiesCardProps {
  activities: ActivityFeedItem[];
}

const CATEGORY_ICON_MAP: Record<ActivityCategory, typeof FileCheck2> = {
  certificate: FileCheck2,
  resident: UserPlus,
  blotter: ShieldAlert,
  announcement: Megaphone,
  system: Settings2,
};

const CATEGORY_TONE_DOT: Record<ActivityCategory, string> = {
  certificate: 'bg-bis-accent',
  resident: 'bg-bis-accent',
  blotter: 'bg-bis-danger',
  announcement: 'bg-bis-warning',
  system: 'bg-bis-muted',
};

/**
 * Compact chronological activity timeline for daily barangay operations.
 */
export function RecentActivitiesCard({
  activities,
}: RecentActivitiesCardProps) {
  return (
    <SectionCard
      title="Recent Activities"
      subtitle="Latest registrations, document updates, and published notices"
      headerAction={
        <Link
          href="/audit-logs"
          className="inline-flex items-center gap-1 text-xs font-semibold text-bis-accent hover:underline dark:text-[#93B9E6]"
        >
          <span>View Log</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <ol className="relative ml-3.5 space-y-4 border-l border-bis-border pl-5">
        {activities.map((activity) => {
          const Icon = CATEGORY_ICON_MAP[activity.category];
          const dotClass = CATEGORY_TONE_DOT[activity.category];

          return (
            <li key={activity.id} className="relative">
              <span
                className="absolute -left-[33px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-bis-border bg-bis-surface text-bis-accent shadow-[var(--bis-shadow-sm)] dark:text-[#93B9E6]"
                aria-hidden="true"
              >
                <Icon className="h-3 w-3" strokeWidth={2} />
              </span>

              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
                    aria-hidden="true"
                  />
                  {activity.href ? (
                    <Link
                      href={activity.href}
                      className="truncate text-[13px] font-semibold text-bis-text hover:text-bis-accent hover:underline dark:hover:text-[#93B9E6]"
                    >
                      {activity.title}
                    </Link>
                  ) : (
                    <p className="truncate text-[13px] font-semibold text-bis-text">
                      {activity.title}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] font-medium text-bis-muted">
                  {activity.timestamp}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-bis-muted">
                {activity.description}
              </p>

              <p className="mt-1 text-[11px] text-bis-muted">
                {activity.actor} • {activity.actorRole}
              </p>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
