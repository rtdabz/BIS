'use client';

import * as React from 'react';
import {
  BarChart3,
  Calendar,
  FileText,
  LayoutGrid,
  Users,
} from 'lucide-react';
import type { DashboardTabId, DateRangePreset } from '@/types/dashboard';

export interface DashboardTabItem {
  id: DashboardTabId;
  label: string;
  icon: typeof LayoutGrid;
  badge?: number;
}

export interface DashboardTabsProps {
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
  dateRange: DateRangePreset;
  onDateRangeChange: (range: DateRangePreset) => void;
  pendingTransactionsCount?: number;
}

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: 'ytd', label: '2026 YTD' },
];

/**
 * Elevated SaaS tab bar container with solid Navy active indicator pill
 * and integrated period selector.
 */
export function DashboardTabs({
  activeTab,
  onTabChange,
  dateRange,
  onDateRangeChange,
  pendingTransactionsCount,
}: DashboardTabsProps) {
  const tabs: DashboardTabItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'residents', label: 'Residents', icon: Users },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: FileText,
      badge: pendingTransactionsCount,
    },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onTabChange(tabs[(index + 1) % tabs.length].id);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onTabChange(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-bis-border bg-bis-surface px-2.5 py-2 shadow-[var(--bis-shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
      {/* Compact horizontal tabs */}
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="flex items-center gap-1 overflow-x-auto"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`dashboard-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`dashboard-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bis-accent ${
                isActive
                  ? 'bg-bis-accent font-semibold text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                  : 'font-medium text-bis-muted hover:bg-bis-surface-subtle hover:text-bis-text'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.85} aria-hidden="true" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`inline-flex min-w-[19px] items-center justify-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums leading-none ${
                    isActive
                      ? 'bg-bis-highlight text-[#0F172A]'
                      : 'border border-bis-border bg-bis-surface-subtle text-bis-muted'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contextual Date Range Filter */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-xs text-bis-muted">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Period:</span>
        </span>
        <div
          role="group"
          aria-label="Dashboard reporting period"
          className="inline-flex rounded-lg border border-bis-border bg-bis-surface-subtle p-0.5"
        >
          {DATE_RANGE_OPTIONS.map((option) => {
            const selected = dateRange === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onDateRangeChange(option.value)}
                aria-pressed={selected}
                className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap transition-colors ${
                  selected
                    ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                    : 'text-bis-muted hover:text-bis-text'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
