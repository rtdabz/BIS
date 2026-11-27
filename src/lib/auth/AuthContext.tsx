'use client';

import * as React from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useBisStore } from '@/lib/store/BisStoreContext';
import type { ModuleKey, PermissionLevel, StaffAccountRecord } from '@/types/bis';

const AUTH_LOCAL_KEY = 'bis-demo-auth-session';
const AUTH_SESSION_KEY = 'bis-demo-auth-session-temp';
const AUTH_CHANGE_EVENT = 'bis-demo-auth-change';

interface PersistedSession {
  userId: string;
  rememberMe: boolean;
}

function readAuthUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      window.localStorage.getItem(AUTH_LOCAL_KEY) ??
      window.sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    return parsed?.userId ?? null;
  } catch {
    return null;
  }
}

function subscribeAuth(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
  };
}

function getServerAuthUserId(): string | null {
  return null;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
  user?: StaffAccountRecord;
}

export interface AuthContextValue {
  currentUser: StaffAccountRecord | null;
  authChecked: boolean;
  isAuthenticated: boolean;
  login: (
    identifier: string,
    password: string,
    rememberMe: boolean
  ) => Promise<LoginResult>;
  logout: () => void;
  getPermission: (module: ModuleKey) => PermissionLevel;
  canView: (module: ModuleKey) => boolean;
  canManage: (module: ModuleKey) => boolean;
  actorMeta: { id: string; name: string; role: string };
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { db, hydrated, logEvent, updateUser } = useBisStore();
  const mounted = useIsMounted();
  const sessionUserId = React.useSyncExternalStore(
    subscribeAuth,
    readAuthUserId,
    getServerAuthUserId
  );

  const currentUser = React.useMemo(() => {
    if (!sessionUserId) return null;
    return (
      db.users.find((u) => u.id === sessionUserId && u.status === 'Active') ??
      null
    );
  }, [db.users, sessionUserId]);

  const login = React.useCallback<AuthContextValue['login']>(
    async (identifier, password, rememberMe) => {
      const normalized = identifier.trim().toLowerCase();
      await new Promise((resolve) => window.setTimeout(resolve, 420));

      const matched = db.users.find(
        (u) =>
          u.email.toLowerCase() === normalized ||
          u.username.toLowerCase() === normalized
      );

      if (!matched || matched.demoPassword !== password) {
        return {
          ok: false,
          error:
            'Invalid email/username or password. Check the demonstration credentials below.',
        };
      }

      if (matched.status !== 'Active') {
        return {
          ok: false,
          error: `This staff account (${matched.employeeCode}) is currently ${matched.status}. Contact the Punong Barangay or Secretary.`,
        };
      }

      const payload: PersistedSession = { userId: matched.id, rememberMe };
      try {
        window.localStorage.removeItem(AUTH_LOCAL_KEY);
        window.sessionStorage.removeItem(AUTH_SESSION_KEY);
        if (rememberMe) {
          window.localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(payload));
        } else {
          window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
        }
        window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      } catch {
        // Ignore storage restrictions
      }

      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      updateUser(
        matched.id,
        { lastLoginAt: stamp },
        { id: matched.id, name: matched.fullName, role: matched.role }
      );
      logEvent(
        'Authentication',
        'Login',
        matched.employeeCode,
        `Simulated demo sign-in by ${matched.fullName} (${matched.role})`,
        undefined,
        { id: matched.id, name: matched.fullName, role: matched.role }
      );

      return { ok: true, user: matched };
    },
    [db.users, logEvent, updateUser]
  );

  const logout = React.useCallback(() => {
    if (currentUser) {
      logEvent(
        'Authentication',
        'Logout',
        currentUser.employeeCode,
        `Signed out of demo session (${currentUser.fullName})`,
        undefined,
        { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
      );
    }
    try {
      window.localStorage.removeItem(AUTH_LOCAL_KEY);
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch {
      // Ignore storage access errors
    }
  }, [currentUser, logEvent]);

  const getPermission = React.useCallback(
    (module: ModuleKey): PermissionLevel => {
      if (!currentUser) return 'none';
      return currentUser.permissions[module] ?? 'none';
    },
    [currentUser]
  );

  const canView = React.useCallback(
    (module: ModuleKey) => getPermission(module) !== 'none',
    [getPermission]
  );

  const canManage = React.useCallback(
    (module: ModuleKey) => getPermission(module) === 'manage',
    [getPermission]
  );

  const actorMeta = React.useMemo(
    () =>
      currentUser
        ? {
            id: currentUser.id,
            name: currentUser.fullName,
            role: currentUser.role,
          }
        : {
            id: 'usr-sec-001',
            name: 'Maria Elena Santos',
            role: 'Barangay Secretary',
          },
    [currentUser]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      currentUser,
      authChecked: mounted && hydrated,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
      getPermission,
      canView,
      canManage,
      actorMeta,
    }),
    [
      currentUser,
      mounted,
      hydrated,
      login,
      logout,
      getPermission,
      canView,
      canManage,
      actorMeta,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
