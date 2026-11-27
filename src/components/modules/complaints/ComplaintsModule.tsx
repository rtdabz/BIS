'use client';

import * as React from 'react';
import {
  ArrowRightCircle,
  Eye,
  Plus,
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
import { formatResidentFullName } from '@/lib/store/bisSelectors';
import type {
  BlotterIncidentCategory,
  ComplaintCategory,
  ComplaintRecord,
  ComplaintStatus,
  PurokName,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Sanitation & Waste',
  'Noise Disturbance',
  'Neighborhood Dispute',
  'Public Safety & Streetlights',
  'Ordinance Violation',
  'Service Feedback',
];

const STATUS_TONE: Record<ComplaintStatus, StatusTone> = {
  Open: 'danger',
  'Under Review': 'warning',
  Mediation: 'warning',
  Resolved: 'accent',
  'Escalated to Blotter': 'neutral',
  Dismissed: 'neutral',
};

const PRIORITY_TONE: Record<ComplaintRecord['priority'], StatusTone> = {
  Urgent: 'danger',
  High: 'warning',
  Medium: 'accent',
  Low: 'neutral',
};

export function ComplaintsModule() {
  const {
    db,
    createComplaint,
    updateComplaintStatus,
    escalateComplaintToBlotter,
  } = useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('complaints');

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | ComplaintStatus>('All');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  // New complaint form
  const [complainantResidentId, setComplainantResidentId] = React.useState('');
  const [complainantName, setComplainantName] = React.useState('');
  const [complainantContact, setComplainantContact] = React.useState('');
  const [respondentName, setRespondentName] = React.useState('');
  const [purok, setPurok] = React.useState<PurokName>('Purok 1');
  const [category, setCategory] =
    React.useState<ComplaintCategory>('Sanitation & Waste');
  const [priority, setPriority] =
    React.useState<ComplaintRecord['priority']>('Medium');
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [assignedTo, setAssignedTo] = React.useState('Kgd. Ernesto Navarro');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Status update inside drawer
  const [nextStatus, setNextStatus] =
    React.useState<ComplaintStatus>('Under Review');
  const [statusNote, setStatusNote] = React.useState('');

  // Escalate modal
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [blotterCat, setBlotterCat] =
    React.useState<BlotterIncidentCategory>('Boundary / Property Dispute');
  const [blotterLoc, setBlotterLoc] = React.useState('');

  const activeComplaints = db.complaints.filter(
    (c) =>
      c.status === 'Open' ||
      c.status === 'Under Review' ||
      c.status === 'Mediation'
  );

  const stats: StatMetric[] = [
    {
      id: 'cmp-open',
      label: 'Open / Triage',
      value: db.complaints.filter((c) => c.status === 'Open').length,
      formattedValue: String(
        db.complaints.filter((c) => c.status === 'Open').length
      ),
      icon: 'MessageSquareWarning',
      changeLabel: `${db.complaints.filter((c) => c.priority === 'Urgent' || c.priority === 'High').length} high priority`,
      changeContext: 'awaiting assignment',
      trend: 'neutral',
      tone: 'danger',
      href: '/complaints',
    },
    {
      id: 'cmp-active',
      label: 'Active Investigations',
      value: activeComplaints.length,
      formattedValue: String(activeComplaints.length),
      icon: 'FileClock',
      changeLabel: 'In progress',
      changeContext: 'review or mediation',
      trend: 'neutral',
      tone: 'warning',
      href: '/complaints',
    },
    {
      id: 'cmp-resolved',
      label: 'Resolved Tickets',
      value: db.complaints.filter((c) => c.status === 'Resolved').length,
      formattedValue: String(
        db.complaints.filter((c) => c.status === 'Resolved').length
      ),
      icon: 'CheckCircle2',
      changeLabel: `${Math.round((db.complaints.filter((c) => c.status === 'Resolved').length / Math.max(1, db.complaints.length)) * 100)}%`,
      changeContext: 'resolved at front desk',
      trend: 'up',
      tone: 'success',
      href: '/complaints',
    },
    {
      id: 'cmp-escalated',
      label: 'Escalated to Blotter',
      value: db.complaints.filter((c) => c.status === 'Escalated to Blotter')
        .length,
      formattedValue: String(
        db.complaints.filter((c) => c.status === 'Escalated to Blotter').length
      ),
      icon: 'ShieldAlert',
      changeLabel: 'Lupon',
      changeContext: 'referred for formal hearing',
      trend: 'neutral',
      tone: 'accent',
      href: '/blotter',
    },
  ];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.complaints.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        c.ticketNumber.toLowerCase().includes(q) ||
        c.complainantName.toLowerCase().includes(q) ||
        c.respondentName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, db.complaints, search, statusFilter]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const selected = selectedId
    ? db.complaints.find((c) => c.id === selectedId) ?? null
    : null;

  const openComplaintDrawer = (row: ComplaintRecord) => {
    setSelectedId(row.id);
    setNextStatus(row.status === 'Open' ? 'Under Review' : row.status);
    setStatusNote('');
  };

  const handleOpenCreate = () => {
    setComplainantResidentId('');
    setComplainantName('');
    setComplainantContact('');
    setRespondentName('');
    setPurok('Purok 1');
    setCategory('Sanitation & Waste');
    setPriority('Medium');
    setSubject('');
    setDescription('');
    setAssignedTo(db.settings.signatories.luponChair);
    setErrors({});
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!complainantName.trim()) errs.complainantName = 'Complainant name is required.';
    if (!respondentName.trim()) errs.respondentName = 'Respondent / location is required.';
    if (!subject.trim()) errs.subject = 'Complaint subject is required.';
    if (!description.trim()) errs.description = 'Description is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const created = createComplaint(
      {
        complainantResidentId: complainantResidentId || undefined,
        complainantName: complainantName.trim(),
        complainantContact: complainantContact.trim() || 'Walk-in',
        respondentName: respondentName.trim(),
        purok,
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        assignedTo: assignedTo.trim() || 'Barangay Secretariat',
      },
      actorMeta
    );

    showToast({
      title: 'Complaint logged',
      message: `${created.ticketNumber} assigned to ${created.assignedTo}.`,
      tone: 'success',
    });
    setCreateOpen(false);
  };

  const columns: DataTableColumn<ComplaintRecord>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.ticketNumber}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Complaint & Category',
      render: (row) => (
        <div className="min-w-[210px] max-w-[300px]">
          <p className="truncate font-medium text-bis-text">{row.subject}</p>
          <p className="text-[11px] text-bis-muted">
            {row.category} • {row.purok}
          </p>
        </div>
      ),
    },
    {
      key: 'parties',
      header: 'Involved Parties',
      render: (row) => (
        <div className="min-w-[160px] text-xs">
          <p className="font-medium text-bis-text">{row.complainantName}</p>
          <p className="truncate text-[11px] text-bis-muted">
            vs. {row.respondentName}
          </p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <StatusBadge label={row.priority} tone={PRIORITY_TONE[row.priority]} />
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
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openComplaintDrawer(row);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text hover:bg-bis-surface-subtle"
        >
          <Eye className="h-3 w-3" />
          <span>Manage</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Transactions"
        title="Complaints & Service Grievances"
        subtitle="Track community complaints, sanitation tickets, officer assignments, and Lupon escalations."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenCreate}
            >
              Log Complaint
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
        title="Complaint Queue"
        subtitle="Click any ticket to review timeline actions, record resolution, or escalate to Blotter."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search ticket, party, subject..."
              aria-label="Search complaints"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'All', label: 'All Categories' },
                ...COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c })),
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
                'Open',
                'Under Review',
                'Mediation',
                'Resolved',
                'Escalated to Blotter',
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
          <span className="text-xs text-bis-muted">{filtered.length} tickets</span>
        </div>

        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          onRowClick={(r) => openComplaintDrawer(r)}
          emptyTitle="No matching complaints"
          emptyDescription="Adjust filters or log a new community complaint."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="complaints"
            />
          }
        />
      </SectionCard>

      {/* Complaint Detail & Resolution Drawer */}
      <RecordDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        eyebrow={selected?.ticketNumber}
        title={selected?.subject ?? ''}
        subtitle={
          selected ? `${selected.category} • ${selected.purok}` : undefined
        }
        badge={
          selected && (
            <StatusBadge
              label={selected.status}
              tone={STATUS_TONE[selected.status]}
            />
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField label="Complainant" value={selected.complainantName} />
              <DetailField label="Respondent / Target" value={selected.respondentName} />
              <DetailField label="Assigned Officer" value={selected.assignedTo} />
              <DetailField label="Priority" value={selected.priority} />
            </dl>

            <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3.5 text-xs space-y-1.5">
              <p className="font-semibold text-bis-text">Complaint Details</p>
              <p className="leading-relaxed text-bis-muted">
                {selected.description}
              </p>
              {selected.resolutionNotes && (
                <p className="pt-1.5 font-medium text-bis-text">
                  Resolution: {selected.resolutionNotes}
                </p>
              )}
            </div>

            {allowManage &&
              selected.status !== 'Escalated to Blotter' &&
              selected.status !== 'Resolved' && (
                <div className="rounded-[10px] border border-bis-border bg-bis-surface-subtle p-3.5 space-y-3">
                  <p className="text-xs font-semibold text-bis-text">
                    Update Status &amp; Record Action
                  </p>
                  <SelectInput
                    value={nextStatus}
                    onChange={(e) =>
                      setNextStatus(e.target.value as ComplaintStatus)
                    }
                    options={[
                      { value: 'Open', label: 'Open' },
                      { value: 'Under Review', label: 'Under Review' },
                      { value: 'Mediation', label: 'Mediation' },
                      { value: 'Resolved', label: 'Resolved' },
                      { value: 'Dismissed', label: 'Dismissed' },
                    ]}
                  />
                  <TextAreaInput
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Enter inspection findings or resolution remarks..."
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <AppButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        updateComplaintStatus(
                          selected.id,
                          nextStatus,
                          statusNote.trim() || `Marked ${nextStatus}`,
                          actorMeta
                        );
                        showToast({
                          title: `${selected.ticketNumber} updated`,
                          message: `Status changed to ${nextStatus}.`,
                          tone: 'success',
                        });
                        setStatusNote('');
                      }}
                    >
                      Save Status Update
                    </AppButton>

                    <AppButton
                      variant="outline"
                      size="sm"
                      startIcon={<ArrowRightCircle className="h-3.5 w-3.5" />}
                      onClick={() => {
                        setBlotterLoc(`${selected.purok} — ${selected.respondentName}`);
                        setEscalateOpen(true);
                      }}
                    >
                      Escalate to Blotter
                    </AppButton>
                  </div>
                </div>
              )}

            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Action Timeline
              </h3>
              <ol className="space-y-2.5 border-l border-bis-border pl-4 ml-1.5">
                {selected.timeline.map((t, idx) => (
                  <li key={`${t.timestamp}-${idx}`} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-bis-text">
                        {t.status}
                      </span>
                      <span className="font-mono text-[10.5px] text-bis-muted">
                        {t.timestamp}
                      </span>
                    </div>
                    <p className="text-bis-muted">By {t.actor}</p>
                    <p className="mt-0.5 text-bis-text">{t.note}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </RecordDrawer>

      {/* Log Complaint Modal */}
      <AppModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Submit Community Complaint"
        eyebrow="Complaints"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-complaint-form" variant="primary">
              Submit Ticket
            </AppButton>
          </>
        }
      >
        <form
          id="bis-complaint-form"
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <FormField label="Select Existing Resident (Optional)">
            <SelectInput
              value={complainantResidentId}
              onChange={(e) => {
                const id = e.target.value;
                setComplainantResidentId(id);
                const r = db.residents.find((item) => item.id === id);
                if (r) {
                  setComplainantName(formatResidentFullName(r));
                  setComplainantContact(r.contactNumber);
                  setPurok(r.purok);
                }
              }}
              placeholder="Walk-in / Non-resident or select resident..."
              options={db.residents
                .filter((r) => r.status === 'Active')
                .map((r) => ({
                  value: r.id,
                  label: `${formatResidentFullName(r)} (${r.purok})`,
                }))}
            />
          </FormField>

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
                placeholder="Full name"
              />
            </FormField>
            <FormField label="Contact Number">
              <TextInput
                value={complainantContact}
                onChange={(e) => setComplainantContact(e.target.value)}
                placeholder="0917-000-0000"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="Respondent / Subject Location"
              required
              error={errors.respondentName}
            >
              <TextInput
                value={respondentName}
                hasError={Boolean(errors.respondentName)}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Person, store, or street fixture"
              />
            </FormField>
            <FormField label="Purok" required>
              <SelectInput
                value={purok}
                onChange={(e) => setPurok(e.target.value as PurokName)}
                options={PUROK_LIST.map((p) => ({ value: p, label: p }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Category">
              <SelectInput
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ComplaintCategory)
                }
                options={COMPLAINT_CATEGORIES.map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
            </FormField>
            <FormField label="Priority">
              <SelectInput
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as ComplaintRecord['priority'])
                }
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                  { value: 'Urgent', label: 'Urgent' },
                ]}
              />
            </FormField>
            <FormField label="Assigned To">
              <TextInput
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Subject" required error={errors.subject}>
            <TextInput
              value={subject}
              hasError={Boolean(errors.subject)}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Concise summary of the complaint"
            />
          </FormField>

          <FormField label="Detailed Narrative" required error={errors.description}>
            <TextAreaInput
              rows={3}
              value={description}
              hasError={Boolean(errors.description)}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe facts, dates, and immediate observations..."
            />
          </FormField>
        </form>
      </AppModal>

      {/* Escalate to Blotter Modal */}
      <AppModal
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        title="Escalate Complaint to Lupon Blotter"
        eyebrow={selected?.ticketNumber}
        maxWidth="xs"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setEscalateOpen(false)}>
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={() => {
                if (!selected) return;
                const blt = escalateComplaintToBlotter(
                  selected.id,
                  blotterCat,
                  blotterLoc.trim() || selected.purok,
                  actorMeta
                );
                setEscalateOpen(false);
                if (blt) {
                  showToast({
                    title: `Escalated to ${blt.caseNumber}`,
                    message: 'Formal Lupon blotter case created.',
                    tone: 'warning',
                  });
                }
              }}
            >
              Create Blotter Case
            </AppButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-bis-muted">
            Convert ticket <strong>{selected?.ticketNumber}</strong> into a formal
            Katarungang Pambarangay blotter docket for Lupon mediation.
          </p>
          <FormField label="Lupon Incident Category">
            <SelectInput
              value={blotterCat}
              onChange={(e) =>
                setBlotterCat(e.target.value as BlotterIncidentCategory)
              }
              options={[
                { value: 'Boundary / Property Dispute', label: 'Boundary / Property Dispute' },
                { value: 'Noise & Curfew Ordinance', label: 'Noise & Curfew Ordinance' },
                { value: 'Financial / Debt Conciliation', label: 'Financial / Debt Conciliation' },
                { value: 'Domestic & Minor Altercations', label: 'Domestic & Minor Altercations' },
                { value: 'Trespassing / Damage', label: 'Trespassing / Damage' },
                { value: 'Other Lupon Matter', label: 'Other Lupon Matter' },
              ]}
            />
          </FormField>
          <FormField label="Incident Location">
            <TextInput
              value={blotterLoc}
              onChange={(e) => setBlotterLoc(e.target.value)}
            />
          </FormField>
        </div>
      </AppModal>
    </div>
  );
}
