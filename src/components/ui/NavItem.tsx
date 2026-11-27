'use client';

import * as React from 'react';
import Link from 'next/link';
import Tooltip from '@mui/material/Tooltip';
import type { NavItemConfig } from '@/types/navigation';
import { NavIcon } from './iconRegistry';

export interface NavItemProps {
  item: NavItemConfig;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

/**
 * Reusable sidebar navigation item anchored to deep-navy / dark-slate sidebar tokens
 * with clear active contrast, highlight edge bar, and collapsed tooltip support.
 */
export function NavItem({
  item,
  active,
  collapsed = false,
  onClick,
}: NavItemProps) {
  const linkContent = (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex items-center rounded-lg text-[13.5px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bis-highlight ${
        collapsed ? 'h-10 w-10 justify-center mx-auto' : 'gap-3 px-3 py-2'
      } ${
        active
          ? 'bg-bis-sidebar-active-bg text-bis-sidebar-active-text font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
          : 'text-bis-sidebar-muted hover:bg-bis-sidebar-hover hover:text-bis-sidebar-text font-medium'
      }`}
    >
      {/* Crisp Warm Highlight edge indicator */}
      {active && !collapsed && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-bis-highlight"
          aria-hidden="true"
        />
      )}

      <span
        className={`flex shrink-0 items-center justify-center transition-colors ${
          active
            ? 'text-bis-highlight'
            : 'text-bis-sidebar-muted group-hover:text-bis-sidebar-text'
        }`}
      >
        <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
      </span>

      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span
              className={`ml-auto inline-flex min-w-[20px] items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                active
                  ? 'bg-bis-highlight text-[#0F172A]'
                  : 'border border-bis-sidebar-border bg-bis-sidebar-surface text-bis-sidebar-muted group-hover:text-bis-sidebar-text'
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}

      {collapsed && item.badge !== undefined && (
        <span
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bis-highlight ring-2 ring-bis-sidebar"
          aria-hidden="true"
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip
        title={
          item.badge !== undefined ? `${item.label} (${item.badge})` : item.label
        }
        placement="right"
        arrow
        enterDelay={150}
      >
        {linkContent}
      </Tooltip>
    );
  }

  return linkContent;
}
