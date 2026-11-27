'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Check,
  Eye,
  FilePlus2,
  Printer,
  Send,
  ShieldCheck,
  XCircle,
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
  TextAreaInput,
  TextInput,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import {
  computeResidentAge,
  formatPhp,
  formatResidentFullName,
  getActiveBlotterMatchesForResident,
} from '@/lib/store/bisSelectors';
import type {
  CertificateDocumentType,
  CertificateRecord,
  CertificateWorkflowStatus,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const DOC_TYPES: CertificateDocumentType[] = [
  'Barangay Clearance',
  'Certificate of Indigency',
  'Certificate of Residency',
  'Business Permit Clearance',
  'Certificate of Good Moral Character',
  'First-Time Jobseeker (RA 11261)',
  'Solo Parent Certification',
];

const STATUS_TONE: Record<CertificateWorkflowStatus, StatusTone> = {
  Pending: 'warning',
  'For Signature': 'warning',
  Approved: 'neutral',
  Released: 'accent',
  Declined: 'danger',
};

export function CertificatesModule() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const initialAction = searchParams.get('action') ?? '';
  const initialResidentId = searchParams.get('residentId') ?? '';
  return (
    <CertificatesModuleInner
      key={`${initialSearch}|${initialAction}|${initialResidentId}`}
      initialSearch={initialSearch}
      initialAction={initialAction}
      initialResidentId={initialResidentId}
    />
  );
}

function CertificatesModuleInner({
  initialSearch,
  initialAction,
  initialResidentId,
}: {
  initialSearch: string;
  initialAction: string;
  initialResidentId: string;
}) {
  const { db, createCertificate, transitionCertificate } = useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('certificates');

  const [search, setSearch] = React.useState(initialSearch);
  const [statusTab, setStatusTab] = React.useState<'All' | CertificateWorkflowStatus>('All');
  const [docTypeFilter, setDocTypeFilter] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedCertId, setSelectedCertId] = React.useState<string | null>(null);
  const [printCert, setPrintCert] = React.useState<CertificateRecord | null>(null);
  const [declineTarget, setDeclineTarget] = React.useState<CertificateRecord | null>(null);

  const [createOpen, setCreateOpen] = React.useState(
    () => initialAction === 'new' && allowManage
  );
  const [residentId, setResidentId] = React.useState(
    () =>
      initialResidentId ||
      db.residents.find((r) => r.status === 'Active')?.id ||
      ''
  );
  const [documentType, setDocumentType] =
    React.useState<CertificateDocumentType>('Barangay Clearance');
  const [purpose, setPurpose] = React.useState('');
  const [businessName, setBusinessName] = React.useState('');
  const [isFeeExempt, setIsFeeExempt] = React.useState(false);
  const [remarks, setRemarks] = React.useState('');
  const [formError, setFormError] = React.useState<Record<string, string>>({});

  const activeResidents = React.useMemo(
    () => db.residents.filter((r) => r.status === 'Active'),
    [db.residents]
  );

  const selectedResidentForForm = activeResidents.find(
    (r) => r.id === residentId
  );
  const blotterMatchesForForm = selectedResidentForForm
    ? getActiveBlotterMatchesForResident(db, selectedResidentForForm)
    : [];

  const configuredFee = db.settings.certificateFees[documentType]?.feePhp ?? 50;
  const computedFee = isFeeExempt ? 0 : configuredFee;

  const stats: StatMetric[] = React.useMemo(() => {
    const pending = db.certificates.filter((c) => c.status === 'Pending').length;
    const forSig = db.certificates.filter((c) => c.status === 'For Signature').length;
    const approved = db.certificates.filter((c) => c.status === 'Approved').length;
    const released = db.certificates.filter((c) => c.status === 'Released').length;
    return [
      {
        id: 'cert-stat-pending',
        label: 'Pending Verification',
        value: pending,
        formattedValue: String(pending),
        icon: 'FileClock',
        changeLabel: 'Queue',
        changeContext: 'awaiting front-desk review',
        trend: 'neutral',
        tone: pending > 0 ? 'warning' : 'accent',
        href: '/certificates',
      },
      {
        id: 'cert-stat-sig',
        label: 'For Punong Barangay Signature',
        value: forSig,
        formattedValue: String(forSig),
        icon: 'FileText',
        changeLabel: 'Endorsed',
        changeContext: 'ready for approval',
        trend: 'neutral',
        tone: forSig > 0 ? 'warning' : 'accent',
        href: '/certificates',
      },
      {
        id: 'cert-stat-approved',
        label: 'Approved / Ready to Print',
        value: approved,
        formattedValue: String(approved),
        icon: 'CheckCircle2',
        changeLabel: 'Print ready',
        changeContext: 'awaiting claimant release',
        trend: 'up',
        tone: 'accent',
        href: '/certificates',
      },
      {
        id: 'cert-stat-released',
        label: 'Released Documents',
        value: released,
        formattedValue: String(released),
        icon: 'FileCheck2',
        changeLabel: `${db.certificates.length} total`,
        changeContext: 'logged in registry',
        trend: 'up',
        tone: 'success',
        href: '/certificates',
      },
    ];
  }, [db.certificates]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.certificates.filter((c) => {
      if (statusTab !== 'All' && c.status !== statusTab) return false;
      if (docTypeFilter !== 'All' && c.documentType !== docTypeFilter) return false;
      if (!q) return true;
      return (
        c.trackingCode.toLowerCase().includes(q) ||
        c.residentName.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q) ||
        c.purok.toLowerCase().includes(q)
      );
    });
  }, [db.certificates, docTypeFilter, search, statusTab]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleOpenCreate = () => {
    setResidentId(activeResidents[0]?.id ?? '');
    setDocumentType('Barangay Clearance');
    setPurpose('');
    setBusinessName('');
    setIsFeeExempt(false);
    setRemarks('');
    setFormError({});
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!residentId) errs.residentId = 'Select a verified resident.';
    if (!purpose.trim()) errs.purpose = 'Purpose of issuance is required.';
    if (
      documentType === 'Business Permit Clearance' &&
      !businessName.trim()
    ) {
      errs.businessName = 'Business / establishment name is required.';
    }
    if (Object.keys(errs).length > 0) {
      setFormError(errs);
      return;
    }

    const res = activeResidents.find((r) => r.id === residentId);
    if (!res) return;

    const created = createCertificate(
      {
        residentId: res.id,
        residentName: formatResidentFullName(res),
        purok: res.purok,
        documentType,
        purpose: purpose.trim(),
        businessName: businessName.trim() || undefined,
        feeAmount: computedFee,
        isFeeExempt: isFeeExempt || computedFee === 0,
        remarks: remarks.trim() || undefined,
      },
      actorMeta
    );

    showToast({
      title: 'Certificate request filed',
      message: `${created.trackingCode} queued for ${created.residentName}.`,
      tone: 'success',
    });
    setCreateOpen(false);
  };

  const handleTransition = (
    cert: CertificateRecord,
    nextStatus: CertificateWorkflowStatus,
    note?: string
  ) => {
    transitionCertificate(cert.id, nextStatus, note, actorMeta);
    showToast({
      title: `${cert.trackingCode} → ${nextStatus}`,
      message:
        nextStatus === 'Released' && !cert.isFeeExempt && cert.feeAmount > 0
          ? `Document released and ${formatPhp(cert.feeAmount)} fee recorded in Financial Management.`
          : `${cert.documentType} updated.`,
      tone: nextStatus === 'Declined' ? 'warning' : 'success',
    });
  };

  const handlePrint = (cert: CertificateRecord) => {
    setPrintCert(cert);
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

  const columns: DataTableColumn<CertificateRecord>[] = [
    {
      key: 'trackingCode',
      header: 'Tracking #',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.trackingCode}
        </span>
      ),
    },
    {
      key: 'residentName',
      header: 'Applicant',
      render: (row) => {
        const res = db.residents.find((r) => r.id === row.residentId);
        const matches = res ? getActiveBlotterMatchesForResident(db, res) : [];
        return (
          <div className="min-w-[165px]">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-bis-text">{row.residentName}</p>
              {matches.length > 0 && (
                <span title="Active Blotter Match">
                  <AlertTriangle className="h-3.5 w-3.5 text-bis-danger shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-bis-muted">{row.purok}</p>
          </div>
        );
      },
    },
    {
      key: 'documentType',
      header: 'Document & Purpose',
      render: (row) => (
        <div className="min-w-[190px]">
          <p className="font-medium text-bis-text">{row.documentType}</p>
          <p className="max-w-[230px] truncate text-[11px] text-bis-muted">
            {row.businessName ? `${row.businessName} — ` : ''}
            {row.purpose}
          </p>
        </div>
      ),
    },
    {
      key: 'feeAmount',
      header: 'Fee / OR #',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-semibold text-bis-text">
            {row.isFeeExempt || row.feeAmount === 0
              ? 'Exempt'
              : formatPhp(row.feeAmount)}
          </p>
          <p className="font-mono text-[10.5px] text-bis-muted">
            {row.orNumber ?? row.requestedAt.slice(0, 10)}
          </p>
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
      header: 'Workflow Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div
          className="inline-flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {allowManage && row.status === 'Pending' && (
            <>
              <button
                type="button"
                onClick={() =>
                  handleTransition(row, 'For Signature', 'Verified at counter')
                }
                className="rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text hover:bg-bis-surface-subtle"
              >
                For Signature
              </button>
              <button
                type="button"
                onClick={() =>
                  handleTransition(row, 'Approved', 'Approved by signatory')
                }
                className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-accent hover:bg-bis-accent-soft dark:text-[#93B9E6]"
              >
                <Check className="h-3 w-3" />
                <span>Approve</span>
              </button>
            </>
          )}

          {allowManage && row.status === 'For Signature' && (
            <button
              type="button"
              onClick={() =>
                handleTransition(row, 'Approved', 'Signed by Punong Barangay')
              }
              className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-accent hover:bg-bis-accent-soft dark:text-[#93B9E6]"
            >
              <Check className="h-3 w-3" />
              <span>Approve</span>
            </button>
          )}

          {allowManage && row.status === 'Approved' && (
            <button
              type="button"
              onClick={() =>
                handleTransition(row, 'Released', 'Claimed by applicant')
              }
              className="inline-flex items-center gap-1 rounded-md bg-bis-accent px-2 py-1 text-xs font-medium text-bis-accent-contrast hover:bg-bis-accent-hover"
            >
              <Send className="h-3 w-3" />
              <span>Release</span>
            </button>
          )}

          {(row.status === 'Approved' || row.status === 'Released') && (
            <button
              type="button"
              onClick={() => setPrintCert(row)}
              aria-label={`Print ${row.trackingCode}`}
              className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text hover:bg-bis-surface-subtle"
            >
              <Printer className="h-3 w-3" />
              <span>Print</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedCertId(row.id)}
            aria-label={`Inspect ${row.trackingCode}`}
            className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const selectedCert = selectedCertId
    ? db.certificates.find((c) => c.id === selectedCertId) ?? null
    : null;
  const selectedCertResident = selectedCert
    ? db.residents.find((r) => r.id === selectedCert.residentId)
    : undefined;
  const selectedCertBlotterMatches = selectedCertResident
    ? getActiveBlotterMatchesForResident(db, selectedCertResident)
    : [];

  const printResident = printCert
    ? db.residents.find((r) => r.id === printCert.residentId)
    : undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Transactions"
        title="Certificates & Clearances"
        subtitle="Resident verification, Punong Barangay approval workflow, official receipts, and document printing."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<FilePlus2 className="h-4 w-4" />}
              onClick={handleOpenCreate}
            >
              New Certificate Request
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
        title="Issuance Queue & Transaction Ledger"
        subtitle="Verify resident clearance standing, endorse requests, print official copies, and release documents."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search tracking #, applicant..."
              aria-label="Search certificate requests"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Document Type"
              value={docTypeFilter}
              onChange={setDocTypeFilter}
              options={[
                { value: 'All', label: 'All Document Types' },
                ...DOC_TYPES.map((d) => ({ value: d, label: d })),
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
                'For Signature',
                'Approved',
                'Released',
                'Declined',
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusTab === tab
                    ? 'border border-bis-border bg-bis-surface text-bis-text shadow-[var(--bis-shadow-sm)]'
                    : 'text-bis-muted hover:text-bis-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs text-bis-muted">
            {filtered.length} requests
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setSelectedCertId(r.id)}
          emptyTitle="No matching certificate requests"
          emptyDescription="Adjust status tabs or create a new issuance request."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="requests"
            />
          }
        />
      </SectionCard>

      {/* Request Verification & History Drawer */}
      <RecordDrawer
        open={Boolean(selectedCert)}
        onClose={() => setSelectedCertId(null)}
        eyebrow={selectedCert?.trackingCode}
        title={selectedCert?.documentType ?? ''}
        subtitle={
          selectedCert
            ? `${selectedCert.residentName} • ${selectedCert.purok}`
            : undefined
        }
        badge={
          selectedCert && (
            <StatusBadge
              label={selectedCert.status}
              tone={STATUS_TONE[selectedCert.status]}
            />
          )
        }
        footer={
          selectedCert && (
            <>
              {allowManage &&
                selectedCert.status !== 'Released' &&
                selectedCert.status !== 'Declined' && (
                  <AppButton
                    variant="danger"
                    startIcon={<XCircle className="h-3.5 w-3.5" />}
                    onClick={() => setDeclineTarget(selectedCert)}
                  >
                    Decline
                  </AppButton>
                )}
              {(selectedCert.status === 'Approved' ||
                selectedCert.status === 'Released') && (
                <AppButton
                  variant="outline"
                  startIcon={<Printer className="h-3.5 w-3.5" />}
                  onClick={() => setPrintCert(selectedCert)}
                >
                  Preview &amp; Print
                </AppButton>
              )}
              {allowManage &&
                (selectedCert.status === 'Pending' ||
                  selectedCert.status === 'For Signature') && (
                  <AppButton
                    variant="primary"
                    startIcon={<Check className="h-3.5 w-3.5" />}
                    onClick={() =>
                      handleTransition(
                        selectedCert,
                        'Approved',
                        'Approved after Lupon & residency verification'
                      )
                    }
                  >
                    Approve Request
                  </AppButton>
                )}
              {allowManage && selectedCert.status === 'Approved' && (
                <AppButton
                  variant="primary"
                  startIcon={<Send className="h-3.5 w-3.5" />}
                  onClick={() =>
                    handleTransition(
                      selectedCert,
                      'Released',
                      'Document printed and released to claimant'
                    )
                  }
                >
                  Release Document
                </AppButton>
              )}
            </>
          )
        }
      >
        {selectedCert && (
          <div className="space-y-5">
            {/* Resident & Blotter Verification Box */}
            {db.settings.requireBlotterCheckForClearance && (
              <div
                className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-xs ${
                  selectedCertBlotterMatches.length > 0
                    ? 'border-bis-danger/35 bg-bis-danger-soft text-bis-danger dark:text-[#FCA5A5]'
                    : 'border-bis-accent/30 bg-bis-accent-soft text-bis-text'
                }`}
              >
                {selectedCertBlotterMatches.length > 0 ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-bis-accent dark:text-[#93B9E6]" />
                )}
                <div>
                  <p className="font-semibold">
                    {selectedCertBlotterMatches.length > 0
                      ? `Active Blotter Match Found (${selectedCertBlotterMatches.map((b) => b.caseNumber).join(', ')})`
                      : 'Resident & Lupon Clearance Verified'}
                  </p>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    {selectedCertBlotterMatches.length > 0
                      ? 'Applicant matches an active respondent entry. Verify Lupon clearance before releasing.'
                      : selectedCertResident
                        ? `Verified active resident (${selectedCertResident.residentCode}) with no pending blotter holds.`
                        : 'Resident record linked.'}
                  </p>
                </div>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField
                label="Tracking Code"
                value={selectedCert.trackingCode}
                mono
              />
              <DetailField
                label="Fee Assessed"
                value={
                  selectedCert.isFeeExempt || selectedCert.feeAmount === 0
                    ? 'Fee Exempt'
                    : formatPhp(selectedCert.feeAmount)
                }
                mono
              />
              <DetailField
                label="Requested At"
                value={selectedCert.requestedAt}
                mono
              />
              <DetailField
                label="Official Receipt #"
                value={selectedCert.orNumber ?? 'Pending release'}
                mono
              />
              <DetailField
                label="Approved By"
                value={selectedCert.approvedBy ?? 'Pending approval'}
              />
              <DetailField
                label="Released At"
                value={selectedCert.releasedAt ?? 'Not yet released'}
                mono
              />
            </dl>

            <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3.5 text-xs space-y-1">
              <p className="font-semibold text-bis-text">Stated Purpose</p>
              <p className="text-bis-muted">{selectedCert.purpose}</p>
              {selectedCert.businessName && (
                <p className="pt-1 font-medium text-bis-text">
                  Business Name: {selectedCert.businessName}
                </p>
              )}
              {selectedCert.declineReason && (
                <p className="pt-1 font-medium text-bis-danger">
                  Decline Reason: {selectedCert.declineReason}
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Transaction History
              </h3>
              <ol className="space-y-2.5 border-l border-bis-border pl-4 ml-1.5">
                {selectedCert.history.map((h, i) => (
                  <li key={`${h.timestamp}-${i}`} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-bis-text">
                        {h.action}
                      </span>
                      <span className="font-mono text-[10.5px] text-bis-muted">
                        {h.timestamp}
                      </span>
                    </div>
                    <p className="text-bis-muted">By {h.actor}</p>
                    {h.note && <p className="mt-0.5 text-bis-muted">{h.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </RecordDrawer>

      {/* New Certificate Request Modal */}
      <AppModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Certificate / Clearance Request"
        subtitle="Select resident, document template, and verify blotter standing."
        eyebrow="Certificates & Clearances"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-cert-form" variant="primary">
              Submit Request
            </AppButton>
          </>
        }
      >
        <form
          id="bis-cert-form"
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <FormField label="Applicant Resident" required error={formError.residentId}>
            <SelectInput
              value={residentId}
              hasError={Boolean(formError.residentId)}
              onChange={(e) => setResidentId(e.target.value)}
              placeholder="Select active resident..."
              options={activeResidents.map((r) => ({
                value: r.id,
                label: `${formatResidentFullName(r)} (${r.residentCode} • ${r.purok})`,
              }))}
            />
          </FormField>

          {selectedResidentForForm && (
            <div
              className={`rounded-lg border px-3 py-2.5 text-xs flex items-start gap-2 ${
                blotterMatchesForForm.length > 0
                  ? 'border-bis-danger/35 bg-bis-danger-soft text-bis-danger dark:text-[#FCA5A5]'
                  : 'border-bis-border bg-bis-surface-subtle text-bis-text'
              }`}
            >
              {blotterMatchesForForm.length > 0 ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-bis-accent dark:text-[#93B9E6]" />
              )}
              <div>
                <p className="font-semibold">
                  {blotterMatchesForForm.length > 0
                    ? `Warning: Active Blotter Case (${blotterMatchesForForm[0].caseNumber})`
                    : `Verified Active Resident • ${selectedResidentForForm.purok}`}
                </p>
                <p className="text-[11px] opacity-85">
                  {selectedResidentForForm.addressLine} •{' '}
                  {selectedResidentForForm.verificationStatus}
                </p>
              </div>
            </div>
          )}

          <FormField label="Document Type" required>
            <SelectInput
              value={documentType}
              onChange={(e) => {
                const nextType = e.target.value as CertificateDocumentType;
                setDocumentType(nextType);
                setIsFeeExempt(
                  (db.settings.certificateFees[nextType]?.feePhp ?? 0) === 0
                );
              }}
              options={DOC_TYPES.map((d) => ({
                value: d,
                label: `${d} (${
                  db.settings.certificateFees[d]?.feePhp
                    ? formatPhp(db.settings.certificateFees[d].feePhp)
                    : 'Free / Exempt'
                })`,
              }))}
            />
          </FormField>

          {documentType === 'Business Permit Clearance' && (
            <FormField
              label="Business / Establishment Name"
              required
              error={formError.businessName}
            >
              <TextInput
                value={businessName}
                hasError={Boolean(formError.businessName)}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Pangilinan General Merchandise"
              />
            </FormField>
          )}

          <FormField label="Stated Purpose" required error={formError.purpose}>
            <TextInput
              value={purpose}
              hasError={Boolean(formError.purpose)}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Local Employment / DSWD AICS / Postal ID"
            />
          </FormField>

          {configuredFee > 0 && (
            <CheckboxField
              id="cert-fee-exempt"
              label={`Grant Fee Exemption (Standard Fee: ${formatPhp(configuredFee)})`}
              description="Applicable for RA 11261 First-Time Jobseekers, indigency, or scholarship endorsements."
              checked={isFeeExempt}
              onChange={setIsFeeExempt}
            />
          )}

          <FormField label="Front-Desk Remarks">
            <TextAreaInput
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="ID presented or counter verification notes..."
            />
          </FormField>
        </form>
      </AppModal>

      {/* Printable Official Document Modal */}
      <AppModal
        open={Boolean(printCert)}
        onClose={() => setPrintCert(null)}
        title="Official Certificate Preview"
        eyebrow={printCert?.trackingCode}
        maxWidth="md"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setPrintCert(null)}>
              Close
            </AppButton>
            <AppButton
              variant="primary"
              startIcon={<Printer className="h-4 w-4" />}
              onClick={() => printCert && handlePrint(printCert)}
            >
              Print Certificate
            </AppButton>
          </>
        }
      >
        {printCert && (
          <div className="bis-printable-sheet rounded-lg border border-bis-border bg-white p-8 text-slate-900 space-y-6">
            <div className="border-b-2 border-[#173B63] pb-4 text-center">
              <p className="text-[11px] uppercase tracking-widest text-slate-600">
                Republic of the Philippines • {db.settings.provinceOrRegion}
              </p>
              <p className="text-xs font-medium text-slate-700">
                Municipality of {db.settings.municipalityOrCity}
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-wide text-[#173B63] uppercase">
                {db.settings.barangayName}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Office of the Punong Barangay
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-lg font-bold tracking-wider uppercase underline underline-offset-4">
                {printCert.documentType}
              </h4>
              <p className="mt-1 font-mono text-xs text-slate-600">
                Control No: {printCert.trackingCode}
                {printCert.orNumber ? ` • OR No: ${printCert.orNumber}` : ''}
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-800">
              <p className="font-semibold uppercase">TO WHOM IT MAY CONCERN:</p>
              <p>
                THIS IS TO CERTIFY that{' '}
                <strong className="uppercase">{printCert.residentName}</strong>
                {printResident
                  ? `, ${computeResidentAge(printResident.birthDate)} years of age, ${printResident.civilStatus.toLowerCase()}, Filipino`
                  : ''}
                , is a bona fide resident of{' '}
                <strong>
                  {printResident?.addressLine ?? printCert.purok},{' '}
                  {db.settings.barangayName}, {db.settings.municipalityOrCity}
                </strong>
                .
              </p>
              {printCert.businessName && (
                <p>
                  This further certifies endorsement for business establishment{' '}
                  <strong>{printCert.businessName}</strong> operating within the
                  territorial jurisdiction of this barangay.
                </p>
              )}
              <p>
                Based on existing barangay records, the above-named person is of
                good moral character and has no derogatory record on file as of
                issuance date.
              </p>
              <p>
                Issued upon request of the interested party for:{' '}
                <strong>{printCert.purpose}</strong>.
              </p>
              <p>
                Issued this{' '}
                <strong>{printCert.releasedAt?.slice(0, 10) ?? '2026-11-27'}</strong>{' '}
                at {db.settings.barangayName}, {db.settings.municipalityOrCity}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="pt-8">
                <div className="border-t border-slate-400 pt-1.5 font-semibold uppercase">
                  {db.settings.signatories.barangaySecretary}
                </div>
                <p className="text-slate-600">Attested: Barangay Secretary</p>
              </div>
              <div className="pt-8">
                <div className="border-t border-slate-400 pt-1.5 font-bold uppercase text-[#173B63]">
                  {db.settings.signatories.punongBarangay}
                </div>
                <p className="text-slate-600">Approved: Punong Barangay</p>
              </div>
            </div>
          </div>
        )}
      </AppModal>

      <ConfirmDialog
        open={Boolean(declineTarget)}
        onClose={() => setDeclineTarget(null)}
        title="Decline Certificate Request"
        description={
          declineTarget
            ? `Decline ${declineTarget.trackingCode} for ${declineTarget.residentName}?`
            : ''
        }
        confirmLabel="Decline Request"
        tone="danger"
        requireReason
        reasonLabel="Reason for Declining"
        reasonPlaceholder="e.g., Missing residency proof or unresolved Lupon hold"
        onConfirm={(reason) => {
          if (!declineTarget) return;
          handleTransition(declineTarget, 'Declined', reason);
          setDeclineTarget(null);
        }}
      />
    </div>
  );
}
