'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Archive,
  Download,
  Eye,
  FilePlus2,
  Pencil,
  RotateCcw,
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
  StatCard,
  SelectInput,
  StatusBadge,
  TextAreaInput,
  TextInput,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { PUROK_LIST } from '@/data/mock/bisSeedResidents';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import {
  computeResidentAge,
  formatResidentFullName,
} from '@/lib/store/bisSelectors';
import type {
  CivilStatus,
  PurokName,
  ResidentRecord,
  SectorCategory,
  SexOption,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const SECTOR_OPTIONS: SectorCategory[] = [
  'Senior Citizen',
  'PWD',
  'Solo Parent',
  '4Ps Beneficiary',
  'Youth / KK',
];

const VERIFICATION_TONE: Record<
  ResidentRecord['verificationStatus'],
  StatusTone
> = {
  Verified: 'accent',
  'Pending ID': 'warning',
  'For Renewal': 'neutral',
};

interface ResidentFormState {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  sex: SexOption;
  civilStatus: CivilStatus;
  purok: PurokName;
  addressLine: string;
  householdId: string;
  contactNumber: string;
  email: string;
  occupation: string;
  isRegisteredVoter: boolean;
  voterPrecinct: string;
  residencyStartYear: string;
  sectoralTags: SectorCategory[];
  verificationStatus: ResidentRecord['verificationStatus'];
  notes: string;
}

const EMPTY_FORM: ResidentFormState = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  birthDate: '1995-01-15',
  sex: 'Male',
  civilStatus: 'Single',
  purok: 'Purok 1',
  addressLine: '',
  householdId: '',
  contactNumber: '',
  email: '',
  occupation: '',
  isRegisteredVoter: true,
  voterPrecinct: '',
  residencyStartYear: '2020',
  sectoralTags: [],
  verificationStatus: 'Verified',
  notes: '',
};

export function ResidentsModule() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const initialAction = searchParams.get('action') ?? '';
  return (
    <ResidentsModuleInner
      key={`${initialSearch}|${initialAction}`}
      initialSearch={initialSearch}
      initialAction={initialAction}
    />
  );
}

function ResidentsModuleInner({
  initialSearch,
  initialAction,
}: {
  initialSearch: string;
  initialAction: string;
}) {
  const router = useRouter();
  const { db, addResident, updateResident, archiveResident, restoreResident } =
    useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('residents');

  const [search, setSearch] = React.useState(initialSearch);
  const [statusFilter, setStatusFilter] = React.useState<
    'Active' | 'Archived' | 'All'
  >('Active');
  const [purokFilter, setPurokFilter] = React.useState('All');
  const [sectorFilter, setSectorFilter] = React.useState('All');
  const [verificationFilter, setVerificationFilter] = React.useState('All');
  const [sortKey, setSortKey] = React.useState<string>('residentCode');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedResident, setSelectedResident] =
    React.useState<ResidentRecord | null>(null);
  const [formOpen, setFormOpen] = React.useState(
    () => initialAction === 'new' && allowManage
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ResidentFormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [archiveTarget, setArchiveTarget] =
    React.useState<ResidentRecord | null>(null);

  const activeCount = React.useMemo(
    () => db.residents.filter((r) => r.status === 'Active').length,
    [db.residents]
  );
  const archivedCount = React.useMemo(
    () => db.residents.filter((r) => r.status === 'Archived').length,
    [db.residents]
  );
  const voterCount = React.useMemo(
    () =>
      db.residents.filter((r) => r.status === 'Active' && r.isRegisteredVoter)
        .length,
    [db.residents]
  );
  const householdTaggedCount = React.useMemo(
    () =>
      db.residents.filter((r) => r.status === 'Active' && Boolean(r.householdId))
        .length,
    [db.residents]
  );

  const summaryStats: StatMetric[] = React.useMemo(
    () => [
      {
        id: 'mod-res-active',
        label: 'Active Residents',
        value: activeCount,
        formattedValue: activeCount.toLocaleString(),
        icon: 'Users',
        changeLabel: `${archivedCount} archived`,
        changeContext: 'in barangay registry',
        trend: 'up',
        tone: 'success',
        href: '/residents',
      },
      {
        id: 'mod-res-voters',
        label: 'Registered Voters',
        value: voterCount,
        formattedValue: voterCount.toLocaleString(),
        icon: 'UserCheck',
        changeLabel: `${activeCount > 0 ? Math.round((voterCount / activeCount) * 100) : 0}%`,
        changeContext: 'precinct-verified',
        trend: 'neutral',
        tone: 'accent',
        href: '/residents',
      },
      {
        id: 'mod-res-hh',
        label: 'Household Tagged',
        value: householdTaggedCount,
        formattedValue: householdTaggedCount.toLocaleString(),
        icon: 'Home',
        changeLabel: `${activeCount > 0 ? Math.round((householdTaggedCount / activeCount) * 100) : 0}%`,
        changeContext: 'assigned to households',
        trend: 'up',
        tone: 'accent',
        href: '/households',
      },
      {
        id: 'mod-res-pending',
        label: 'IDs Pending / Renewal',
        value: db.residents.filter(
          (r) => r.status === 'Active' && r.verificationStatus !== 'Verified'
        ).length,
        formattedValue: db.residents
          .filter(
            (r) => r.status === 'Active' && r.verificationStatus !== 'Verified'
          )
          .length.toLocaleString(),
        icon: 'FileClock',
        changeLabel: 'Review',
        changeContext: 'status verification queue',
        trend: 'neutral',
        tone: 'warning',
        href: '/residents',
      },
    ],
    [activeCount, archivedCount, db.residents, householdTaggedCount, voterCount]
  );

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = db.residents.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (purokFilter !== 'All' && r.purok !== purokFilter) return false;
      if (
        sectorFilter !== 'All' &&
        !r.sectoralTags.includes(sectorFilter as SectorCategory)
      ) {
        return false;
      }
      if (
        verificationFilter !== 'All' &&
        r.verificationStatus !== verificationFilter
      ) {
        return false;
      }
      if (!q) return true;
      const fullName = formatResidentFullName(r).toLowerCase();
      return (
        fullName.includes(q) ||
        r.residentCode.toLowerCase().includes(q) ||
        r.addressLine.toLowerCase().includes(q) ||
        r.occupation.toLowerCase().includes(q) ||
        r.contactNumber.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'fullName') {
        cmp = formatResidentFullName(a).localeCompare(formatResidentFullName(b));
      } else if (sortKey === 'age') {
        cmp = computeResidentAge(a.birthDate) - computeResidentAge(b.birthDate);
      } else if (sortKey === 'purok') {
        cmp = a.purok.localeCompare(b.purok);
      } else {
        cmp = a.residentCode.localeCompare(b.residentCode);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [
    db.residents,
    purokFilter,
    search,
    sectorFilter,
    sortDir,
    sortKey,
    statusFilter,
    verificationFilter,
  ]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filteredRows.length / pageSize)));
  const paginatedRows = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (resident: ResidentRecord) => {
    setEditingId(resident.id);
    setForm({
      firstName: resident.firstName,
      middleName: resident.middleName,
      lastName: resident.lastName,
      suffix: resident.suffix ?? '',
      birthDate: resident.birthDate,
      sex: resident.sex,
      civilStatus: resident.civilStatus,
      purok: resident.purok,
      addressLine: resident.addressLine,
      householdId: resident.householdId ?? '',
      contactNumber: resident.contactNumber,
      email: resident.email ?? '',
      occupation: resident.occupation,
      isRegisteredVoter: resident.isRegisteredVoter,
      voterPrecinct: resident.voterPrecinct ?? '',
      residencyStartYear: String(resident.residencyStartYear),
      sectoralTags: [...resident.sectoralTags],
      verificationStatus: resident.verificationStatus,
      notes: resident.notes ?? '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    if (!form.birthDate) nextErrors.birthDate = 'Birth date is required.';
    if (!form.addressLine.trim()) nextErrors.addressLine = 'Address is required.';
    if (!form.contactNumber.trim()) {
      nextErrors.contactNumber = 'Contact number is required.';
    }
    if (!form.occupation.trim()) nextErrors.occupation = 'Occupation is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      suffix: form.suffix.trim() || undefined,
      birthDate: form.birthDate,
      sex: form.sex,
      civilStatus: form.civilStatus,
      purok: form.purok,
      addressLine: form.addressLine.trim(),
      householdId: form.householdId || undefined,
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim() || undefined,
      occupation: form.occupation.trim(),
      isRegisteredVoter: form.isRegisteredVoter,
      voterPrecinct: form.isRegisteredVoter
        ? form.voterPrecinct.trim() || undefined
        : undefined,
      residencyStartYear: Number(form.residencyStartYear) || 2020,
      sectoralTags: form.sectoralTags,
      verificationStatus: form.verificationStatus,
      notes: form.notes.trim() || undefined,
    };

    if (editingId) {
      updateResident(editingId, payload, actorMeta);
      if (selectedResident?.id === editingId) {
        setSelectedResident({ ...selectedResident, ...payload });
      }
      showToast({
        title: 'Resident record updated',
        message: `${payload.firstName} ${payload.lastName} saved.`,
        tone: 'success',
      });
    } else {
      const created = addResident(payload, actorMeta);
      showToast({
        title: 'Resident registered',
        message: `${created.residentCode} — ${formatResidentFullName(created)} added.`,
        tone: 'success',
      });
    }

    setFormOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Resident Code',
      'Full Name',
      'Age',
      'Sex',
      'Civil Status',
      'Purok',
      'Address',
      'Voter',
      'Sectors',
      'Status',
    ];
    const lines = filteredRows.map((r) => [
      r.residentCode,
      `"${formatResidentFullName(r)}"`,
      computeResidentAge(r.birthDate),
      r.sex,
      r.civilStatus,
      r.purok,
      `"${r.addressLine}"`,
      r.isRegisteredVoter ? 'Yes' : 'No',
      `"${r.sectoralTags.join('; ')}"`,
      r.status,
    ]);
    const csv = [headers, ...lines].map((cols) => cols.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bis-residents-directory.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Residents directory exported',
      message: `${filteredRows.length} resident rows written to CSV.`,
      tone: 'accent',
    });
  };

  const columns: DataTableColumn<ResidentRecord>[] = [
    {
      key: 'residentCode',
      header: 'Resident ID',
      sortable: true,
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.residentCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Resident',
      sortable: true,
      render: (row) => (
        <div className="min-w-[170px]">
          <p className="font-medium text-bis-text">
            {formatResidentFullName(row)}
          </p>
          <p className="text-[11px] text-bis-muted">
            {computeResidentAge(row.birthDate)} yrs • {row.sex} • {row.civilStatus}
          </p>
        </div>
      ),
    },
    {
      key: 'purok',
      header: 'Purok & Address',
      sortable: true,
      render: (row) => (
        <div className="min-w-[150px]">
          <p className="font-medium text-bis-text">{row.purok}</p>
          <p className="max-w-[200px] truncate text-[11px] text-bis-muted">
            {row.addressLine}
          </p>
        </div>
      ),
    },
    {
      key: 'household',
      header: 'Household / Voter',
      render: (row) => {
        const hh = db.households.find((h) => h.id === row.householdId);
        return (
          <div className="space-y-0.5 text-xs">
            <p className="font-mono text-[11px] text-bis-text">
              {hh ? hh.householdCode : 'Unassigned'}
            </p>
            <p className="text-[11px] text-bis-muted">
              {row.isRegisteredVoter
                ? `Voter (${row.voterPrecinct ?? 'Verified'})`
                : 'Non-voter'}
            </p>
          </div>
        );
      },
    },
    {
      key: 'sectoralTags',
      header: 'Classifications',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[190px]">
          {row.sectoralTags.length > 0 ? (
            row.sectoralTags.map((tag) => (
              <StatusBadge key={tag} label={tag} tone="neutral" dot={false} />
            ))
          ) : (
            <span className="text-xs text-bis-muted">General</span>
          )}
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      header: 'Status',
      render: (row) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge
            label={row.status === 'Archived' ? 'Archived' : row.verificationStatus}
            tone={
              row.status === 'Archived'
                ? 'neutral'
                : VERIFICATION_TONE[row.verificationStatus]
            }
          />
        </div>
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
            onClick={() => setSelectedResident(row)}
            className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text transition-colors hover:bg-bis-surface-subtle"
          >
            <Eye className="h-3 w-3" />
            <span>Profile</span>
          </button>

          {allowManage && (
            <button
              type="button"
              onClick={() => openEditModal(row)}
              aria-label={`Edit ${formatResidentFullName(row)}`}
              className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted transition-colors hover:bg-bis-surface-subtle hover:text-bis-text"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          {allowManage &&
            (row.status === 'Active' ? (
              <button
                type="button"
                onClick={() => setArchiveTarget(row)}
                aria-label={`Archive ${formatResidentFullName(row)}`}
                className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-danger transition-colors hover:bg-bis-danger-soft"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  restoreResident(row.id, actorMeta);
                  showToast({
                    title: 'Resident restored',
                    message: `${formatResidentFullName(row)} returned to Active registry.`,
                    tone: 'success',
                  });
                }}
                aria-label={`Restore ${formatResidentFullName(row)}`}
                className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-accent transition-colors hover:bg-bis-accent-soft"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            ))}
        </div>
      ),
    },
  ];

  const liveSelectedResident = selectedResident
    ? db.residents.find((r) => r.id === selectedResident.id) ?? selectedResident
    : null;

  const linkedHousehold = liveSelectedResident?.householdId
    ? db.households.find((h) => h.id === liveSelectedResident.householdId)
    : undefined;

  const linkedCertificates = liveSelectedResident
    ? db.certificates.filter((c) => c.residentId === liveSelectedResident.id)
    : [];

  const linkedBlotter = liveSelectedResident
    ? db.blotterRecords.filter(
        (b) =>
          b.complainantResidentId === liveSelectedResident.id ||
          b.respondentResidentId === liveSelectedResident.id ||
          b.complainantName
            .toLowerCase()
            .includes(liveSelectedResident.lastName.toLowerCase()) ||
          b.respondentName
            .toLowerCase()
            .includes(liveSelectedResident.lastName.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Community Records"
        title="Residents Registry"
        subtitle="Master directory of barangay inhabitants, demographic attributes, and household tagging."
        actions={
          <>
            <AppButton
              variant="outline"
              startIcon={<Download className="h-4 w-4" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </AppButton>
            {allowManage && (
              <AppButton
                variant="primary"
                startIcon={<UserPlus className="h-4 w-4" />}
                onClick={openCreateModal}
              >
                Register Resident
              </AppButton>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>

      <SectionCard
        title="Resident Directory"
        subtitle="Click any resident row to inspect full civil profile, household, and transaction history."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search name, ID, address..."
              aria-label="Search residents"
              containerClassName="w-56 sm:w-64"
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bis-border bg-bis-surface-subtle px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Filter by status"
              className="inline-flex rounded-lg border border-bis-border bg-bis-surface p-0.5"
            >
              {(['Active', 'Archived', 'All'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === tab
                      ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
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

            <FilterSelect
              label="Filter by Sector"
              value={sectorFilter}
              onChange={setSectorFilter}
              options={[
                { value: 'All', label: 'All Sectors' },
                ...SECTOR_OPTIONS.map((s) => ({ value: s, label: s })),
              ]}
            />

            <FilterSelect
              label="Filter by Verification"
              value={verificationFilter}
              onChange={setVerificationFilter}
              options={[
                { value: 'All', label: 'All Verifications' },
                { value: 'Verified', label: 'Verified' },
                { value: 'Pending ID', label: 'Pending ID' },
                { value: 'For Renewal', label: 'For Renewal' },
              ]}
            />
          </div>

          {(search ||
            purokFilter !== 'All' ||
            sectorFilter !== 'All' ||
            verificationFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPurokFilter('All');
                setSectorFilter('All');
                setVerificationFilter('All');
              }}
              className="text-xs font-medium text-bis-accent hover:underline dark:text-[#93B9E6]"
            >
              Clear filters
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          rows={paginatedRows}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setSelectedResident(r)}
          sortKey={sortKey}
          sortDirection={sortDir}
          onSort={handleSort}
          emptyTitle="No matching resident records"
          emptyDescription="Adjust search keywords or filter criteria, or register a new resident."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filteredRows.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="residents"
            />
          }
        />
      </SectionCard>

      {/* Resident Profile Drawer */}
      <RecordDrawer
        open={Boolean(liveSelectedResident)}
        onClose={() => setSelectedResident(null)}
        eyebrow={liveSelectedResident?.residentCode}
        title={
          liveSelectedResident
            ? formatResidentFullName(liveSelectedResident)
            : ''
        }
        subtitle={
          liveSelectedResident
            ? `${liveSelectedResident.purok} • ${liveSelectedResident.addressLine}`
            : undefined
        }
        badge={
          liveSelectedResident && (
            <StatusBadge
              label={
                liveSelectedResident.status === 'Archived'
                  ? 'Archived'
                  : liveSelectedResident.verificationStatus
              }
              tone={
                liveSelectedResident.status === 'Archived'
                  ? 'neutral'
                  : VERIFICATION_TONE[liveSelectedResident.verificationStatus]
              }
            />
          )
        }
        footer={
          liveSelectedResident && (
            <>
              <AppButton
                variant="outline"
                onClick={() => setSelectedResident(null)}
              >
                Close
              </AppButton>
              {allowManage && (
                <AppButton
                  variant="outline"
                  startIcon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => openEditModal(liveSelectedResident)}
                >
                  Edit Profile
                </AppButton>
              )}
              <AppButton
                variant="primary"
                startIcon={<FilePlus2 className="h-3.5 w-3.5" />}
                onClick={() =>
                  router.push(
                    `/certificates?action=new&residentId=${liveSelectedResident.id}`
                  )
                }
              >
                Request Certificate
              </AppButton>
            </>
          )
        }
      >
        {liveSelectedResident && (
          <div className="space-y-5">
            {liveSelectedResident.status === 'Archived' && (
              <div className="rounded-lg border border-bis-warning/35 bg-bis-warning-soft px-3.5 py-2.5 text-xs text-bis-text">
                <p className="font-semibold">
                  Archived Record ({liveSelectedResident.archivedAt})
                </p>
                <p className="mt-0.5 text-bis-muted">
                  Reason: {liveSelectedResident.archivedReason ?? 'Archived'}
                </p>
              </div>
            )}

            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Personal &amp; Civil Information
              </h3>
              <dl className="grid grid-cols-2 gap-2.5">
                <DetailField
                  label="Age & Sex"
                  value={`${computeResidentAge(liveSelectedResident.birthDate)} yrs • ${liveSelectedResident.sex}`}
                />
                <DetailField
                  label="Birth Date"
                  value={liveSelectedResident.birthDate}
                  mono
                />
                <DetailField
                  label="Civil Status"
                  value={liveSelectedResident.civilStatus}
                />
                <DetailField
                  label="Occupation"
                  value={liveSelectedResident.occupation}
                />
                <DetailField
                  label="Contact Number"
                  value={liveSelectedResident.contactNumber}
                  mono
                />
                <DetailField
                  label="Residency Since"
                  value={`${liveSelectedResident.residencyStartYear}`}
                />
                <DetailField
                  label="Voter Status"
                  value={
                    liveSelectedResident.isRegisteredVoter
                      ? `Registered (${liveSelectedResident.voterPrecinct ?? 'Precinct verified'})`
                      : 'Not Registered'
                  }
                />
                <DetailField
                  label="Registered Date"
                  value={liveSelectedResident.registeredAt}
                  mono
                />
              </dl>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Sectoral Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {liveSelectedResident.sectoralTags.length > 0 ? (
                  liveSelectedResident.sectoralTags.map((tag) => (
                    <StatusBadge key={tag} label={tag} tone="accent" />
                  ))
                ) : (
                  <p className="text-xs text-bis-muted">
                    No sectoral tags assigned.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Linked Household
              </h3>
              {linkedHousehold ? (
                <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-bis-accent dark:text-[#93B9E6]">
                      {linkedHousehold.householdCode}
                    </span>
                    <StatusBadge
                      label={linkedHousehold.dwellingType}
                      tone="neutral"
                      dot={false}
                    />
                  </div>
                  <p className="text-bis-text font-medium">
                    {linkedHousehold.addressLine}
                  </p>
                  <p className="text-bis-muted">
                    Role:{' '}
                    {linkedHousehold.memberRoles[liveSelectedResident.id] ??
                      'Member'}{' '}
                    • {linkedHousehold.memberIds.length} total members
                  </p>
                </div>
              ) : (
                <p className="text-xs text-bis-muted">
                  Not currently tagged to any household.
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Certificates &amp; Blotter Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg border border-bis-border p-3">
                  <p className="font-semibold text-bis-text">
                    Certificates ({linkedCertificates.length})
                  </p>
                  {linkedCertificates.length === 0 ? (
                    <p className="mt-1 text-bis-muted">
                      No certificate requests on file.
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-1">
                      {linkedCertificates.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-bis-muted">
                            {c.trackingCode} — {c.documentType}
                          </span>
                          <StatusBadge label={c.status} tone="neutral" dot={false} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border border-bis-border p-3">
                  <p className="font-semibold text-bis-text">
                    Blotter Involvement ({linkedBlotter.length})
                  </p>
                  {linkedBlotter.length === 0 ? (
                    <p className="mt-1 text-bis-muted">
                      Clean standing — no linked blotter records.
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-1">
                      {linkedBlotter.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-bis-muted">
                            {b.caseNumber} — {b.incidentCategory}
                          </span>
                          <StatusBadge label={b.status} tone="warning" dot={false} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </RecordDrawer>

      {/* Add / Edit Resident Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Resident Record' : 'Register New Resident'}
        subtitle="Complete civil registry details and purok classification."
        eyebrow="Residents Registry"
        maxWidth="md"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-resident-form" variant="primary">
              {editingId ? 'Save Changes' : 'Register Resident'}
            </AppButton>
          </>
        }
      >
        <form
          id="bis-resident-form"
          onSubmit={handleSaveResident}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <FormField
              label="First Name"
              required
              error={errors.firstName}
              className="sm:col-span-1"
            >
              <TextInput
                value={form.firstName}
                hasError={Boolean(errors.firstName)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                placeholder="Juan"
              />
            </FormField>
            <FormField label="Middle Name" className="sm:col-span-1">
              <TextInput
                value={form.middleName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, middleName: e.target.value }))
                }
                placeholder="Vergara"
              />
            </FormField>
            <FormField
              label="Last Name"
              required
              error={errors.lastName}
              className="sm:col-span-1"
            >
              <TextInput
                value={form.lastName}
                hasError={Boolean(errors.lastName)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                placeholder="Dela Cruz"
              />
            </FormField>
            <FormField label="Suffix" className="sm:col-span-1">
              <TextInput
                value={form.suffix}
                onChange={(e) =>
                  setForm((p) => ({ ...p, suffix: e.target.value }))
                }
                placeholder="Jr., III"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Birth Date" required error={errors.birthDate}>
              <TextInput
                type="date"
                value={form.birthDate}
                hasError={Boolean(errors.birthDate)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, birthDate: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Sex" required>
              <SelectInput
                value={form.sex}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sex: e.target.value as SexOption }))
                }
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
              />
            </FormField>
            <FormField label="Civil Status" required>
              <SelectInput
                value={form.civilStatus}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    civilStatus: e.target.value as CivilStatus,
                  }))
                }
                options={[
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Widowed', label: 'Widowed' },
                  { value: 'Separated', label: 'Separated' },
                ]}
              />
            </FormField>
          </div>

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
              label="Street / House Address"
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
                placeholder="Lot 4 Mabini St., Purok 1"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Assign to Household">
              <SelectInput
                value={form.householdId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, householdId: e.target.value }))
                }
                placeholder="Unassigned"
                options={db.households
                  .filter((h) => h.status === 'Active')
                  .map((h) => ({
                    value: h.id,
                    label: `${h.householdCode} (${h.purok})`,
                  }))}
              />
            </FormField>
            <FormField
              label="Contact Number"
              required
              error={errors.contactNumber}
            >
              <TextInput
                value={form.contactNumber}
                hasError={Boolean(errors.contactNumber)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contactNumber: e.target.value }))
                }
                placeholder="0917-000-0100"
              />
            </FormField>
            <FormField label="Occupation" required error={errors.occupation}>
              <TextInput
                value={form.occupation}
                hasError={Boolean(errors.occupation)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, occupation: e.target.value }))
                }
                placeholder="Farmer / Store Owner"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Residency Start Year">
              <TextInput
                type="number"
                min={1940}
                max={2026}
                value={form.residencyStartYear}
                onChange={(e) =>
                  setForm((p) => ({ ...p, residencyStartYear: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Verification Status">
              <SelectInput
                value={form.verificationStatus}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    verificationStatus: e.target
                      .value as ResidentRecord['verificationStatus'],
                  }))
                }
                options={[
                  { value: 'Verified', label: 'Verified' },
                  { value: 'Pending ID', label: 'Pending ID' },
                  { value: 'For Renewal', label: 'For Renewal' },
                ]}
              />
            </FormField>
            <FormField label="Voter Precinct">
              <TextInput
                value={form.voterPrecinct}
                disabled={!form.isRegisteredVoter}
                onChange={(e) =>
                  setForm((p) => ({ ...p, voterPrecinct: e.target.value }))
                }
                placeholder="e.g. 0012A"
              />
            </FormField>
          </div>

          <CheckboxField
            id="res-voter-flag"
            label="Registered Barangay Voter"
            description="Include resident in official barangay electoral voter tally."
            checked={form.isRegisteredVoter}
            onChange={(checked) =>
              setForm((p) => ({ ...p, isRegisteredVoter: checked }))
            }
          />

          <div>
            <p className="mb-1.5 text-xs font-medium text-bis-text">
              Sectoral Classifications
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {SECTOR_OPTIONS.map((sector) => {
                const active = form.sectoralTags.includes(sector);
                return (
                  <CheckboxField
                    key={sector}
                    label={sector}
                    checked={active}
                    onChange={(checked) =>
                      setForm((p) => ({
                        ...p,
                        sectoralTags: checked
                          ? [...p.sectoralTags, sector]
                          : p.sectoralTags.filter((s) => s !== sector),
                      }))
                    }
                  />
                );
              })}
            </div>
          </div>

          <FormField label="Notes / Remarks">
            <TextAreaInput
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional residency or validation notes..."
            />
          </FormField>
        </form>
      </AppModal>

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive Resident Record"
        description={
          archiveTarget
            ? `Archive ${formatResidentFullName(archiveTarget)} (${archiveTarget.residentCode})? Archived residents remain searchable for historical audits and can be restored anytime.`
            : ''
        }
        confirmLabel="Archive Resident"
        tone="danger"
        requireReason
        reasonLabel="Reason for Archiving"
        reasonPlaceholder="e.g., Relocated outside barangay jurisdiction"
        onConfirm={(reason) => {
          if (!archiveTarget) return;
          archiveResident(
            archiveTarget.id,
            reason ?? 'Archived by staff',
            actorMeta
          );
          showToast({
            title: 'Resident archived',
            message: `${archiveTarget.residentCode} moved to Archived status.`,
            tone: 'warning',
          });
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
