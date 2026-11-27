'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import { MapPin, X } from 'lucide-react';
import { NavItem } from '@/components/ui';
import { NAVIGATION_GROUPS } from '@/data/mock/navigation';
import { LAYOUT_DIMENSIONS } from '@/theme/tokens';
import type { BarangayProfile } from '@/types/dashboard';
import { BarangaySealLogo } from './BarangaySealLogo';

export interface SidebarProps {
  profile: BarangayProfile;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  badges?: Record<string, number | undefined>;
  canViewNavId?: (navId: string) => boolean;
}

interface SidebarContentProps {
  profile: BarangayProfile;
  collapsed: boolean;
  pathname: string;
  isMobile?: boolean;
  onItemNavigate?: () => void;
  onCloseMobile?: () => void;
  badges?: Record<string, number | undefined>;
  canViewNavId?: (navId: string) => boolean;
}

function SidebarContent({
  profile,
  collapsed,
  pathname,
  isMobile = false,
  onItemNavigate,
  onCloseMobile,
  badges,
  canViewNavId,
}: SidebarContentProps) {
  const isCompact = collapsed && !isMobile;

  const visibleGroups = React.useMemo(
    () =>
      NAVIGATION_GROUPS.map((group) => ({
        ...group,
        items: group.items
          .filter((item) => (canViewNavId ? canViewNavId(item.id) : true))
          .map((item) => ({
            ...item,
            badge:
              badges && item.id in badges ? badges[item.id] : item.badge,
          })),
      })).filter((group) => group.items.length > 0),
    [badges, canViewNavId]
  );

  return (
    <div className="flex h-full flex-col bg-bis-sidebar text-bis-sidebar-text select-none">
      {/* Branding Header aligned with 64px top bar */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-bis-sidebar-border ${
          isCompact ? 'justify-center px-2' : 'justify-between gap-2.5 px-4'
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onItemNavigate}
          className={`flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-bis-highlight ${
            isCompact ? 'justify-center' : 'flex-1'
          }`}
        >
          {isCompact ? (
            <Tooltip
              title={`${profile.systemName} — ${profile.barangayName}`}
              placement="right"
              arrow
            >
              <span className="inline-flex">
                <BarangaySealLogo variant="on-dark" className="h-9 w-9 shrink-0" />
              </span>
            </Tooltip>
          ) : (
            <BarangaySealLogo variant="on-dark" className="h-9 w-9 shrink-0" />
          )}

          {!isCompact && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-semibold tracking-tight text-bis-sidebar-text">
                {profile.systemName}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-semibold text-[#F1C77B]">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-bis-highlight"
                  aria-hidden="true"
                />
                <span className="truncate">{profile.barangayName}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-bis-sidebar-muted">
                <MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{profile.municipalityOrCity}</span>
              </p>
            </div>
          )}
        </Link>

        {isMobile && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bis-sidebar-border text-bis-sidebar-muted transition-colors hover:bg-bis-sidebar-hover hover:text-bis-sidebar-text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Organized Navigation Groups */}
      <nav
        aria-label="Primary navigation"
        className={`flex-1 overflow-y-auto py-3.5 ${
          isCompact ? 'px-2 space-y-3' : 'px-3 space-y-4'
        }`}
      >
        {visibleGroups.map((group, groupIdx) => (
          <div key={group.id}>
            {!isCompact ? (
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bis-sidebar-muted">
                {group.title}
              </p>
            ) : (
              groupIdx > 0 && (
                <div
                  className="mx-auto mb-2.5 h-px w-7 bg-bis-sidebar-border"
                  aria-hidden="true"
                />
              )
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.id}>
                    <NavItem
                      item={item}
                      active={isActive}
                      collapsed={isCompact}
                      onClick={onItemNavigate}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Metadata Strip */}
      <div className="shrink-0 border-t border-bis-sidebar-border p-3">
        {isCompact ? (
          <Tooltip
            title={`${profile.barangayCode} • ${profile.fiscalPeriod}`}
            placement="right"
            arrow
          >
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md border border-bis-sidebar-border bg-bis-sidebar-surface font-mono text-[10px] font-semibold text-bis-sidebar-muted">
              BIS
            </div>
          </Tooltip>
        ) : (
          <div className="rounded-lg border border-bis-sidebar-border bg-bis-sidebar-surface px-3 py-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-medium text-bis-sidebar-text truncate">
                {profile.barangayCode}
              </span>
              <span className="text-bis-sidebar-muted shrink-0 ml-2">
                {profile.fiscalPeriod}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-bis-sidebar-muted">
              {profile.punongBarangay}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Collapsible desktop sidebar + responsive mobile navigation drawer.
 */
export function Sidebar({
  profile,
  collapsed,
  mobileOpen,
  onCloseMobile,
  badges,
  canViewNavId,
}: SidebarProps) {
  const pathname = usePathname() || '/';
  const width = collapsed
    ? LAYOUT_DIMENSIONS.sidebarCollapsedWidth
    : LAYOUT_DIMENSIONS.sidebarExpandedWidth;

  return (
    <>
      <aside
        style={{ width }}
        className="hidden lg:block shrink-0 border-r border-bis-sidebar-border bg-bis-sidebar transition-[width] duration-200 ease-out"
        aria-label="Sidebar navigation"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <SidebarContent
            profile={profile}
            collapsed={collapsed}
            pathname={pathname}
            badges={badges}
            canViewNavId={canViewNavId}
          />
        </div>
      </aside>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 276,
            maxWidth: '85vw',
            boxSizing: 'border-box',
            backgroundColor: 'var(--bis-sidebar-bg)',
            color: 'var(--bis-sidebar-text)',
            borderRight: '1px solid var(--bis-sidebar-border)',
          },
        }}
      >
        <SidebarContent
          profile={profile}
          collapsed={false}
          pathname={pathname}
          isMobile
          onItemNavigate={onCloseMobile}
          onCloseMobile={onCloseMobile}
          badges={badges}
          canViewNavId={canViewNavId}
        />
      </Drawer>
    </>
  );
}
