'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Archive,
  Crown,
  Eye,
  Home,
  Pencil,
  RotateCcw,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  AppButton,
  AppModal,
  CheckboxField,
  ConfirmDialog,
  DataTable,
  DetailField,
  FilterSelect,
  FormField,
  PageHeader,
  PaginationBar,
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
import { PUROK_LIST } from '@/data/mock/bisSeedResidents';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import {
  computeResidentAge,
  formatPhp,
  formatResidentFullName,
} from '@/lib/store/bisSelectors';
import type { DwellingType, HouseholdRecord, PurokName } from '@/types/bis';
import type { StatMetric } from '@/types/dashboard';

interface HouseholdFormState {
  purok: PurokName;
  addressLine: string;
  dwellingType: DwellingType;
  waterSource: string;
  toiletFacility: string;
  monthlyIncomeEstimatePhp: string;
  is4PsHousehold: boolean;
  headResidentId: string;
  notes: string;
}

const EMPTY_HH_FORM: HouseholdFormState = {
  purok: 'Purok 1',
  addressLine: '',
  dwellingType: 'Owned House',
  waterSource: 'Level III Piped Water',
  toiletFacility: 'Water-Sealed Sanitary',
  monthlyIncomeEstimatePhp: '18000',
  is4PsHousehold: false,
  headResidentId: '',
  notes: '',
};

export function HouseholdsModule() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action') ?? '';
  return (
    <HouseholdsModuleInner key={initialAction} initialAction={initialAction} />
  );
}

function HouseholdsModuleInner({ initialAction }: { initialAction: string }) {
  const {
    db,
    addHousehold,
    updateHousehold,
    assignHouseholdMembers,
    archiveHousehold,
  } = useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('households');

  const [search, setSearch] = React.useState('');
  const [purokFilter, setPurokFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState<'Active' | 'Archived' | 'All'>('Active');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedHhId, setSelectedHhId] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(
    () => initialAction === 'new' && allowManage
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<HouseholdFormState>(() => ({
    ...EMPTY_HH_FORM,
    headResidentId: db.residents.find((r) => r.status === 'Active')?.id ?? '',
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [archiveTarget, setArchiveTarget] = React.useState<HouseholdRecord | null>(null);

  // Member assignment inputs inside drawer
  const [addMemberId, setAddMemberId] = React.useState('');
  const [addMemberRole, setAddMemberRole] = React.useState('Child');

  const activeHouseholds = React.useMemo(
    () => db.households.filter((h) => h.status === 'Active'),
    [db.households]
  );

  const totalMembers = activeHouseholds.reduce(
    (sum, h) => sum + h.memberIds.length,
    0
  );
  const avgSize =
    activeHouseholds.length > 0
      ? (totalMembers / activeHouseholds.length).toFixed(2)
      : '0';
  const fourPsCount = activeHouseholds.filter((h) => h.is4PsHousehold).length;

  const stats: StatMetric[] = [
    {
      id: 'hh-active',
      label: 'Active Households',
      value: activeHouseholds.length,
      formattedValue: activeHouseholds.length.toLocaleString(),
      icon: 'Home',
      changeLabel: '7 puroks',
      changeContext: 'tagged residential units',
      trend: 'up',
      tone: 'success',
      href: '/households',
    },
    {
      id: 'hh-members',
      label: 'Tagged Household Members',
      value: totalMembers,
      formattedValue: totalMembers.toLocaleString(),
      icon: 'Users',
      changeLabel: `${avgSize} avg`,
      changeContext: 'members per household',
      trend: 'neutral',
      tone: 'accent',
      href: '/residents',
    },
    {
      id: 'hh-owned',
      label: 'Owned Dwellings',
      value: activeHouseholds.filter((h) => h.dwellingType === 'Owned House').length,
      formattedValue: activeHouseholds
        .filter((h) => h.dwellingType === 'Owned House')
        .length.toLocaleString(),
      icon: 'CheckCircle2',
      changeLabel: `${activeHouseholds.length > 0 ? Math.round((activeHouseholds.filter((h) => h.dwellingType === 'Owned House').length / activeHouseholds.length) * 100) : 0}%`,
      changeContext: 'owner-occupied homes',
      trend: 'neutral',
      tone: 'accent',
      href: '/households',
    },
    {
      id: 'hh-4ps',
      label: '4Ps Households',
      value: fourPsCount,
      formattedValue: fourPsCount.toLocaleString(),
      icon: 'HeartHandshake',
      changeLabel: 'Pantawid',
      changeContext: 'active DSWD program units',
      trend: 'neutral',
      tone: 'warning',
      href: '/sectoral-records',
    },
  ];

  const getResidentName = React.useCallback(
    (residentId: string) => {
      const r = db.residents.find((item) => item.id === residentId);
      return r ? formatResidentFullName(r) : 'Unassigned';
    },
    [db.residents]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.households.filter((hh) => {
      if (statusFilter !== 'All' && hh.status !== statusFilter) return false;
      if (purokFilter !== 'All' && hh.purok !== purokFilter) return false;
      if (!q) return true;
      const headName = getResidentName(hh.headResidentId).toLowerCase();
      return (
        hh.householdCode.toLowerCase().includes(q) ||
        hh.addressLine.toLowerCase().includes(q) ||
        headName.includes(q)
      );
    });
  }, [db.households, getResidentName, purokFilter, search, statusFilter]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_HH_FORM,
      headResidentId:
        db.residents.find((r) => r.status === 'Active' && !r.householdId)?.id ??
        db.residents.find((r) => r.status === 'Active')?.id ??
        '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (hh: HouseholdRecord) => {
    setEditingId(hh.id);
    setForm({
      purok: hh.purok,
      addressLine: hh.addressLine,
      dwellingType: hh.dwellingType,
      waterSource: hh.waterSource,
      toiletFacility: hh.toiletFacility,
      monthlyIncomeEstimatePhp: String(hh.monthlyIncomeEstimatePhp),
      is4PsHousehold: hh.is4PsHousehold,
      headResidentId: hh.headResidentId,
      notes: hh.notes ?? '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleSaveHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.addressLine.trim()) nextErrors.addressLine = 'Address is required.';
    if (!form.headResidentId) {
      nextErrors.headResidentId = 'Select a Household Head.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingId) {
      updateHousehold(
        editingId,
        {
          purok: form.purok,
          addressLine: form.addressLine.trim(),
          dwellingType: form.dwellingType,
          waterSource: form.waterSource,
          toiletFacility: form.toiletFacility,
          monthlyIncomeEstimatePhp: Number(form.monthlyIncomeEstimatePhp) || 0,
          is4PsHousehold: form.is4PsHousehold,
          headResidentId: form.headResidentId,
          notes: form.notes.trim() || undefined,
        },
        actorMeta
      );
      showToast({
        title: 'Household updated',
        message: 'Household classification and details saved.',
        tone: 'success',
      });
    } else {
      const created = addHousehold(
        {
          purok: form.purok,
          addressLine: form.addressLine.trim(),
          dwellingType: form.dwellingType,
          waterSource: form.waterSource,
          toiletFacility: form.toiletFacility,
          monthlyIncomeEstimatePhp: Number(form.monthlyIncomeEstimatePhp) || 0,
          is4PsHousehold: form.is4PsHousehold,
          headResidentId: form.headResidentId,
          memberIds: [form.headResidentId],
          memberRoles: { [form.headResidentId]: 'Head' },
          notes: form.notes.trim() || undefined,
        },
        actorMeta
      );
      showToast({
        title: 'Household created',
        message: `${created.householdCode} registered in ${created.purok}.`,
        tone: 'success',
      });
    }
    setFormOpen(false);
  };

  const selectedHousehold = selectedHhId
    ? db.households.find((h) => h.id === selectedHhId) ?? null
    : null;

  const availableCandidates = React.useMemo(() => {
    if (!selectedHousehold) return [];
    return db.residents.filter(
      (r) =>
        r.status === 'Active' && !selectedHousehold.memberIds.includes(r.id)
    );
  }, [db.residents, selectedHousehold]);

  const handleAddMember = () => {
    if (!selectedHousehold || !addMemberId) return;
    assignHouseholdMembers(
      selectedHousehold.id,
      selectedHousehold.headResidentId,
      [...selectedHousehold.memberIds, addMemberId],
      { ...selectedHousehold.memberRoles, [addMemberId]: addMemberRole },
      actorMeta
    );
    showToast({
      title: 'Resident assigned to household',
      message: `${getResidentName(addMemberId)} added to ${selectedHousehold.householdCode}.`,
      tone: 'success',
    });
    setAddMemberId('');
  };

  const handleSetHead = (residentId: string) => {
    if (!selectedHousehold) return;
    const prevHeadId = selectedHousehold.headResidentId;
    const updatedRoles = {
      ...selectedHousehold.memberRoles,
      ...(prevHeadId && prevHeadId !== residentId
        ? { [prevHeadId]: 'Member' }
        : {}),
      [residentId]: 'Head',
    };
    assignHouseholdMembers(
      selectedHousehold.id,
      residentId,
      selectedHousehold.memberIds,
      updatedRoles,
      actorMeta
    );
    showToast({
      title: 'Household head updated',
      message: `${getResidentName(residentId)} is now designated Household Head.`,
      tone: 'accent',
    });
  };

  const handleRemoveMember = (residentId: string) => {
    if (!selectedHousehold) return;
    if (residentId === selectedHousehold.headResidentId) {
      showToast({
        title: 'Cannot remove Household Head',
        message: 'Designate another member as Household Head first.',
        tone: 'warning',
      });
      return;
    }
    const nextMembers = selectedHousehold.memberIds.filter(
      (id) => id !== residentId
    );
    const nextRoles = { ...selectedHousehold.memberRoles };
    delete nextRoles[residentId];
    assignHouseholdMembers(
      selectedHousehold.id,
      selectedHousehold.headResidentId,
      nextMembers,
      nextRoles,
      actorMeta
    );
    showToast({
      title: 'Member removed from household',
      message: `${getResidentName(residentId)} unassigned from ${selectedHousehold.householdCode}.`,
      tone: 'accent',
    });
  };

  const columns: DataTableColumn<HouseholdRecord>[] = [
    {
      key: 'householdCode',
      header: 'Household ID',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.householdCode}
        </span>
      ),
    },
    {
      key: 'head',
      header: 'Household Head',
      render: (row) => (
        <div className="min-w-[160px]">
          <p className="font-medium text-bis-text flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-bis-highlight shrink-0" />
            <span>{getResidentName(row.headResidentId)}</span>
          </p>
          <p className="text-[11px] text-bis-muted">{row.purok}</p>
        </div>
      ),
    },
    {
      key: 'addressLine',
      header: 'Address & Dwelling',
      render: (row) => (
        <div className="min-w-[170px]">
          <p className="text-bis-text">{row.addressLine}</p>
          <p className="text-[11px] text-bis-muted">{row.dwellingType}</p>
        </div>
      ),
    },
    {
      key: 'members',
      header: 'Members',
      align: 'center',
      render: (row) => (
        <StatusBadge
          label={`${row.memberIds.length} member${row.memberIds.length === 1 ? '' : 's'}`}
          tone="accent"
          dot={false}
        />
      ),
    },
    {
      key: 'income',
      header: 'Monthly Est. / 4Ps',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-semibold text-bis-text">
            {formatPhp(row.monthlyIncomeEstimatePhp)}
          </p>
          {row.is4PsHousehold && (
            <span className="text-[11px] font-medium text-bis-warning">
              4Ps Household
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={row.status}
          tone={row.status === 'Active' ? 'success' : 'neutral'}
        />
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
            onClick={() => setSelectedHhId(row.id)}
            className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text hover:bg-bis-surface-subtle"
          >
            <Eye className="h-3 w-3" />
            <span>Members</span>
          </button>
          {allowManage && (
            <>
              <button
                type="button"
                onClick={() => openEditModal(row)}
                aria-label={`Edit ${row.householdCode}`}
                className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setArchiveTarget(row)}
                aria-label={`${row.status === 'Active' ? 'Archive' : 'Restore'} ${row.householdCode}`}
                className={`inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 ${
                  row.status === 'Active'
                    ? 'text-bis-danger hover:bg-bis-danger-soft'
                    : 'text-bis-accent hover:bg-bis-accent-soft'
                }`}
              >
                {row.status === 'Active' ? (
                  <Archive className="h-3.5 w-3.5" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Community Records"
        title="Households & Family Units"
        subtitle="Manage barangay households, dwelling profiles, family heads, and resident member rosters."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<Home className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Add Household
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
        title="Household Directory"
        subtitle="Select any household to manage assigned residents and head designation."
        noPadding
        headerAction={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search household ID, head, street..."
            aria-label="Search households"
            containerClassName="w-56 sm:w-64"
          />
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bis-border bg-bis-surface-subtle px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-bis-border bg-bis-surface p-0.5">
              {(['Active', 'Archived', 'All'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === tab
                      ? 'bg-bis-accent text-bis-accent-contrast'
                      : 'text-bis-muted hover:text-bis-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <FilterSelect
              label="Filter by Purok"
              value={purokFilter}
              onChange={setPurokFilter}
              options={[
                { value: 'All', label: 'All Puroks' },
                ...PUROK_LIST.map((p) => ({ value: p, label: p })),
              ]}
            />
          </div>

          <span className="text-xs text-bis-muted">
            {filtered.length} households
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setSelectedHhId(r.id)}
          emptyTitle="No matching households"
          emptyDescription="Adjust filters or create a new household record."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="households"
            />
          }
        />
      </SectionCard>

      {/* Household Profile & Member Management Drawer */}
      <RecordDrawer
        open={Boolean(selectedHousehold)}
        onClose={() => setSelectedHhId(null)}
        eyebrow={selectedHousehold?.householdCode}
        title={
          selectedHousehold
            ? `Household — ${getResidentName(selectedHousehold.headResidentId)}`
            : ''
        }
        subtitle={
          selectedHousehold
            ? `${selectedHousehold.purok} • ${selectedHousehold.addressLine}`
            : undefined
        }
        badge={
          selectedHousehold && (
            <StatusBadge
              label={selectedHousehold.status}
              tone={selectedHousehold.status === 'Active' ? 'success' : 'neutral'}
            />
          )
        }
        footer={
          selectedHousehold && (
            <>
              <AppButton
                variant="outline"
                onClick={() => setSelectedHhId(null)}
              >
                Close
              </AppButton>
              {allowManage && (
                <AppButton
                  variant="primary"
                  startIcon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => openEditModal(selectedHousehold)}
                >
                  Edit Classification
                </AppButton>
              )}
            </>
          )
        }
      >
        {selectedHousehold && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField
                label="Dwelling Type"
                value={selectedHousehold.dwellingType}
              />
              <DetailField
                label="Est. Monthly Income"
                value={formatPhp(selectedHousehold.monthlyIncomeEstimatePhp)}
                mono
              />
              <DetailField
                label="Water Source"
                value={selectedHousehold.waterSource}
              />
              <DetailField
                label="Sanitation Facility"
                value={selectedHousehold.toiletFacility}
              />
            </dl>

            {/* Member Management */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                  Household Members ({selectedHousehold.memberIds.length})
                </h3>
                {selectedHousehold.is4PsHousehold && (
                  <StatusBadge label="4Ps Household" tone="warning" />
                )}
              </div>

              <div className="space-y-2">
                {selectedHousehold.memberIds.map((memberId) => {
                  const res = db.residents.find((r) => r.id === memberId);
                  const isHead = selectedHousehold.headResidentId === memberId;
                  const roleLabel =
                    selectedHousehold.memberRoles[memberId] ??
                    (isHead ? 'Head' : 'Member');

                  return (
                    <div
                      key={memberId}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 ${
                        isHead
                          ? 'border-bis-highlight/45 bg-bis-highlight-soft/40'
                          : 'border-bis-border bg-bis-surface-subtle/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isHead && (
                            <Crown className="h-3.5 w-3.5 shrink-0 text-bis-highlight" />
                          )}
                          <p className="truncate text-[13px] font-semibold text-bis-text">
                            {res ? formatResidentFullName(res) : memberId}
                          </p>
                          <StatusBadge
                            label={roleLabel}
                            tone={isHead ? 'warning' : 'neutral'}
                            dot={false}
                          />
                        </div>
                        {res && (
                          <p className="mt-0.5 text-[11px] text-bis-muted">
                            {res.residentCode} •{' '}
                            {computeResidentAge(res.birthDate)} yrs • {res.sex}
                          </p>
                        )}
                      </div>

                      {allowManage && !isHead && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSetHead(memberId)}
                            className="rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-[11px] font-medium text-bis-accent hover:bg-bis-accent-soft dark:text-[#93B9E6]"
                          >
                            Make Head
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(memberId)}
                            aria-label="Remove member"
                            className="rounded-md border border-bis-border bg-bis-surface p-1 text-bis-danger hover:bg-bis-danger-soft"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {allowManage && (
              <div className="rounded-[10px] border border-bis-border bg-bis-surface-subtle p-3.5 space-y-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-bis-text">
                  <UserPlus className="h-3.5 w-3.5 text-bis-accent dark:text-[#93B9E6]" />
                  Assign Resident to Household
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <SelectInput
                      value={addMemberId}
                      onChange={(e) => setAddMemberId(e.target.value)}
                      placeholder="Select resident..."
                      options={availableCandidates.map((r) => ({
                        value: r.id,
                        label: `${formatResidentFullName(r)} (${r.purok})`,
                      }))}
                    />
                  </div>
                  <SelectInput
                    value={addMemberRole}
                    onChange={(e) => setAddMemberRole(e.target.value)}
                    options={[
                      { value: 'Spouse', label: 'Spouse' },
                      { value: 'Child', label: 'Child' },
                      { value: 'Parent', label: 'Parent' },
                      { value: 'Relative', label: 'Relative' },
                      { value: 'Boarder', label: 'Boarder' },
                    ]}
                  />
                </div>
                <AppButton
                  variant="primary"
                  size="sm"
                  disabled={!addMemberId}
                  onClick={handleAddMember}
                >
                  Assign Member
                </AppButton>
              </div>
            )}
          </div>
        )}
      </RecordDrawer>

      {/* Add / Edit Household Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Household Profile' : 'Register New Household'}
        subtitle="Set purok location, dwelling attributes, and designated head."
        eyebrow="Households"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-household-form" variant="primary">
              {editingId ? 'Save Changes' : 'Create Household'}
            </AppButton>
          </>
        }
      >
        <form
          id="bis-household-form"
          onSubmit={handleSaveHousehold}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Purok" required>
              <SelectInput
                value={form.purok}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purok: e.target.value as PurokName }))
                }
                options={PUROK_LIST.map((p) => ({ value: p, label: p }))}
              />
            </FormField>
            <FormField
              label="Address Line"
              required
              error={errors.addressLine}
              className="sm:col-span-2"
            >
              <TextInput
                value={form.addressLine}
                hasError={Boolean(errors.addressLine)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, addressLine: e.target.value }))
                }
                placeholder="Lot 8 Bonifacio St."
              />
            </FormField>
          </div>

          <FormField
            label="Household Head"
            required
            error={errors.headResidentId}
          >
            <SelectInput
              value={form.headResidentId}
              hasError={Boolean(errors.headResidentId)}
              onChange={(e) =>
                setForm((p) => ({ ...p, headResidentId: e.target.value }))
              }
              placeholder="Select head resident..."
              options={db.residents
                .filter((r) => r.status === 'Active')
                .map((r) => ({
                  value: r.id,
                  label: `${formatResidentFullName(r)} (${r.residentCode} • ${r.purok})`,
                }))}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Dwelling Classification">
              <SelectInput
                value={form.dwellingType}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    dwellingType: e.target.value as DwellingType,
                  }))
                }
                options={[
                  { value: 'Owned House', label: 'Owned House' },
                  { value: 'Rented Unit', label: 'Rented Unit' },
                  { value: 'Shared Dwelling', label: 'Shared Dwelling' },
                  { value: 'Informal Structure', label: 'Informal Structure' },
                ]}
              />
            </FormField>
            <FormField label="Est. Monthly Household Income (₱)">
              <TextInput
                type="number"
                min={0}
                value={form.monthlyIncomeEstimatePhp}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    monthlyIncomeEstimatePhp: e.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Water Source">
              <SelectInput
                value={form.waterSource}
                onChange={(e) =>
                  setForm((p) => ({ ...p, waterSource: e.target.value }))
                }
                options={[
                  { value: 'Level III Piped Water', label: 'Level III Piped Water' },
                  { value: 'Shared Deep Well', label: 'Shared Deep Well' },
                  { value: 'Barangay Water Point', label: 'Barangay Water Point' },
                ]}
              />
            </FormField>
            <FormField label="Toilet Facility">
              <SelectInput
                value={form.toiletFacility}
                onChange={(e) =>
                  setForm((p) => ({ ...p, toiletFacility: e.target.value }))
                }
                options={[
                  { value: 'Water-Sealed Sanitary', label: 'Water-Sealed Sanitary' },
                  { value: 'Shared Sanitary', label: 'Shared Sanitary' },
                  { value: 'Basic Pit', label: 'Basic Pit' },
                ]}
              />
            </FormField>
          </div>

          <CheckboxField
            id="hh-4ps"
            label="4Ps / Pantawid Beneficiary Household"
            description="Tag household for DSWD Pantawid Pamilya coordination."
            checked={form.is4PsHousehold}
            onChange={(checked) =>
              setForm((p) => ({ ...p, is4PsHousehold: checked }))
            }
          />
        </form>
      </AppModal>

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title={
          archiveTarget?.status === 'Active'
            ? 'Archive Household Record'
            : 'Restore Household Record'
        }
        description={
          archiveTarget
            ? `${archiveTarget.status === 'Active' ? 'Archive' : 'Restore'} ${archiveTarget.householdCode} (${archiveTarget.addressLine})?`
            : ''
        }
        confirmLabel={
          archiveTarget?.status === 'Active' ? 'Archive' : 'Restore'
        }
        tone={archiveTarget?.status === 'Active' ? 'danger' : 'accent'}
        onConfirm={() => {
          if (!archiveTarget) return;
          archiveHousehold(archiveTarget.id, actorMeta);
          showToast({
            title:
              archiveTarget.status === 'Active'
                ? 'Household archived'
                : 'Household restored',
            message: archiveTarget.householdCode,
            tone: 'accent',
          });
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
