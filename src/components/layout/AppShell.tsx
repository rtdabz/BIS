'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, LockKeyhole, LogOut } from 'lucide-react';
import {
  AppButton,
  ChartCardSkeleton,
  EmptyState,
  StatCardSkeleton,
  StatusBadge,
  TableSkeleton,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import {
  deriveBarangayProfile,
  deriveNotifications,
  deriveSidebarBadges,
  mapStaffAccountToHeaderUser,
} from '@/lib/store/bisSelectors';
import { THEME_STORAGE_KEYS } from '@/theme/tokens';
import type { ModuleKey } from '@/types/bis';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface AppShellProps {
  children: React.ReactNode;
}

const SIDEBAR_CHANGE_EVENT = 'bis-sidebar-collapsed-change';
let inMemoryCollapsed = false;

function subscribeSidebarState(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);
  };
}

function getSidebarSnapshot(): boolean {
  try {
    const saved = window.localStorage.getItem(
      THEME_STORAGE_KEYS.sidebarCollapsed
    );
    if (saved === null) {
      return inMemoryCollapsed;
    }
    return saved === 'true';
  } catch {
    return inMemoryCollapsed;
  }
}

function getSidebarServerSnapshot(): boolean {
  return false;
}

const PATH_TO_MODULE_KEY: Record<string, ModuleKey> = {
  '/dashboard': 'dashboard',
  '/residents': 'residents',
  '/households': 'households',
  '/sectoral-records': 'sectoral',
  '/certificates': 'certificates',
  '/complaints': 'complaints',
  '/blotter': 'blotter',
  '/appointments': 'appointments',
  '/financial': 'financial',
  '/inventory': 'inventory',
  '/projects': 'projects',
  '/announcements': 'announcements',
  '/reports': 'reports',
  '/users': 'users',
  '/audit-logs': 'auditLogs',
  '/settings': 'settings',
};

export const NAV_ID_TO_MODULE_KEY: Record<string, ModuleKey> = {
  dashboard: 'dashboard',
  residents: 'residents',
  households: 'households',
  'sectoral-records': 'sectoral',
  certificates: 'certificates',
  complaints: 'complaints',
  blotter: 'blotter',
  appointments: 'appointments',
  financial: 'financial',
  inventory: 'inventory',
  projects: 'projects',
  announcements: 'announcements',
  reports: 'reports',
  users: 'users',
  'audit-logs': 'auditLogs',
  settings: 'settings',
};

/**
 * Primary administrative shell coordinating session guard, RBAC module access,
 * collapsible Sidebar, responsive Header, and main content viewport.
 * Always keeps {children} mounted in the tree so Next.js instant-navigation
 * validation never detects a dropped segment during SSR/prerender checks.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || '/dashboard';
  const router = useRouter();
  const { db } = useBisStore();
  const { currentUser, authChecked, isAuthenticated, canView, logout } = useAuth();

  const sidebarCollapsed = React.useSyncExternalStore(
    subscribeSidebarState,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authChecked, isAuthenticated, pathname, router]);

  const handleToggleDesktopSidebar = React.useCallback(() => {
    const next = !getSidebarSnapshot();
    inMemoryCollapsed = next;
    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEYS.sidebarCollapsed,
        String(next)
      );
    } catch {
      // Ignore storage access restrictions
    }
    window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
  }, []);

  const profile = React.useMemo(() => deriveBarangayProfile(db), [db]);
  const notifications = React.useMemo(() => deriveNotifications(db), [db]);
  const badges = React.useMemo(() => deriveSidebarBadges(db), [db]);

  const readyToShowAdmin = authChecked && Boolean(currentUser);
  const headerUser = currentUser
    ? mapStaffAccountToHeaderUser(currentUser)
    : null;
  const normalizedPath = `/${pathname.split('/').filter(Boolean)[0] ?? 'dashboard'}`;
  const moduleKey = PATH_TO_MODULE_KEY[normalizedPath];
  const hasModuleAccess = !readyToShowAdmin || !moduleKey ? true : canView(moduleKey);

  return (
    <div className="flex min-h-screen w-full bg-bis-bg text-bis-text">
      {readyToShowAdmin && (
        <div className="bis-no-print flex shrink-0">
          <Sidebar
            profile={profile}
            collapsed={sidebarCollapsed}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            badges={badges}
            canViewNavId={(navId) => {
              const key = NAV_ID_TO_MODULE_KEY[navId];
              return key ? canView(key) : true;
            }}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {readyToShowAdmin && headerUser && (
          <div className="bis-no-print sticky top-0 z-30">
            <Header
              profile={profile}
              user={headerUser}
              notifications={notifications}
              sidebarCollapsed={sidebarCollapsed}
              onToggleDesktopSidebar={handleToggleDesktopSidebar}
              onOpenMobileSidebar={() => setMobileOpen(true)}
            />
          </div>
        )}

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-[1440px]">
            {!readyToShowAdmin && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
                <ChartCardSkeleton height={220} />
                <TableSkeleton rows={5} />
              </div>
            )}

            {readyToShowAdmin && !hasModuleAccess && currentUser && (
              <EmptyState
                icon={<LockKeyhole className="h-5 w-5" />}
                badge={
                  <StatusBadge
                    label={`Role: ${currentUser.role}`}
                    tone="warning"
                  />
                }
                title="Module access restricted for your current role"
                description={`Your staff account (${currentUser.fullName} — ${currentUser.role}) does not have permission to open this module. Sign in with an authorized account or return to the Dashboard.`}
                action={
                  <>
                    <AppButton
                      variant="outline"
                      href="/dashboard"
                      startIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back to Dashboard
                    </AppButton>
                    <AppButton
                      variant="primary"
                      startIcon={<LogOut className="h-4 w-4" />}
                      onClick={() => {
                        logout();
                        router.replace('/login');
                      }}
                    >
                      Switch Account
                    </AppButton>
                  </>
                }
              />
            )}

            <div
              className={
                !readyToShowAdmin || !hasModuleAccess ? 'hidden' : undefined
              }
              aria-hidden={!readyToShowAdmin || !hasModuleAccess}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
