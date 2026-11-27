'use client';

import * as React from 'react';
import Link from 'next/link';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import { Bell, CheckCheck } from 'lucide-react';
import type { NotificationItem } from '@/types/dashboard';
import { EmptyState } from './EmptyState';
import { StatusBadge } from './StatusBadge';

export interface NotificationPanelProps {
  initialNotifications: NotificationItem[];
}

/**
 * Header notification trigger and interactive popover panel synced with live derived alerts.
 */
export function NotificationPanel({ initialNotifications }: NotificationPanelProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [readIds, setReadIds] = React.useState<Set<string>>(() => new Set());
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const notifications = React.useMemo(
    () =>
      initialNotifications.map((item) => ({
        ...item,
        read: item.read || readIds.has(item.id),
      })),
    [initialNotifications, readIds]
  );

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const visibleItems =
    filter === 'unread'
      ? notifications.filter((item) => !item.read)
      : notifications;

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const handleToggleRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <>
      <Tooltip title="Notifications" arrow>
        <button
          type="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={`Notifications (${unreadCount} unread)`}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle/60 text-bis-muted transition-colors hover:border-bis-border-strong hover:bg-bis-surface-subtle hover:text-bis-text focus-visible:outline-2 focus-visible:outline-bis-accent"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.85} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bis-highlight px-1 text-[10px] font-semibold tabular-nums text-[#0F172A] ring-2 ring-bis-surface">
              {unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 368,
              maxWidth: 'calc(100vw - 24px)',
              mt: 1,
              overflow: 'hidden',
            },
          },
        }}
      >
        <div className="flex items-center justify-between border-b border-bis-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-bis-text">Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-md bg-bis-accent-soft px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-bis-accent dark:text-[#93B9E6]">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1 text-xs font-medium text-bis-accent hover:underline disabled:opacity-45 disabled:no-underline dark:text-[#93B9E6]"
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mark all read</span>
          </button>
        </div>

        <div className="flex items-center gap-1 border-b border-bis-border bg-bis-surface-subtle px-3 py-1.5">
          {(['all', 'unread'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-bis-surface text-bis-text shadow-[var(--bis-shadow-sm)] border border-bis-border'
                  : 'text-bis-muted hover:text-bis-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-h-[340px] overflow-y-auto divide-y divide-bis-border">
          {visibleItems.length === 0 ? (
            <div className="p-4">
              <EmptyState
                compact
                title="All caught up"
                description="No unread notifications at the moment."
              />
            </div>
          ) : (
            visibleItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  handleToggleRead(item.id);
                  setAnchorEl(null);
                }}
                className={`block px-4 py-3 transition-colors hover:bg-bis-surface-subtle ${
                  !item.read ? 'bg-bis-accent-soft/45' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge label={item.category} tone={item.tone} />
                  <span className="text-[11px] text-bis-muted">{item.timeAgo}</span>
                </div>
                <div className="mt-1.5 flex items-start gap-2">
                  {!item.read && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bis-highlight"
                      aria-label="Unread"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-snug text-bis-text">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-bis-muted">
                      {item.message}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Popover>
    </>
  );
}
