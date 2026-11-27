'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Eye,
  Printer,
  ShieldPlus,
} from 'lucide-react';
import {
  AppButton,
  AppModal,
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
  TextAreaInput,
  TextInput,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { PUROK_LIST } from '@/data/mock/bisSeedResidents';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import { formatResidentFullName, isActiveBlotter } from '@/lib/store/bisSelectors';
import type {
  BlotterIncidentCategory,
  BlotterRecord,
  BlotterStatus,
  PurokName,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const BLOTTER_CATEGORIES: BlotterIncidentCategory[] = [
  'Boundary / Property Dispute',
  'Noise & Curfew Ordinance',
  'Financial / Debt Conciliation',
  'Domestic & Minor Altercations',
  'Trespassing / Damage',
  'Other Lupon Matter',
];

const STATUS_TONE: Record<BlotterStatus, StatusTone> = {
  Filed: 'warning',
  'Summons Issued': 'warning',
  Mediation: 'danger',
  'Amicably Settled': 'accent',
  'CFA Issued': 'neutral',
  Dismissed: 'neutral',
};

export function BlotterModule() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const initialAction = searchParams.get('action') ?? '';
  return (
    <BlotterModuleInner
      key={`${initialSearch}|${initialAction}`}
      initialSearch={initialSearch}
      initialAction={initialAction}
    />
  );
}

function BlotterModuleInner({
  initialSearch,
  initialAction,
}: {
  initialSearch: string;
  initialAction: string;
}) {
  const { db, createBlotter, transitionBlotterStatus, updateBlotter } =
    useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('blotter');

  const [search, setSearch] = React.useState(initialSearch);
  const [statusFilter, setStatusFilter] = React.useState<'All' | BlotterStatus>('All');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [printCase, setPrintCase] = React.useState<BlotterRecord | null>(null);
  const [createOpen, setCreateOpen] = React.useState(
    () => initialAction === 'new' && allowManage
  );

  // Create Blotter form
  const [complainantResidentId, setComplainantResidentId] = React.useState('');
  const [complainantName, setComplainantName] = React.useState('');
  const [respondentResidentId, setRespondentResidentId] = React.useState('');
  const [respondentName, setRespondentName] = React.useState('');
  const [purok, setPurok] = React.useState<PurokName>('Purok 1');
  const [incidentCategory, setIncidentCategory] =
    React.useState<BlotterIncidentCategory>('Boundary / Property Dispute');
  const [incidentDate, setIncidentDate] = React.useState('2026-11-27');
  const [incidentLocation, setIncidentLocation] = React.useState('');
  const [narrative, setNarrative] = React.useState('');
  const [nextHearingDate, setNextHearingDate] = React.useState('2026-12-01 14:00');
  const [hearingVenue, setHearingVenue] = React.useState('Session Hall B');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Progress & Status update inside drawer
  const [nextStatus, setNextStatus] = React.useState<BlotterStatus>('Mediation');
  const [proceedingNote, setProceedingNote] = React.useState('');
  const [settlementTerms, setSettlementTerms] = React.useState('');
  const [rescheduleHearing, setRescheduleHearing] = React.useState('');

  const activeCount = db.blotterRecords.filter(isActiveBlotter).length;
  const settledCount = db.blotterRecords.filter(
    (b) => b.status === 'Amicably Settled'
  ).length;
  const cfaCount = db.blotterRecords.filter((b) => b.status === 'CFA Issued').length;

  const stats: StatMetric[] = [
    {
      id: 'blt-active',
      label: 'Active Lupon Cases',
      value: activeCount,
      formattedValue: String(activeCount),
      icon: 'ShieldAlert',
      changeLabel: 'Mediation',
      changeContext: 'open summons & hearings',
      trend: 'neutral',
      tone: activeCount > 0 ? 'danger' : 'accent',
      href: '/blotter',
    },
    {
      id: 'blt-settled',
      label: 'Amicably Settled',
      value: settledCount,
      formattedValue: String(settledCount),
      icon: 'Scale',
      changeLabel: `${Math.round((settledCount / Math.max(1, db.blotterRecords.length)) * 100)}%`,
      changeContext: 'resolved via Kasunduan',
      trend: 'up',
      tone: 'success',
      href: '/blotter',
    },
    {
      id: 'blt-cfa',
      label: 'CFA Endorsed',
      value: cfaCount,
      formattedValue: String(cfaCount),
      icon: 'FileText',
      changeLabel: 'Court action',
      changeContext: 'Certificate to File Action',
      trend: 'neutral',
      tone: 'accent',
      href: '/blotter',
    },
    {
      id: 'blt-total',
      label: 'Total Docket Entries',
      value: db.blotterRecords.length,
      formattedValue: String(db.blotterRecords.length),
      icon: 'History',
      changeLabel: '2026',
      changeContext: 'Katarungang Pambarangay log',
      trend: 'up',
      tone: 'accent',
      href: '/blotter',
    },
  ];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.blotterRecords.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && b.incidentCategory !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        b.caseNumber.toLowerCase().includes(q) ||
        b.complainantName.toLowerCase().includes(q) ||
        b.respondentName.toLowerCase().includes(q) ||
        b.incidentLocation.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, db.blotterRecords, search, statusFilter]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const selected = selectedId
    ? db.blotterRecords.find((b) => b.id === selectedId) ?? null
    : null;

  const openBlotterDrawer = (row: BlotterRecord) => {
    setSelectedId(row.id);
    setNextStatus(row.status);
    setSettlementTerms(row.settlementTerms ?? '');
    setRescheduleHearing(row.nextHearingDate ?? '');
    setProceedingNote('');
  };

  const handleOpenCreate = () => {
    setComplainantResidentId('');
    setComplainantName('');
    setRespondentResidentId('');
    setRespondentName('');
    setPurok('Purok 1');
    setIncidentCategory('Boundary / Property Dispute');
    setIncidentDate('2026-11-27');
    setIncidentLocation('');
    setNarrative('');
    setNextHearingDate('2026-12-01 14:00');
    setHearingVenue('Session Hall B');
    setErrors({});
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!complainantName.trim()) errs.complainantName = 'Complainant is required.';
    if (!respondentName.trim()) errs.respondentName = 'Respondent is required.';
    if (!incidentLocation.trim()) errs.incidentLocation = 'Incident location is required.';
    if (!narrative.trim()) errs.narrative = 'Incident narrative is required.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const created = createBlotter(
      {
        complainantResidentId: complainantResidentId || undefined,
        complainantName: complainantName.trim(),
        respondentResidentId: respondentResidentId || undefined,
        respondentName: respondentName.trim(),
        purok,
        incidentCategory,
        incidentDate,
        incidentLocation: incidentLocation.trim(),
        narrative: narrative.trim(),
        presidingOfficer: db.settings.signatories.luponChair,
        nextHearingDate: nextHearingDate.trim() || undefined,
        hearingVenue: hearingVenue.trim() || undefined,
        status: 'Filed',
      },
      actorMeta
    );

    showToast({
      title: 'Blotter case registered',
      message: `${created.caseNumber} docketed under Lupon Tagapamayapa.`,
      tone: 'warning',
    });
    setCreateOpen(false);
  };

  const handlePrintCase = (record: BlotterRecord) => {
    setPrintCase(record);
    window.setTimeout(() => {
      document.body.dataset.bisPrinting = 'true';
      const cleanup = () => {
        delete document.body.dataset.bisPrinting;
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      window.print();
    }, 120);
  };

  const columns: DataTableColumn<BlotterRecord>[] = [
    {
      key: 'caseNumber',
      header: 'Case #',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.caseNumber}
        </span>
      ),
    },
    {
      key: 'parties',
      header: 'Complainant vs. Respondent',
      render: (row) => (
        <div className="min-w-[190px]">
          <p className="font-medium text-bis-text">{row.complainantName}</p>
          <p className="text-[11px] text-bis-muted">vs. {row.respondentName}</p>
        </div>
      ),
    },
    {
      key: 'incidentCategory',
      header: 'Category & Location',
      render: (row) => (
        <div className="min-w-[175px]">
          <p className="font-medium text-bis-text">{row.incidentCategory}</p>
          <p className="text-[11px] text-bis-muted">
            {row.purok} • {row.incidentLocation}
          </p>
        </div>
      ),
    },
    {
      key: 'nextHearingDate',
      header: 'Hearing / Incident Date',
      className: 'whitespace-nowrap text-xs',
      render: (row) => (
        <div>
          <p className="font-mono text-bis-text">
            {row.nextHearingDate ?? row.incidentDate}
          </p>
          <p className="text-[11px] text-bis-muted">{row.presidingOfficer}</p>
        </div>
      ),
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
            onClick={() => setPrintCase(row)}
            aria-label={`Print ${row.caseNumber}`}
            className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text hover:bg-bis-surface-subtle"
          >
            <Printer className="h-3 w-3" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={() => openBlotterDrawer(row)}
            className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-accent hover:bg-bis-accent-soft dark:text-[#93B9E6]"
          >
            <Eye className="h-3 w-3" />
            <span>Docket</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Transactions"
        title="Blotter Records & Lupon Docket"
        subtitle="Katarungang Pambarangay incident registration, summons hearings, mediation logs, and printable records."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<ShieldPlus className="h-4 w-4" />}
              onClick={handleOpenCreate}
            >
              Register Blotter Case
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
        title="Blotter Case Registry"
        subtitle="Select a case to inspect proceedings, schedule hearings, record settlement, or print official extract."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search case #, complainant, respondent..."
              aria-label="Search blotter records"
              containerClassName="w-56 sm:w-64"
            />
            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'All', label: 'All Categories' },
                ...BLOTTER_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bis-border bg-bis-surface-subtle px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                'All',
                'Filed',
                'Summons Issued',
                'Mediation',
                'Amicably Settled',
                'CFA Issued',
                'Dismissed',
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab
                    ? 'border border-bis-border bg-bis-surface text-bis-text shadow-[var(--bis-shadow-sm)]'
                    : 'text-bis-muted hover:text-bis-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs text-bis-muted">{filtered.length} cases</span>
        </div>

        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          onRowClick={(r) => openBlotterDrawer(r)}
          emptyTitle="No matching blotter cases"
          emptyDescription="Adjust filters or register a new Lupon blotter case."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="blotter cases"
            />
          }
        />
      </SectionCard>

      {/* Case Docket Drawer */}
      <RecordDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        eyebrow={selected?.caseNumber}
        title={selected?.incidentCategory ?? ''}
        subtitle={
          selected
            ? `${selected.purok} • ${selected.incidentLocation}`
            : undefined
        }
        badge={
          selected && (
            <StatusBadge
              label={selected.status}
              tone={STATUS_TONE[selected.status]}
            />
          )
        }
        footer={
          selected && (
            <>
              <AppButton variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </AppButton>
              <AppButton
                variant="primary"
                startIcon={<Printer className="h-3.5 w-3.5" />}
                onClick={() => setPrintCase(selected)}
              >
                Print Blotter Sheet
              </AppButton>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField label="Complainant" value={selected.complainantName} />
              <DetailField label="Respondent" value={selected.respondentName} />
              <DetailField
                label="Incident Date"
                value={selected.incidentDate}
                mono
              />
              <DetailField
                label="Presiding Officer"
                value={selected.presidingOfficer}
              />
              <DetailField
                label="Next Hearing"
                value={selected.nextHearingDate ?? 'None scheduled'}
                mono
              />
              <DetailField
                label="Venue"
                value={selected.hearingVenue ?? 'Session Hall B'}
              />
            </dl>

            <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3.5 text-xs space-y-2">
              <p className="font-semibold text-bis-text">Incident Narrative</p>
              <p className="leading-relaxed text-bis-muted">
                {selected.narrative}
              </p>
              {selected.settlementTerms && (
                <div className="border-t border-bis-border pt-2">
                  <p className="font-semibold text-bis-text">
                    Settlement / Disposition Terms
                  </p>
                  <p className="mt-0.5 text-bis-muted">
                    {selected.settlementTerms}
                  </p>
                </div>
              )}
            </div>

            {allowManage && (
              <div className="rounded-[10px] border border-bis-border bg-bis-surface-subtle p-3.5 space-y-3">
                <p className="text-xs font-semibold text-bis-text">
                  Update Case Progress &amp; Lupon Hearing
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <FormField label="Case Status">
                    <SelectInput
                      value={nextStatus}
                      onChange={(e) =>
                        setNextStatus(e.target.value as BlotterStatus)
                      }
                      options={[
                        { value: 'Filed', label: 'Filed' },
                        { value: 'Summons Issued', label: 'Summons Issued' },
                        { value: 'Mediation', label: 'Mediation' },
                        { value: 'Amicably Settled', label: 'Amicably Settled' },
                        { value: 'CFA Issued', label: 'CFA Issued' },
                        { value: 'Dismissed', label: 'Dismissed' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Next Hearing Schedule">
                    <TextInput
                      value={rescheduleHearing}
                      onChange={(e) => setRescheduleHearing(e.target.value)}
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                  </FormField>
                </div>

                {(nextStatus === 'Amicably Settled' ||
                  nextStatus === 'CFA Issued' ||
                  nextStatus === 'Dismissed') && (
                  <FormField label="Settlement / Resolution Terms">
                    <TextAreaInput
                      rows={2}
                      value={settlementTerms}
                      onChange={(e) => setSettlementTerms(e.target.value)}
                      placeholder="Document Kasunduan agreement or CFA issuance basis..."
                    />
                  </FormField>
                )}

                <FormField label="Proceeding Minutes / Note">
                  <TextAreaInput
                    rows={2}
                    value={proceedingNote}
                    onChange={(e) => setProceedingNote(e.target.value)}
                    placeholder="Record summons service, hearing attendance, or outcome..."
                  />
                </FormField>

                <AppButton
                  variant="primary"
                  size="sm"
                  startIcon={<Calendar className="h-3.5 w-3.5" />}
                  onClick={() => {
                    if (rescheduleHearing !== (selected.nextHearingDate ?? '')) {
                      updateBlotter(
                        selected.id,
                        { nextHearingDate: rescheduleHearing || undefined },
                        undefined,
                        actorMeta
                      );
                    }
                    transitionBlotterStatus(
                      selected.id,
                      nextStatus,
                      proceedingNote.trim() || `Docket updated to ${nextStatus}`,
                      settlementTerms.trim() || undefined,
                      actorMeta
                    );
                    showToast({
                      title: `${selected.caseNumber} updated`,
                      message: `Case status set to ${nextStatus}.`,
                      tone: 'success',
                    });
                    setProceedingNote('');
                  }}
                >
                  Save Proceeding Update
                </AppButton>
              </div>
            )}

            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Lupon Proceedings Log
              </h3>
              <ol className="space-y-2.5 border-l border-bis-border pl-4 ml-1.5">
                {selected.proceedings.map((p, i) => (
                  <li key={`${p.date}-${i}`} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-bis-text">
                        {p.action}
                      </span>
                      <span className="font-mono text-[10.5px] text-bis-muted">
                        {p.date}
                      </span>
                    </div>
                    <p className="text-bis-muted">{p.officer}</p>
                    <p className="mt-0.5 text-bis-text">{p.notes}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </RecordDrawer>

      {/* Register Blotter Case Modal */}
      <AppModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Register Blotter Case"
        subtitle="Log incident under Katarungang Pambarangay docket."
        eyebrow="Blotter Records"
        maxWidth="md"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-blotter-form" variant="primary">
              Register Case
            </AppButton>
          </>
        }
      >
        <form
          id="bis-blotter-form"
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Link Complainant Resident (Optional)">
              <SelectInput
                value={complainantResidentId}
                onChange={(e) => {
                  const id = e.target.value;
                  setComplainantResidentId(id);
                  const r = db.residents.find((x) => x.id === id);
                  if (r) {
                    setComplainantName(formatResidentFullName(r));
                    setPurok(r.purok);
                  }
                }}
                placeholder="Walk-in / Manual entry"
                options={db.residents
                  .filter((r) => r.status === 'Active')
                  .map((r) => ({
                    value: r.id,
                    label: `${formatResidentFullName(r)} (${r.purok})`,
                  }))}
              />
            </FormField>
            <FormField label="Link Respondent Resident (Optional)">
              <SelectInput
                value={respondentResidentId}
                onChange={(e) => {
                  const id = e.target.value;
                  setRespondentResidentId(id);
                  const r = db.residents.find((x) => x.id === id);
                  if (r) setRespondentName(formatResidentFullName(r));
                }}
                placeholder="Manual entry / Non-resident"
                options={db.residents
                  .filter((r) => r.status === 'Active')
                  .map((r) => ({
                    value: r.id,
                    label: `${formatResidentFullName(r)} (${r.purok})`,
                  }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="Complainant Name"
              required
              error={errors.complainantName}
            >
              <TextInput
                value={complainantName}
                hasError={Boolean(errors.complainantName)}
                onChange={(e) => setComplainantName(e.target.value)}
                placeholder="Complainant full name"
              />
            </FormField>
            <FormField
              label="Respondent Name"
              required
              error={errors.respondentName}
            >
              <TextInput
                value={respondentName}
                hasError={Boolean(errors.respondentName)}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Respondent full name"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Incident Category">
              <SelectInput
                value={incidentCategory}
                onChange={(e) =>
                  setIncidentCategory(e.target.value as BlotterIncidentCategory)
                }
                options={BLOTTER_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
            <FormField label="Purok">
              <SelectInput
                value={purok}
                onChange={(e) => setPurok(e.target.value as PurokName)}
                options={PUROK_LIST.map((p) => ({ value: p, label: p }))}
              />
            </FormField>
            <FormField label="Incident Date">
              <TextInput
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField
              label="Incident Location"
              required
              error={errors.incidentLocation}
            >
              <TextInput
                value={incidentLocation}
                hasError={Boolean(errors.incidentLocation)}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="Street / Landmark"
              />
            </FormField>
            <FormField label="Initial Hearing Date & Time">
              <TextInput
                value={nextHearingDate}
                onChange={(e) => setNextHearingDate(e.target.value)}
                placeholder="2026-12-01 14:00"
              />
            </FormField>
            <FormField label="Hearing Venue">
              <TextInput
                value={hearingVenue}
                onChange={(e) => setHearingVenue(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Incident Narrative" required error={errors.narrative}>
            <TextAreaInput
              rows={3}
              value={narrative}
              hasError={Boolean(errors.narrative)}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Factual description of incident and complainant statement..."
            />
          </FormField>
        </form>
      </AppModal>

      {/* Printable Official Blotter Record */}
      <AppModal
        open={Boolean(printCase)}
        onClose={() => setPrintCase(null)}
        title="Printable Blotter Case Extract"
        eyebrow={printCase?.caseNumber}
        maxWidth="md"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setPrintCase(null)}>
              Close
            </AppButton>
            <AppButton
              variant="primary"
              startIcon={<Printer className="h-4 w-4" />}
              onClick={() => printCase && handlePrintCase(printCase)}
            >
              Print Official Record
            </AppButton>
          </>
        }
      >
        {printCase && (
          <div className="bis-printable-sheet rounded-lg border border-bis-border bg-white p-7 text-slate-900 space-y-5">
            <div className="border-b-2 border-[#173B63] pb-3 text-center">
              <p className="text-[11px] uppercase tracking-widest text-slate-600">
                Republic of the Philippines • {db.settings.municipalityOrCity}
              </p>
              <h3 className="text-lg font-bold uppercase text-[#173B63]">
                {db.settings.barangayName} — Katarungang Pambarangay
              </h3>
              <p className="text-xs font-semibold uppercase text-slate-700">
                Official Barangay Blotter Extract
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-300 rounded p-3">
              <div>
                <strong>Case No:</strong> {printCase.caseNumber}
              </div>
              <div>
                <strong>Status:</strong> {printCase.status}
              </div>
              <div>
                <strong>Complainant:</strong> {printCase.complainantName}
              </div>
              <div>
                <strong>Respondent:</strong> {printCase.respondentName}
              </div>
              <div>
                <strong>Category:</strong> {printCase.incidentCategory}
              </div>
              <div>
                <strong>Incident Date:</strong> {printCase.incidentDate}
              </div>
              <div className="col-span-2">
                <strong>Location:</strong> {printCase.incidentLocation} (
                {printCase.purok})
              </div>
            </div>

            <div className="text-xs space-y-2">
              <p className="font-bold uppercase text-slate-700">
                Statement / Narrative
              </p>
              <p className="leading-relaxed border border-slate-200 rounded p-3">
                {printCase.narrative}
              </p>
            </div>

            {printCase.settlementTerms && (
              <div className="text-xs space-y-1">
                <p className="font-bold uppercase text-slate-700">
                  Resolution / Kasunduan Terms
                </p>
                <p className="border border-slate-200 rounded p-3">
                  {printCase.settlementTerms}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
              <div className="pt-6">
                <div className="border-t border-slate-400 pt-1 font-semibold uppercase">
                  {printCase.presidingOfficer}
                </div>
                <p className="text-slate-600">Lupon Presiding Officer</p>
              </div>
              <div className="pt-6">
                <div className="border-t border-slate-400 pt-1 font-bold uppercase text-[#173B63]">
                  {db.settings.signatories.punongBarangay}
                </div>
                <p className="text-slate-600">Punong Barangay / Lupon Chair</p>
              </div>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
