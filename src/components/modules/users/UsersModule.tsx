'use client';

import * as React from 'react';
import {
  KeyRound,
  Pencil,
  Power,
  Shield,
  UserPlus,
} from 'lucide-react';
import {
  AppButton,
  AppModal,
  ConfirmDialog,
  DataTable,
  DetailField,
  FilterSelect,
  FormField,
  PageHeader,
  RecordDrawer,
  SearchInput,
  SectionCard,
  SelectInput,
  StatCard,
  StatusBadge,
  TextInput,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { ROLE_PERMISSION_DEFAULTS } from '@/data/mock/bisSeedAdmin';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import type {
  ModuleKey,
  ModulePermissionMap,
  PermissionLevel,
  StaffAccountRecord,
  StaffRole,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const ROLES: StaffRole[] = [
  'Punong Barangay',
  'Barangay Secretary',
  'Barangay Treasurer',
  'Records Clerk',
  'Lupon Chair',
  'SK Chairperson',
];

const MODULE_LABELS: { key: ModuleKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'residents', label: 'Residents' },
  { key: 'households', label: 'Households' },
  { key: 'sectoral', label: 'Sectoral Records' },
  { key: 'certificates', label: 'Certificates & Clearances' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'blotter', label: 'Blotter Records' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'financial', label: 'Financial Management' },
  { key: 'inventory', label: 'Inventory Management' },
  { key: 'projects', label: 'Projects & Programs' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'reports', label: 'Reports & Analytics' },
  { key: 'users', label: 'User Management' },
  { key: 'auditLogs', label: 'Audit Logs' },
  { key: 'settings', label: 'System Settings' },
];

const STATUS_TONE: Record<StaffAccountRecord['status'], StatusTone> = {
  Active: 'success',
  Inactive: 'neutral',
  Suspended: 'danger',
};

function makeInitials(name: string): string {
  const parts = name
    .replace(/Hon\.|Kgd\./g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UsersModule() {
  const { db, createUser, updateUser } = useBisStore();
  const { currentUser, canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('users');

  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const [permTargetId, setPermTargetId] = React.useState<string | null>(null);
  const [draftPerms, setDraftPerms] = React.useState<ModulePermissionMap | null>(
    null
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [demoPassword, setDemoPassword] = React.useState('bisdemo2026');
  const [role, setRole] = React.useState<StaffRole>('Records Clerk');
  const [department, setDepartment] = React.useState('');
  const [contactNumber, setContactNumber] = React.useState('');
  const [status, setStatus] =
    React.useState<StaffAccountRecord['status']>('Active');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [toggleTarget, setToggleTarget] =
    React.useState<StaffAccountRecord | null>(null);

  const activeUsers = db.users.filter((u) => u.status === 'Active');

  const stats: StatMetric[] = [
    {
      id: 'usr-total',
      label: 'Total Staff Accounts',
      value: db.users.length,
      formattedValue: String(db.users.length),
      icon: 'UserCog',
      changeLabel: `${ROLES.length} roles`,
      changeContext: 'barangay personnel registry',
      trend: 'neutral',
      tone: 'accent',
      href: '/users',
    },
    {
      id: 'usr-active',
      label: 'Active Accounts',
      value: activeUsers.length,
      formattedValue: String(activeUsers.length),
      icon: 'CheckCircle2',
      changeLabel: 'Enabled',
      changeContext: 'authorized to sign in',
      trend: 'up',
      tone: 'success',
      href: '/users',
    },
    {
      id: 'usr-inactive',
      label: 'Inactive / Suspended',
      value: db.users.length - activeUsers.length,
      formattedValue: String(db.users.length - activeUsers.length),
      icon: 'AlertTriangle',
      changeLabel: 'Disabled',
      changeContext: 'access revoked',
      trend: 'neutral',
      tone: 'warning',
      href: '/users',
    },
    {
      id: 'usr-logins',
      label: 'Recent Logins Logged',
      value: db.auditLogs.filter((l) => l.action === 'Login').length,
      formattedValue: String(
        db.auditLogs.filter((l) => l.action === 'Login').length
      ),
      icon: 'History',
      changeLabel: 'Tracked',
      changeContext: 'session activity trail',
      trend: 'up',
      tone: 'accent',
      href: '/audit-logs',
    },
  ];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.users.filter((u) => {
      if (roleFilter !== 'All' && u.role !== roleFilter) return false;
      if (statusFilter !== 'All' && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.employeeCode.toLowerCase().includes(q)
      );
    });
  }, [db.users, roleFilter, search, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setDemoPassword('bisdemo2026');
    setRole('Records Clerk');
    setDepartment('Front-Desk Records & Issuance');
    setContactNumber('0917-100-0010');
    setStatus('Active');
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (u: StaffAccountRecord) => {
    setEditingId(u.id);
    setFullName(u.fullName);
    setUsername(u.username);
    setEmail(u.email);
    setDemoPassword(u.demoPassword);
    setRole(u.role);
    setDepartment(u.department);
    setContactNumber(u.contactNumber);
    setStatus(u.status);
    setErrors({});
    setFormOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!username.trim()) errs.username = 'Username is required.';
    if (!email.trim() || !email.includes('@')) {
      errs.email = 'Valid email is required.';
    }
    if (!demoPassword || demoPassword.length < 6) {
      errs.demoPassword = 'Password must be at least 6 characters.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editingId) {
      const existing = db.users.find((u) => u.id === editingId);
      const roleChanged = existing && existing.role !== role;
      updateUser(
        editingId,
        {
          fullName: fullName.trim(),
          initials: makeInitials(fullName),
          username: username.trim(),
          email: email.trim(),
          demoPassword,
          role,
          department: department.trim() || 'Barangay Office',
          contactNumber: contactNumber.trim(),
          status,
          ...(roleChanged ? { permissions: { ...ROLE_PERMISSION_DEFAULTS[role] } } : {}),
        },
        actorMeta
      );
      showToast({
        title: 'Staff account updated',
        message: `${fullName.trim()} (${role}) saved.`,
        tone: 'success',
      });
    } else {
      const created = createUser(
        {
          fullName: fullName.trim(),
          initials: makeInitials(fullName),
          username: username.trim(),
          email: email.trim(),
          demoPassword,
          role,
          department: department.trim() || 'Barangay Office',
          contactNumber: contactNumber.trim(),
          status,
          permissions: { ...ROLE_PERMISSION_DEFAULTS[role] },
        },
        actorMeta
      );
      showToast({
        title: 'Staff account created',
        message: `${created.employeeCode} — ${created.fullName} ready to sign in.`,
        tone: 'success',
      });
    }

    setFormOpen(false);
  };

  const permTarget = permTargetId
    ? db.users.find((u) => u.id === permTargetId) ?? null
    : null;

  const openPermissionsDrawer = (u: StaffAccountRecord) => {
    setPermTargetId(u.id);
    setDraftPerms({ ...u.permissions });
  };

  const columns: DataTableColumn<StaffAccountRecord>[] = [
    {
      key: 'employeeCode',
      header: 'Staff ID',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Staff Member',
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-[190px]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bis-accent text-xs font-semibold text-bis-accent-contrast">
            {row.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-bis-text">
              {row.fullName}
              {currentUser?.id === row.id && (
                <span className="ml-1.5 text-[10px] font-semibold text-bis-accent dark:text-[#93B9E6]">
                  (You)
                </span>
              )}
            </p>
            <p className="truncate font-mono text-[11px] text-bis-muted">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role & Department',
      render: (row) => (
        <div>
          <StatusBadge label={row.role} tone="accent" dot={false} />
          <p className="mt-1 text-[11px] text-bis-muted">{row.department}</p>
        </div>
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Last Activity',
      className: 'whitespace-nowrap font-mono text-xs text-bis-muted',
      render: (row) => row.lastLoginAt,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge label={row.status} tone={STATUS_TONE[row.status]} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div
          className="inline-flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => openPermissionsDrawer(row)}
            className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text hover:bg-bis-surface-subtle"
          >
            <Shield className="h-3 w-3" />
            <span>Permissions</span>
          </button>
          {allowManage && (
            <>
              <button
                type="button"
                onClick={() => openEditModal(row)}
                aria-label={`Edit ${row.fullName}`}
                className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {currentUser?.id !== row.id && (
                <button
                  type="button"
                  onClick={() => setToggleTarget(row)}
                  aria-label={`${row.status === 'Active' ? 'Deactivate' : 'Activate'} ${row.fullName}`}
                  className={`inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 ${
                    row.status === 'Active'
                      ? 'text-bis-danger hover:bg-bis-danger-soft'
                      : 'text-bis-accent hover:bg-bis-accent-soft'
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System Management"
        title="User Management & Access Control"
        subtitle="Manage barangay staff accounts, role assignments, activation states, and per-module permissions."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<UserPlus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Create Staff Account
            </AppButton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </div>

      <SectionCard
        title="Staff Accounts Directory"
        subtitle="Select any account to inspect or customize module permissions."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search name, email, role..."
              aria-label="Search staff accounts"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Role"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'All', label: 'All Roles' },
                ...ROLES.map((r) => ({ value: r, label: r })),
              ]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Suspended', label: 'Suspended' },
              ]}
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          onRowClick={(r) => openPermissionsDrawer(r)}
          emptyTitle="No staff accounts match"
          emptyDescription="Adjust filters or create a new staff account."
        />
      </SectionCard>

      {/* Permission Matrix Drawer */}
      <RecordDrawer
        open={Boolean(permTarget && draftPerms)}
        onClose={() => setPermTargetId(null)}
        eyebrow={permTarget?.employeeCode}
        title={permTarget ? `${permTarget.fullName} — Permissions` : ''}
        subtitle={
          permTarget ? `${permTarget.role} • ${permTarget.department}` : undefined
        }
        badge={
          permTarget && (
            <StatusBadge
              label={permTarget.status}
              tone={STATUS_TONE[permTarget.status]}
            />
          )
        }
        footer={
          permTarget &&
          draftPerms && (
            <>
              <AppButton variant="outline" onClick={() => setPermTargetId(null)}>
                Close
              </AppButton>
              {allowManage && (
                <>
                  <AppButton
                    variant="outline"
                    startIcon={<KeyRound className="h-3.5 w-3.5" />}
                    onClick={() =>
                      setDraftPerms({
                        ...ROLE_PERMISSION_DEFAULTS[permTarget.role],
                      })
                    }
                  >
                    Reset Role Defaults
                  </AppButton>
                  <AppButton
                    variant="primary"
                    onClick={() => {
                      updateUser(
                        permTarget.id,
                        { permissions: draftPerms },
                        actorMeta
                      );
                      showToast({
                        title: 'Permissions updated',
                        message: `Saved module access rules for ${permTarget.fullName}.`,
                        tone: 'success',
                      });
                      setPermTargetId(null);
                    }}
                  >
                    Save Permissions
                  </AppButton>
                </>
              )}
            </>
          )
        }
      >
        {permTarget && draftPerms && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField label="Username" value={permTarget.username} mono />
              <DetailField
                label="Last Sign-In"
                value={permTarget.lastLoginAt}
                mono
              />
            </dl>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Per-Module Access Level
              </p>
              <div className="divide-y divide-bis-border rounded-[10px] border border-bis-border">
                {MODULE_LABELS.map((mod) => {
                  const level = draftPerms[mod.key];
                  return (
                    <div
                      key={mod.key}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                    >
                      <span className="font-medium text-bis-text">
                        {mod.label}
                      </span>
                      <div className="inline-flex rounded-md border border-bis-border bg-bis-surface-subtle p-0.5">
                        {(['manage', 'view', 'none'] as PermissionLevel[]).map(
                          (opt) => (
                            <button
                              key={opt}
                              type="button"
                              disabled={!allowManage}
                              onClick={() =>
                                setDraftPerms((prev) =>
                                  prev ? { ...prev, [mod.key]: opt } : prev
                                )
                              }
                              className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize transition-colors ${
                                level === opt
                                  ? 'bg-bis-accent text-bis-accent-contrast'
                                  : 'text-bis-muted hover:text-bis-text'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </RecordDrawer>

      {/* Create / Edit Account Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Staff Account' : 'Create Staff Account'}
        eyebrow="User Management"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-user-form" variant="primary">
              {editingId ? 'Save Account' : 'Create Account'}
            </AppButton>
          </>
        }
      >
        <form id="bis-user-form" onSubmit={handleSaveUser} className="space-y-4">
          <FormField label="Full Name" required error={errors.fullName}>
            <TextInput
              value={fullName}
              hasError={Boolean(errors.fullName)}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Username" required error={errors.username}>
              <TextInput
                value={username}
                hasError={Boolean(errors.username)}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormField>
            <FormField label="Official Email" required error={errors.email}>
              <TextInput
                type="email"
                value={email}
                hasError={Boolean(errors.email)}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Assigned Role">
              <SelectInput
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                options={ROLES.map((r) => ({ value: r, label: r }))}
              />
            </FormField>
            <FormField label="Account Status">
              <SelectInput
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as StaffAccountRecord['status'])
                }
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                  { value: 'Suspended', label: 'Suspended' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Department / Desk">
              <TextInput
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </FormField>
            <FormField label="Contact Number">
              <TextInput
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label="Demo Password"
            required
            error={errors.demoPassword}
            hint="Used for simulated sign-in on /login."
          >
            <TextInput
              value={demoPassword}
              hasError={Boolean(errors.demoPassword)}
              onChange={(e) => setDemoPassword(e.target.value)}
            />
          </FormField>
        </form>
      </AppModal>

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        title={
          toggleTarget?.status === 'Active'
            ? 'Deactivate Staff Account'
            : 'Activate Staff Account'
        }
        description={
          toggleTarget
            ? `${toggleTarget.status === 'Active' ? 'Deactivate' : 'Activate'} ${toggleTarget.fullName} (${toggleTarget.role})?`
            : ''
        }
        confirmLabel={
          toggleTarget?.status === 'Active' ? 'Deactivate' : 'Activate'
        }
        tone={toggleTarget?.status === 'Active' ? 'danger' : 'accent'}
        onConfirm={() => {
          if (!toggleTarget) return;
          const nextStatus =
            toggleTarget.status === 'Active' ? 'Inactive' : 'Active';
          updateUser(toggleTarget.id, { status: nextStatus }, actorMeta);
          showToast({
            title: `Account ${nextStatus.toLowerCase()}`,
            message: toggleTarget.fullName,
            tone: nextStatus === 'Active' ? 'success' : 'warning',
          });
          setToggleTarget(null);
        }}
      />
    </div>
  );
}
