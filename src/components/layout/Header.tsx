'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import {
  ChevronRight,
  FileText,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  NavIcon,
  NotificationPanel,
  SearchInput,
  StatusBadge,
  ThemeToggle,
  UserProfileMenu,
} from '@/components/ui';
import { ALL_NAV_ITEMS, findNavItemByPath } from '@/data/mock/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import { formatResidentFullName } from '@/lib/store/bisSelectors';
import type {
  BarangayProfile,
  NotificationItem,
  StaffUser,
} from '@/types/dashboard';
import { NAV_ID_TO_MODULE_KEY } from './AppShell';

export interface HeaderProps {
  profile: BarangayProfile;
  user: StaffUser;
  notifications: NotificationItem[];
  sidebarCollapsed: boolean;
  onToggleDesktopSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

interface SearchResultEntry {
  id: string;
  label: string;
  sublabel: string;
  category: 'Module' | 'Resident' | 'Certificate' | 'Blotter';
  href: string;
  icon?: React.ReactNode;
}

/**
 * Compact, responsive top application header containing sidebar controls,
 * breadcrumb navigation, live global search, notifications, theme switcher,
 * and staff user profile dropdown.
 */
export function Header({
  profile,
  user,
  notifications,
  sidebarCollapsed,
  onToggleDesktopSidebar,
  onOpenMobileSidebar,
}: HeaderProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { db } = useBisStore();
  const { canView } = useAuth();
  const activeNav = findNavItemByPath(pathname);

  const [query, setQuery] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [mobileSearchAnchor, setMobileSearchAnchor] =
    React.useState<null | HTMLElement>(null);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accessibleNavItems = React.useMemo(
    () =>
      ALL_NAV_ITEMS.filter((item) => {
        const key = NAV_ID_TO_MODULE_KEY[item.id];
        return key ? canView(key) : true;
      }),
    [canView]
  );

  const searchResults = React.useMemo<SearchResultEntry[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return accessibleNavItems.slice(0, 6).map((item) => ({
        id: `nav-${item.id}`,
        label: item.label,
        sublabel: item.groupTitle,
        category: 'Module',
        href: item.href,
        icon: <NavIcon name={item.icon} className="h-4 w-4" />,
      }));
    }

    const navMatches: SearchResultEntry[] = accessibleNavItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(trimmed) ||
          item.groupTitle.toLowerCase().includes(trimmed) ||
          item.description.toLowerCase().includes(trimmed)
      )
      .slice(0, 4)
      .map((item) => ({
        id: `nav-${item.id}`,
        label: item.label,
        sublabel: item.groupTitle,
        category: 'Module',
        href: item.href,
        icon: <NavIcon name={item.icon} className="h-4 w-4" />,
      }));

    const residentMatches: SearchResultEntry[] = canView('residents')
      ? db.residents
          .filter((res) => {
            const full = formatResidentFullName(res).toLowerCase();
            return (
              full.includes(trimmed) ||
              res.residentCode.toLowerCase().includes(trimmed) ||
              res.purok.toLowerCase().includes(trimmed)
            );
          })
          .slice(0, 3)
          .map((res) => ({
            id: `res-${res.id}`,
            label: `${formatResidentFullName(res)} (${res.residentCode})`,
            sublabel: `${res.purok} • ${res.status}`,
            category: 'Resident',
            href: `/residents?search=${encodeURIComponent(res.residentCode)}`,
            icon: <Users className="h-4 w-4" />,
          }))
      : [];

    const certMatches: SearchResultEntry[] = canView('certificates')
      ? db.certificates
          .filter(
            (req) =>
              req.residentName.toLowerCase().includes(trimmed) ||
              req.trackingCode.toLowerCase().includes(trimmed) ||
              req.documentType.toLowerCase().includes(trimmed)
          )
          .slice(0, 3)
          .map((req) => ({
            id: `cert-${req.id}`,
            label: `${req.trackingCode} — ${req.residentName}`,
            sublabel: `${req.documentType} • ${req.status}`,
            category: 'Certificate',
            href: `/certificates?search=${encodeURIComponent(req.trackingCode)}`,
            icon: <FileText className="h-4 w-4" />,
          }))
      : [];

    const blotterMatches: SearchResultEntry[] = canView('blotter')
      ? db.blotterRecords
          .filter(
            (blt) =>
              blt.caseNumber.toLowerCase().includes(trimmed) ||
              blt.complainantName.toLowerCase().includes(trimmed) ||
              blt.respondentName.toLowerCase().includes(trimmed)
          )
          .slice(0, 2)
          .map((blt) => ({
            id: `blt-${blt.id}`,
            label: `${blt.caseNumber} — ${blt.incidentCategory}`,
            sublabel: `${blt.complainantName} vs ${blt.respondentName}`,
            category: 'Blotter',
            href: `/blotter?search=${encodeURIComponent(blt.caseNumber)}`,
            icon: <ShieldAlert className="h-4 w-4" />,
          }))
      : [];

    return [...navMatches, ...residentMatches, ...certMatches, ...blotterMatches];
  }, [accessibleNavItems, canView, db.blotterRecords, db.certificates, db.residents, query]);

  const handleSelectResult = (href: string) => {
    setSearchFocused(false);
    setMobileSearchAnchor(null);
    setQuery('');
    router.push(href);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-bis-border bg-bis-surface px-4 shadow-[var(--bis-shadow-sm)] sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="inline-flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle/60 text-bis-muted transition-colors hover:border-bis-border-strong hover:bg-bis-surface-subtle hover:text-bis-text focus-visible:outline-2 focus-visible:outline-bis-accent"
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </button>

        <Tooltip
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          arrow
        >
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={sidebarCollapsed}
            className="hidden lg:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle/60 text-bis-muted transition-colors hover:border-bis-border-strong hover:bg-bis-surface-subtle hover:text-bis-text focus-visible:outline-2 focus-visible:outline-bis-accent"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.85} />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.85} />
            )}
          </button>
        </Tooltip>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden sm:flex items-center">
              <Link
                href="/dashboard"
                className="font-medium text-bis-muted transition-colors hover:text-bis-text"
              >
                {profile.shortName}
              </Link>
            </li>

            {activeNav && activeNav.href !== '/dashboard' && (
              <>
                <li className="hidden sm:flex items-center text-bis-border-strong">
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </li>
                <li className="hidden md:flex items-center text-bis-muted truncate max-w-[160px]">
                  {activeNav.groupTitle}
                </li>
                <li className="hidden md:flex items-center text-bis-border-strong">
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </li>
              </>
            )}

            {(!activeNav || activeNav.href === '/dashboard') && (
              <li className="hidden sm:flex items-center text-bis-border-strong">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </li>
            )}

            <li
              aria-current="page"
              className="truncate font-semibold text-bis-text max-w-[170px] sm:max-w-[260px]"
            >
              {activeNav?.label ?? 'Dashboard'}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <div
          ref={searchContainerRef}
          className="relative hidden sm:block w-44 md:w-56 xl:w-72"
        >
          <SearchInput
            inputRef={searchInputRef}
            value={query}
            onChange={(val) => {
              setQuery(val);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search residents, modules, requests..."
            aria-label="Global search"
            shortcutHint="Ctrl K"
          />

          {searchFocused && (
            <div
              role="listbox"
              aria-label="Search suggestions"
              className="absolute right-0 left-0 top-full z-50 mt-1.5 overflow-hidden rounded-[10px] border border-bis-border bg-bis-surface shadow-[var(--bis-shadow-md)]"
            >
              <div className="flex items-center justify-between border-b border-bis-border bg-bis-surface-subtle px-3 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-bis-muted">
                  {query.trim() ? 'Matching Results' : 'Quick Navigation'}
                </span>
                <span className="text-[11px] text-bis-muted">
                  {searchResults.length} found
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="px-4 py-5 text-center text-xs text-bis-muted">
                  No modules or records match &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-bis-border">
                  {searchResults.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleSelectResult(entry.href)}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-bis-surface-subtle"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-bis-border bg-bis-surface-subtle text-bis-accent dark:text-[#93B9E6]">
                          {entry.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-bis-text">
                            {entry.label}
                          </p>
                          <p className="truncate text-[11px] text-bis-muted">
                            {entry.sublabel}
                          </p>
                        </div>
                      </div>
                      <StatusBadge label={entry.category} tone="neutral" dot={false} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Tooltip title="Search" arrow>
          <button
            type="button"
            onClick={(e) => setMobileSearchAnchor(e.currentTarget)}
            aria-label="Open global search"
            className="inline-flex sm:hidden h-9 w-9 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle/60 text-bis-muted transition-colors hover:border-bis-border-strong hover:bg-bis-surface-subtle hover:text-bis-text"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.85} />
          </button>
        </Tooltip>

        <Popover
          open={Boolean(mobileSearchAnchor)}
          anchorEl={mobileSearchAnchor}
          onClose={() => setMobileSearchAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                width: 'calc(100vw - 24px)',
                maxWidth: 380,
                p: 1.5,
                mt: 1,
              },
            },
          }}
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search residents, modules, requests..."
            aria-label="Mobile global search"
            autoFocus
          />
          <div className="mt-2 max-h-60 overflow-y-auto divide-y divide-bis-border">
            {searchResults.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleSelectResult(entry.href)}
                className="flex w-full items-center justify-between gap-2 py-2 px-1 text-left text-xs hover:bg-bis-surface-subtle rounded"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-bis-text">{entry.label}</p>
                  <p className="truncate text-[11px] text-bis-muted">{entry.sublabel}</p>
                </div>
                <StatusBadge label={entry.category} tone="neutral" dot={false} />
              </button>
            ))}
          </div>
        </Popover>

        <NotificationPanel initialNotifications={notifications} />

        <ThemeToggle />

        <UserProfileMenu user={user} barangayName={profile.barangayName} />
      </div>
    </header>
  );
}
