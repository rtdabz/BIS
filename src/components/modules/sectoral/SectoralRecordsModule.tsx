'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Pencil,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import {
  AppButton,
  AppModal,
  ConfirmDialog,
  DataTable,
  FilterSelect,
  FormField,
  PageHeader,
  PaginationBar,
  SearchInput,
  SectionCard,
  SelectInput,
  StatusBadge,
  TextAreaInput,
  TextInput,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import { formatResidentFullName } from '@/lib/store/bisSelectors';
import type {
  SectorCategory,
  SectoralRecord,
  SectoralVerificationStatus,
} from '@/types/bis';
import type { StatusTone } from '@/types/dashboard';

const SECTORS: SectorCategory[] = [
  'Senior Citizen',
  'PWD',
  'Solo Parent',
  '4Ps Beneficiary',
  'Youth / KK',
];

const VERIFICATION_TONE: Record<SectoralVerificationStatus, StatusTone> = {
  Verified: 'accent',
  'Pending Validation': 'warning',
  'For Renewal': 'warning',
  Inactive: 'neutral',
};

interface SectoralFormState {
  residentId: string;
  sector: SectorCategory;
  sectorIdNumber: string;
  classificationDetail: string;
  verificationStatus: SectoralVerificationStatus;
  validUntil: string;
  assistanceNotes: string;
}

export function SectoralRecordsModule() {
  const { db, addSectoralRecord, updateSectoralRecord, removeSectoralRecord } =
    useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('sectoral');

  const [activeSector, setActiveSector] = React.useState<'All' | SectorCategory>('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<SectoralFormState>({
    residentId: '',
    sector: 'Senior Citizen',
    sectorIdNumber: '',
    classificationDetail: '',
    verificationStatus: 'Verified',
    validUntil: '2028-12-31',
    assistanceNotes: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = React.useState<SectoralRecord | null>(null);

  const sectorCounts = React.useMemo(() => {
    const map: Record<SectorCategory, { total: number; verified: number }> = {
      'Senior Citizen': { total: 0, verified: 0 },
      PWD: { total: 0, verified: 0 },
      'Solo Parent': { total: 0, verified: 0 },
      '4Ps Beneficiary': { total: 0, verified: 0 },
      'Youth / KK': { total: 0, verified: 0 },
    };
    db.sectoralRecords.forEach((rec) => {
      map[rec.sector].total += 1;
      if (rec.verificationStatus === 'Verified') map[rec.sector].verified += 1;
    });
    return map;
  }, [db.sectoralRecords]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.sectoralRecords.filter((rec) => {
      if (activeSector !== 'All' && rec.sector !== activeSector) return false;
      if (statusFilter !== 'All' && rec.verificationStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const res = db.residents.find((r) => r.id === rec.residentId);
      const name = res ? formatResidentFullName(res).toLowerCase() : '';
      return (
        name.includes(q) ||
        rec.recordCode.toLowerCase().includes(q) ||
        rec.sectorIdNumber.toLowerCase().includes(q) ||
        rec.classificationDetail.toLowerCase().includes(q)
      );
    });
  }, [activeSector, db.residents, db.sectoralRecords, search, statusFilter]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const openEnrollModal = () => {
    setEditingId(null);
    setForm({
      residentId: db.residents.find((r) => r.status === 'Active')?.id ?? '',
      sector: activeSector === 'All' ? 'Senior Citizen' : activeSector,
      sectorIdNumber: '',
      classificationDetail: '',
      verificationStatus: 'Pending Validation',
      validUntil: '2028-12-31',
      assistanceNotes: '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (rec: SectoralRecord) => {
    setEditingId(rec.id);
    setForm({
      residentId: rec.residentId,
      sector: rec.sector,
      sectorIdNumber: rec.sectorIdNumber,
      classificationDetail: rec.classificationDetail,
      verificationStatus: rec.verificationStatus,
      validUntil: rec.validUntil ?? '',
      assistanceNotes: rec.assistanceNotes ?? '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.residentId) nextErrors.residentId = 'Select a resident.';
    if (!form.sectorIdNumber.trim()) {
      nextErrors.sectorIdNumber = 'Sector ID / reference number is required.';
    }
    if (!form.classificationDetail.trim()) {
      nextErrors.classificationDetail = 'Classification detail is required.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingId) {
      updateSectoralRecord(
        editingId,
        {
          sector: form.sector,
          sectorIdNumber: form.sectorIdNumber.trim(),
          classificationDetail: form.classificationDetail.trim(),
          verificationStatus: form.verificationStatus,
          validUntil: form.validUntil || undefined,
          assistanceNotes: form.assistanceNotes.trim() || undefined,
        },
        actorMeta
      );
      showToast({
        title: 'Sectoral record updated',
        message: `${form.sector} membership updated.`,
        tone: 'success',
      });
    } else {
      const created = addSectoralRecord(
        {
          residentId: form.residentId,
          sector: form.sector,
          sectorIdNumber: form.sectorIdNumber.trim(),
          classificationDetail: form.classificationDetail.trim(),
          verificationStatus: form.verificationStatus,
          validUntil: form.validUntil || undefined,
          assistanceNotes: form.assistanceNotes.trim() || undefined,
        },
        actorMeta
      );
      showToast({
        title: 'Sectoral enrollment saved',
        message: `${created.recordCode} enrolled under ${created.sector}.`,
        tone: 'success',
      });
    }

    setFormOpen(false);
  };

  const columns: DataTableColumn<SectoralRecord>[] = [
    {
      key: 'recordCode',
      header: 'Record ID',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.recordCode}
        </span>
      ),
    },
    {
      key: 'resident',
      header: 'Resident Name',
      render: (row) => {
        const res = db.residents.find((r) => r.id === row.residentId);
        return (
          <div className="min-w-[160px]">
            <p className="font-medium text-bis-text">
              {res ? formatResidentFullName(res) : 'Unknown Resident'}
            </p>
            <p className="text-[11px] text-bis-muted">
              {res ? `${res.purok} • ${res.residentCode}` : row.residentId}
            </p>
          </div>
        );
      },
    },
    {
      key: 'sector',
      header: 'Sector & Official ID',
      render: (row) => (
        <div>
          <StatusBadge label={row.sector} tone="accent" dot={false} />
          <p className="mt-1 font-mono text-[11px] text-bis-muted">
            {row.sectorIdNumber}
          </p>
        </div>
      ),
    },
    {
      key: 'classificationDetail',
      header: 'Classification & Notes',
      render: (row) => (
        <div className="max-w-[240px]">
          <p className="font-medium text-bis-text">{row.classificationDetail}</p>
          {row.assistanceNotes && (
            <p className="truncate text-[11px] text-bis-muted">
              {row.assistanceNotes}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'validUntil',
      header: 'Validity',
      className: 'whitespace-nowrap text-xs font-mono text-bis-muted',
      render: (row) => row.validUntil ?? 'Ongoing',
    },
    {
      key: 'verificationStatus',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={row.verificationStatus}
          tone={VERIFICATION_TONE[row.verificationStatus]}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (row) =>
        allowManage ? (
          <div className="inline-flex items-center justify-end gap-1">
            {row.verificationStatus !== 'Verified' && (
              <button
                type="button"
                onClick={() => {
                  updateSectoralRecord(
                    row.id,
                    { verificationStatus: 'Verified' },
                    actorMeta
                  );
                  showToast({
                    title: 'Sectoral record verified',
                    message: `${row.sectorIdNumber} marked Verified.`,
                    tone: 'success',
                  });
                }}
                className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-accent hover:bg-bis-accent-soft dark:text-[#93B9E6]"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Verify</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => openEditModal(row)}
              aria-label={`Edit ${row.recordCode}`}
              className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row)}
              aria-label={`Remove ${row.recordCode}`}
              className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-danger hover:bg-bis-danger-soft"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Community Records"
        title="Sectoral Records & Classifications"
        subtitle="Manage OSCA Senior Citizens, PDAO PWDs, Solo Parents, 4Ps Beneficiaries, and Youth/KK registries."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<UserPlus className="h-4 w-4" />}
              onClick={openEnrollModal}
            >
              Enroll Resident in Sector
            </AppButton>
          )
        }
      />

      {/* Sector Selector Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <button
          type="button"
          onClick={() => setActiveSector('All')}
          className={`rounded-[10px] border p-3.5 text-left transition-colors ${
            activeSector === 'All'
              ? 'border-bis-accent bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
              : 'border-bis-border bg-bis-surface hover:border-bis-border-strong'
          }`}
        >
          <p
            className={`text-xs font-medium ${
              activeSector === 'All' ? 'text-white/80' : 'text-bis-muted'
            }`}
          >
            All Sectors
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {db.sectoralRecords.length}
          </p>
          <p
            className={`mt-1 text-[11px] ${
              activeSector === 'All' ? 'text-white/80' : 'text-bis-muted'
            }`}
          >
            Combined entries
          </p>
        </button>

        {SECTORS.map((sec) => {
          const active = activeSector === sec;
          const counts = sectorCounts[sec];
          return (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSector(sec)}
              className={`rounded-[10px] border p-3.5 text-left transition-colors ${
                active
                  ? 'border-bis-accent bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                  : 'border-bis-border bg-bis-surface hover:border-bis-border-strong'
              }`}
            >
              <p
                className={`truncate text-xs font-medium ${
                  active ? 'text-white/80' : 'text-bis-muted'
                }`}
              >
                {sec}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {counts.total}
              </p>
              <p
                className={`mt-1 text-[11px] ${
                  active ? 'text-white/80' : 'text-bis-muted'
                }`}
              >
                {counts.verified} verified
              </p>
            </button>
          );
        })}
      </div>

      <SectionCard
        title={
          activeSector === 'All'
            ? 'All Sectoral Memberships'
            : `${activeSector} Registry`
        }
        subtitle="Resident sectoral affiliations, official ID references, and validation states."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search resident, ID #, detail..."
              aria-label="Search sectoral records"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Verification Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Verified', label: 'Verified' },
                { value: 'Pending Validation', label: 'Pending Validation' },
                { value: 'For Renewal', label: 'For Renewal' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          emptyTitle="No sectoral records found"
          emptyDescription="Select another sector tab or enroll a qualifying resident."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="sectoral records"
            />
          }
        />
      </SectionCard>

      {/* Enroll / Edit Sectoral Record Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Update Sectoral Record' : 'Enroll Resident in Sector'}
        eyebrow="Sectoral Records"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              form="bis-sectoral-form"
              variant="primary"
              startIcon={<UserCheck className="h-4 w-4" />}
            >
              {editingId ? 'Save Changes' : 'Save Enrollment'}
            </AppButton>
          </>
        }
      >
        <form id="bis-sectoral-form" onSubmit={handleSave} className="space-y-4">
          <FormField label="Resident" required error={errors.residentId}>
            <SelectInput
              value={form.residentId}
              disabled={Boolean(editingId)}
              hasError={Boolean(errors.residentId)}
              onChange={(e) =>
                setForm((p) => ({ ...p, residentId: e.target.value }))
              }
              placeholder="Select resident..."
              options={db.residents
                .filter((r) => r.status === 'Active')
                .map((r) => ({
                  value: r.id,
                  label: `${formatResidentFullName(r)} (${r.residentCode} • ${r.purok})`,
                }))}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Sector" required>
              <SelectInput
                value={form.sector}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    sector: e.target.value as SectorCategory,
                  }))
                }
                options={SECTORS.map((s) => ({ value: s, label: s }))}
              />
            </FormField>
            <FormField
              label="Official Sector ID #"
              required
              error={errors.sectorIdNumber}
            >
              <TextInput
                value={form.sectorIdNumber}
                hasError={Boolean(errors.sectorIdNumber)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sectorIdNumber: e.target.value }))
                }
                placeholder="e.g. OSCA-BK-0190"
              />
            </FormField>
          </div>

          <FormField
            label="Classification / Sub-Category"
            required
            error={errors.classificationDetail}
          >
            <TextInput
              value={form.classificationDetail}
              hasError={Boolean(errors.classificationDetail)}
              onChange={(e) =>
                setForm((p) => ({ ...p, classificationDetail: e.target.value }))
              }
              placeholder="e.g. Orthopedic Disability / OSCA Pensioner"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Verification Status">
              <SelectInput
                value={form.verificationStatus}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    verificationStatus: e.target
                      .value as SectoralVerificationStatus,
                  }))
                }
                options={[
                  { value: 'Verified', label: 'Verified' },
                  { value: 'Pending Validation', label: 'Pending Validation' },
                  { value: 'For Renewal', label: 'For Renewal' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
            </FormField>
            <FormField label="ID Valid Until">
              <TextInput
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm((p) => ({ ...p, validUntil: e.target.value }))
                }
              />
            </FormField>
          </div>

          <FormField label="Assistance / Referral Notes">
            <TextAreaInput
              rows={2}
              value={form.assistanceNotes}
              onChange={(e) =>
                setForm((p) => ({ ...p, assistanceNotes: e.target.value }))
              }
              placeholder="Medical abstract, AICS endorsement, or renewal notes..."
            />
          </FormField>
        </form>
      </AppModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove Sectoral Record"
        description={
          deleteTarget
            ? `Remove ${deleteTarget.recordCode} (${deleteTarget.sector})? This updates the resident's sectoral classification tags.`
            : ''
        }
        confirmLabel="Remove Record"
        tone="danger"
        onConfirm={() => {
          if (!deleteTarget) return;
          removeSectoralRecord(deleteTarget.id, actorMeta);
          showToast({
            title: 'Sectoral record removed',
            message: `${deleteTarget.recordCode} removed.`,
            tone: 'warning',
          });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
