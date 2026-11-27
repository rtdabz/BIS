'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Globe, History, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import type { StaffUser } from '@/types/dashboard';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu';
import { useToast } from './ToastProvider';

export interface UserProfileMenuProps {
  user: StaffUser;
  barangayName: string;
}

/**
 * Header user profile menu showing avatar, staff name, assigned role,
 * navigation shortcuts, and sign-out confirmation returning to /login.
 */
export function UserProfileMenu({ user, barangayName }: UserProfileMenuProps) {
  const router = useRouter();
  const { logout, canView } = useAuth();
  const { showToast } = useToast();
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const items: DropdownMenuItem[] = [
    ...(canView('settings')
      ? [
          {
            id: 'profile',
            label: 'Barangay & System Settings',
            description: 'Profile, signatories, and fee configuration',
            icon: <Settings className="h-4 w-4" />,
            onSelect: () => router.push('/settings'),
          },
        ]
      : []),
    ...(canView('auditLogs')
      ? [
          {
            id: 'audit',
            label: 'Audit Activity Trail',
            description: 'Inspect recent record changes and actions',
            icon: <History className="h-4 w-4" />,
            onSelect: () => router.push('/audit-logs'),
          },
        ]
      : []),
    ...(canView('users')
      ? [
          {
            id: 'users',
            label: 'User & Role Management',
            description: 'Manage staff accounts and permissions',
            icon: <User className="h-4 w-4" />,
            onSelect: () => router.push('/users'),
          },
        ]
      : []),
    {
      id: 'portal',
      label: 'View Public Portal',
      description: 'Open citizen-facing barangay portal',
      icon: <Globe className="h-4 w-4" />,
      onSelect: () => router.push('/'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      tone: 'danger',
      dividerBefore: true,
      icon: <LogOut className="h-4 w-4" />,
      onSelect: () => setLogoutOpen(true),
    },
  ];

  const menuHeader = (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bis-accent text-xs font-semibold text-bis-accent-contrast">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-bis-text">
            {user.fullName}
          </p>
          <p className="truncate text-[11px] font-medium text-bis-accent dark:text-[#93B9E6]">
            {user.role}
          </p>
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] text-bis-muted">
        {user.department} • {barangayName}
      </p>
    </div>
  );

  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    logout();
    showToast({
      title: 'Signed out',
      message: 'Returned to the BIS sign-in screen.',
      tone: 'accent',
    });
    router.replace('/login');
  };

  return (
    <>
      <DropdownMenu
        header={menuHeader}
        items={items}
        minWidth={256}
        trigger={({ open, onClick }) => (
          <button
            type="button"
            onClick={onClick}
            aria-expanded={open}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-lg border border-bis-border bg-bis-surface px-2 py-1.5 text-left transition-colors hover:bg-bis-surface-subtle focus-visible:outline-2 focus-visible:outline-bis-accent"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bis-accent text-[11px] font-semibold text-bis-accent-contrast">
              {user.initials}
            </span>
            <span className="hidden md:block leading-tight max-w-[150px]">
              <span className="block truncate text-[13px] font-semibold text-bis-text">
                {user.fullName}
              </span>
              <span className="block truncate text-[11px] text-bis-muted">
                {user.role}
              </span>
            </span>
            <ChevronDown
              className={`hidden sm:block h-3.5 w-3.5 text-bis-muted transition-transform duration-150 ${
                open ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        )}
      />

      <AppModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Sign out of BIS?"
        eyebrow="Session Control"
        maxWidth="xs"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              startIcon={<LogOut className="h-3.5 w-3.5" />}
              onClick={handleConfirmLogout}
            >
              Sign Out
            </AppButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-bis-muted">
          You are currently signed in as{' '}
          <strong className="font-semibold text-bis-text">{user.fullName}</strong> (
          {user.role}) for {barangayName}. Signing out returns you to the login screen
          so you can switch roles or end the demo session.
        </p>
      </AppModal>
    </>
  );
}
