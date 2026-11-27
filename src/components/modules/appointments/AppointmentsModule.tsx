'use client';

import * as React from 'react';
import {
  CalendarPlus,
  Check,
  Clock,
  RefreshCw,
  XCircle,
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
  AppointmentRecord,
  AppointmentServiceType,
  AppointmentStatus,
  PurokName,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const SERVICE_TYPES: AppointmentServiceType[] = [
  'Document Pickup',
  'Barangay Clearance Filing',
  'Lupon Consultation',
  'OSCA / PDAO Validation',
  'Punong Barangay Audience',
  'Business Permit Inspection',
];

const WINDOWS = [
  'Window 1 — Records',
  'Window 2 — Sectoral',
  'Window 3 — Permits',
  'Session Hall B — Lupon',
  'Office of Punong Barangay',
];

const TIME_SLOTS = [
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:30 PM',
  '04:00 PM',
];

const STATUS_TONE: Record<AppointmentStatus, StatusTone> = {
  Pending: 'warning',
  Approved: 'accent',
  Completed: 'success',
  Rescheduled: 'warning',
  Cancelled: 'danger',
};

export function AppointmentsModule() {
  const { db, createAppointment, updateAppointment, transitionAppointmentStatus } =
    useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('appointments');

  const [selectedDate, setSelectedDate] = React.useState('2026-11-27');
  const [statusFilter, setStatusFilter] = React.useState<'All' | AppointmentStatus>('All');
  const [windowFilter, setWindowFilter] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [residentId, setResidentId] = React.useState('');
  const [residentName, setResidentName] = React.useState('');
  const [contactNumber, setContactNumber] = React.useState('');
  const [purok, setPurok] = React.useState<PurokName>('Purok 1');
  const [serviceType, setServiceType] =
    React.useState<AppointmentServiceType>('Document Pickup');
  const [windowAssigned, setWindowAssigned] = React.useState(WINDOWS[0]);
  const [appointmentDate, setAppointmentDate] = React.useState('2026-11-28');
  const [timeSlot, setTimeSlot] = React.useState('09:00 AM');
  const [purpose, setPurpose] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [rescheduleTarget, setRescheduleTarget] =
    React.useState<AppointmentRecord | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [rescheduleSlot, setRescheduleSlot] = React.useState('');
  const [rescheduleNotes, setRescheduleNotes] = React.useState('');

  const [cancelTarget, setCancelTarget] =
    React.useState<AppointmentRecord | null>(null);

  const bookedSlotsOnSelectedDate = React.useMemo(() => {
    const map = new Set<string>();
    db.appointments.forEach((a) => {
      if (a.appointmentDate === selectedDate && a.status !== 'Cancelled') {
        map.add(a.timeSlot);
      }
    });
    return map;
  }, [db.appointments, selectedDate]);

  const stats: StatMetric[] = [
    {
      id: 'apt-pending',
      label: 'Pending Approval',
      value: db.appointments.filter((a) => a.status === 'Pending').length,
      formattedValue: String(
        db.appointments.filter((a) => a.status === 'Pending').length
      ),
      icon: 'CalendarClock',
      changeLabel: 'Awaiting',
      changeContext: 'slot confirmation',
      trend: 'neutral',
      tone: 'warning',
      href: '/appointments',
    },
    {
      id: 'apt-approved',
      label: 'Confirmed Upcoming',
      value: db.appointments.filter(
        (a) => a.status === 'Approved' || a.status === 'Rescheduled'
      ).length,
      formattedValue: String(
        db.appointments.filter(
          (a) => a.status === 'Approved' || a.status === 'Rescheduled'
        ).length
      ),
      icon: 'CheckCircle2',
      changeLabel: 'Scheduled',
      changeContext: 'ready across 5 desks',
      trend: 'up',
      tone: 'accent',
      href: '/appointments',
    },
    {
      id: 'apt-today',
      label: `Slots Booked (${selectedDate})`,
      value: db.appointments.filter(
        (a) => a.appointmentDate === selectedDate && a.status !== 'Cancelled'
      ).length,
      formattedValue: String(
        db.appointments.filter(
          (a) => a.appointmentDate === selectedDate && a.status !== 'Cancelled'
        ).length
      ),
      icon: 'FileClock',
      changeLabel: `${TIME_SLOTS.length} total slots`,
      changeContext: 'selected calendar day',
      trend: 'neutral',
      tone: 'accent',
      href: '/appointments',
    },
    {
      id: 'apt-completed',
      label: 'Completed Visits',
      value: db.appointments.filter((a) => a.status === 'Completed').length,
      formattedValue: String(
        db.appointments.filter((a) => a.status === 'Completed').length
      ),
      icon: 'UserCheck',
      changeLabel: 'Served',
      changeContext: 'completed counter visits',
      trend: 'up',
      tone: 'success',
      href: '/appointments',
    },
  ];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.appointments
      .filter((a) => {
        if (statusFilter !== 'All' && a.status !== statusFilter) return false;
        if (windowFilter !== 'All' && a.windowAssigned !== windowFilter) {
          return false;
        }
        if (!q) return true;
        return (
          a.referenceCode.toLowerCase().includes(q) ||
          a.residentName.toLowerCase().includes(q) ||
          a.purpose.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
  }, [db.appointments, search, statusFilter, windowFilter]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleOpenCreate = () => {
    setResidentId('');
    setResidentName('');
    setContactNumber('');
    setPurok('Purok 1');
    setServiceType('Document Pickup');
    setWindowAssigned(WINDOWS[0]);
    setAppointmentDate(selectedDate);
    setTimeSlot('09:00 AM');
    setPurpose('');
    setErrors({});
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!residentName.trim()) errs.residentName = 'Visitor name is required.';
    if (!purpose.trim()) errs.purpose = 'Purpose is required.';

    const conflict = db.appointments.find(
      (a) =>
        a.appointmentDate === appointmentDate &&
        a.timeSlot === timeSlot &&
        a.windowAssigned === windowAssigned &&
        a.status !== 'Cancelled'
    );
    if (conflict) {
      errs.timeSlot = `${windowAssigned} already has ${conflict.referenceCode} at ${timeSlot}.`;
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const created = createAppointment(
      {
        residentId: residentId || undefined,
        residentName: residentName.trim(),
        contactNumber: contactNumber.trim() || 'Walk-in',
        purok,
        serviceType,
        windowAssigned,
        appointmentDate,
        timeSlot,
        purpose: purpose.trim(),
        status: 'Approved',
      },
      actorMeta
    );

    showToast({
      title: 'Appointment scheduled',
      message: `${created.referenceCode} confirmed for ${appointmentDate} at ${timeSlot}.`,
      tone: 'success',
    });
    setCreateOpen(false);
  };

  const columns: DataTableColumn<AppointmentRecord>[] = [
    {
      key: 'referenceCode',
      header: 'Reference #',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.referenceCode}
        </span>
      ),
    },
    {
      key: 'schedule',
      header: 'Date & Window',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-semibold text-bis-text">
            {row.appointmentDate} • {row.timeSlot}
          </p>
          <p className="text-[11px] text-bis-muted">{row.windowAssigned}</p>
        </div>
      ),
    },
    {
      key: 'residentName',
      header: 'Resident / Visitor',
      render: (row) => (
        <div className="min-w-[160px]">
          <p className="font-medium text-bis-text">{row.residentName}</p>
          <p className="text-[11px] text-bis-muted">
            {row.purok} • {row.contactNumber}
          </p>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'Service & Purpose',
      render: (row) => (
        <div className="min-w-[190px] max-w-[260px]">
          <p className="font-medium text-bis-text">{row.serviceType}</p>
          <p className="truncate text-[11px] text-bis-muted">{row.purpose}</p>
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
      render: (row) =>
        allowManage ? (
          <div className="inline-flex items-center justify-end gap-1">
            {row.status === 'Pending' && (
              <button
                type="button"
                onClick={() => {
                  transitionAppointmentStatus(
                    row.id,
                    'Approved',
                    'Slot confirmed',
                    actorMeta
                  );
                  showToast({
                    title: `${row.referenceCode} approved`,
                    tone: 'success',
                  });
                }}
                className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-accent hover:bg-bis-accent-soft dark:text-[#93B9E6]"
              >
                <Check className="h-3 w-3" />
                <span>Approve</span>
              </button>
            )}
            {(row.status === 'Approved' || row.status === 'Rescheduled') && (
              <button
                type="button"
                onClick={() => {
                  transitionAppointmentStatus(
                    row.id,
                    'Completed',
                    'Visitor served at desk',
                    actorMeta
                  );
                  showToast({
                    title: `${row.referenceCode} completed`,
                    tone: 'success',
                  });
                }}
                className="rounded-md bg-bis-accent px-2 py-1 text-xs font-medium text-bis-accent-contrast hover:bg-bis-accent-hover"
              >
                Complete
              </button>
            )}
            {row.status !== 'Completed' && row.status !== 'Cancelled' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setRescheduleTarget(row);
                    setRescheduleDate(row.appointmentDate);
                    setRescheduleSlot(row.timeSlot);
                    setRescheduleNotes(row.notes ?? '');
                  }}
                  aria-label={`Reschedule ${row.referenceCode}`}
                  className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCancelTarget(row)}
                  aria-label={`Cancel ${row.referenceCode}`}
                  className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-danger hover:bg-bis-danger-soft"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Transactions"
        title="Appointments & Desk Calendar"
        subtitle="Manage scheduled front-desk visits, document pickups, sectoral validations, and Lupon hearings."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<CalendarPlus className="h-4 w-4" />}
              onClick={handleOpenCreate}
            >
              Schedule Appointment
            </AppButton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Daily Slot Availability Strip */}
      <SectionCard
        title="Daily Desk Slot Availability"
        subtitle="Inspect time slot occupancy for a target date before booking walk-ins."
        headerAction={
          <div className="flex items-center gap-2">
            <span className="text-xs text-bis-muted">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Inspect slot availability date"
              className="rounded-lg border border-bis-border bg-bis-surface-subtle px-2.5 py-1 text-xs font-medium text-bis-text focus:border-bis-accent focus:outline-none"
            />
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => {
            const isTaken = bookedSlotsOnSelectedDate.has(slot);
            return (
              <button
                key={slot}
                type="button"
                disabled={!allowManage}
                onClick={() => {
                  if (!allowManage) return;
                  handleOpenCreate();
                  setAppointmentDate(selectedDate);
                  setTimeSlot(slot);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isTaken
                    ? 'border-bis-warning/40 bg-bis-warning-soft text-bis-text'
                    : 'border-bis-border bg-bis-surface-subtle text-bis-text hover:border-bis-accent'
                }`}
              >
                <Clock className="h-3 w-3 text-bis-muted" />
                <span className="font-mono">{slot}</span>
                <span className="text-[10.5px] text-bis-muted">
                  ({isTaken ? 'Booked' : 'Open'})
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Scheduled Appointments"
        subtitle="Filter by desk window or status and execute approvals, reschedules, or cancellations."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search ref #, resident, purpose..."
              aria-label="Search appointments"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Window"
              value={windowFilter}
              onChange={setWindowFilter}
              options={[
                { value: 'All', label: 'All Desks / Windows' },
                ...WINDOWS.map((w) => ({ value: w, label: w })),
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
                'Pending',
                'Approved',
                'Rescheduled',
                'Completed',
                'Cancelled',
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
          <span className="text-xs text-bis-muted">
            {filtered.length} appointments
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          emptyTitle="No matching appointments"
          emptyDescription="Adjust filters or schedule a new appointment."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="appointments"
            />
          }
        />
      </SectionCard>

      {/* Book Appointment Modal */}
      <AppModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Schedule Desk Appointment"
        eyebrow="Appointments"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-apt-form" variant="primary">
              Confirm Schedule
            </AppButton>
          </>
        }
      >
        <form id="bis-apt-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Select Resident (Optional)">
            <SelectInput
              value={residentId}
              onChange={(e) => {
                const id = e.target.value;
                setResidentId(id);
                const r = db.residents.find((item) => item.id === id);
                if (r) {
                  setResidentName(formatResidentFullName(r));
                  setContactNumber(r.contactNumber);
                  setPurok(r.purok);
                }
              }}
              placeholder="Walk-in / Select resident..."
              options={db.residents
                .filter((r) => r.status === 'Active')
                .map((r) => ({
                  value: r.id,
                  label: `${formatResidentFullName(r)} (${r.purok})`,
                }))}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Visitor Name" required error={errors.residentName}>
              <TextInput
                value={residentName}
                hasError={Boolean(errors.residentName)}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="Full name"
              />
            </FormField>
            <FormField label="Contact Number">
              <TextInput
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="0917-000-0000"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Service Type">
              <SelectInput
                value={serviceType}
                onChange={(e) =>
                  setServiceType(e.target.value as AppointmentServiceType)
                }
                options={SERVICE_TYPES.map((s) => ({ value: s, label: s }))}
              />
            </FormField>
            <FormField label="Assigned Window / Office">
              <SelectInput
                value={windowAssigned}
                onChange={(e) => setWindowAssigned(e.target.value)}
                options={WINDOWS.map((w) => ({ value: w, label: w }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Date">
              <TextInput
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </FormField>
            <FormField label="Time Slot" error={errors.timeSlot}>
              <SelectInput
                value={timeSlot}
                hasError={Boolean(errors.timeSlot)}
                onChange={(e) => setTimeSlot(e.target.value)}
                options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
              />
            </FormField>
            <FormField label="Purok">
              <SelectInput
                value={purok}
                onChange={(e) => setPurok(e.target.value as PurokName)}
                options={PUROK_LIST.map((p) => ({ value: p, label: p }))}
              />
            </FormField>
          </div>

          <FormField label="Purpose / Reference" required error={errors.purpose}>
            <TextAreaInput
              rows={2}
              value={purpose}
              hasError={Boolean(errors.purpose)}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Claim approved Barangay Clearance or OSCA validation"
            />
          </FormField>
        </form>
      </AppModal>

      {/* Reschedule Modal */}
      <AppModal
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Appointment"
        eyebrow={rescheduleTarget?.referenceCode}
        maxWidth="xs"
        footer={
          <>
            <AppButton
              variant="outline"
              onClick={() => setRescheduleTarget(null)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={() => {
                if (!rescheduleTarget) return;
                updateAppointment(
                  rescheduleTarget.id,
                  {
                    appointmentDate: rescheduleDate,
                    timeSlot: rescheduleSlot,
                    status: 'Rescheduled',
                    notes: rescheduleNotes.trim() || undefined,
                  },
                  actorMeta
                );
                showToast({
                  title: `${rescheduleTarget.referenceCode} rescheduled`,
                  message: `Moved to ${rescheduleDate} at ${rescheduleSlot}.`,
                  tone: 'accent',
                });
                setRescheduleTarget(null);
              }}
            >
              Save New Slot
            </AppButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="New Date">
            <TextInput
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
          </FormField>
          <FormField label="New Time Slot">
            <SelectInput
              value={rescheduleSlot}
              onChange={(e) => setRescheduleSlot(e.target.value)}
              options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
            />
          </FormField>
          <FormField label="Reschedule Notes">
            <TextAreaInput
              rows={2}
              value={rescheduleNotes}
              onChange={(e) => setRescheduleNotes(e.target.value)}
            />
          </FormField>
        </div>
      </AppModal>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment"
        description={
          cancelTarget
            ? `Cancel ${cancelTarget.referenceCode} for ${cancelTarget.residentName}?`
            : ''
        }
        confirmLabel="Cancel Appointment"
        tone="danger"
        requireReason
        reasonLabel="Cancellation Reason"
        onConfirm={(reason) => {
          if (!cancelTarget) return;
          transitionAppointmentStatus(
            cancelTarget.id,
            'Cancelled',
            reason,
            actorMeta
          );
          showToast({
            title: `${cancelTarget.referenceCode} cancelled`,
            tone: 'warning',
          });
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
