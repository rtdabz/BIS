'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Check, Eye, MoreHorizontal, Send } from 'lucide-react';
import {
  AppButton,
  AppModal,
  DataTable,
  SearchInput,
  SectionCard,
  StatCard,
  StatusBadge,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import type {
  CertificateRequestRecord,
  CertificateRequestStatus,
  StatusTone,
  TransactionsTabData,
} from '@/types/dashboard';

export interface TransactionsTabProps {
  transactionsData: TransactionsTabData;
}

const STATUS_TONE_MAP: Record<CertificateRequestStatus, StatusTone> = {
  Released: 'accent',
  Approved: 'neutral',
  'For Signature': 'warning',
  Pending: 'warning',
  Declined: 'danger',
};

const STATUS_OPTIONS: ('All' | CertificateRequestStatus)[] = [
  'All',
  'Pending',
  'For Signature',
  'Approved',
  'Released',
  'Declined',
];

/**
 * Transactions tab synced with BisStore so approvals and releases immediately
 * persist to session state, financial collections, and audit logs.
 */
export function TransactionsTab({ transactionsData }: TransactionsTabProps) {
  const { transitionCertificate } = useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = React.useState<
    'All' | CertificateRequestStatus
  >('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTx, setSelectedTx] =
    React.useState<CertificateRequestRecord | null>(null);
  const [menuState, setMenuState] = React.useState<{
    anchorEl: HTMLElement;
    row: CertificateRequestRecord;
  } | null>(null);

  const allowCertManage = canManage('certificates');

  const handleStatusChange = (
    row: CertificateRequestRecord,
    nextStatus: CertificateRequestStatus
  ) => {
    transitionCertificate(
      row.id,
      nextStatus,
      `Updated from Dashboard Transactions view`,
      actorMeta
    );
    setSelectedTx((prev) =>
      prev?.id === row.id ? { ...prev, status: nextStatus } : prev
    );
    setMenuState(null);
    showToast({
      title: `${row.trackingCode} marked ${nextStatus}`,
      message: `${row.residentName} — ${row.documentType}`,
      tone: 'success',
    });
  };

  const filteredTransactions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactionsData.recentTransactions.filter((row) => {
      const matchesStatus =
        statusFilter === 'All' || row.status === statusFilter;
      const matchesQuery =
        !q ||
        row.trackingCode.toLowerCase().includes(q) ||
        row.residentName.toLowerCase().includes(q) ||
        row.documentType.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [transactionsData.recentTransactions, statusFilter, searchQuery]);

  const columns: DataTableColumn<CertificateRequestRecord>[] = [
    {
      key: 'trackingCode',
      header: 'Reference Number',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.trackingCode}
        </span>
      ),
    },
    {
      key: 'residentName',
      header: 'Resident Name',
      render: (row) => (
        <div className="min-w-[140px]">
          <p className="font-medium text-bis-text">{row.residentName}</p>
          <p className="text-[11px] text-bis-muted">{row.purok}</p>
        </div>
      ),
    },
    {
      key: 'documentType',
      header: 'Document Type',
      render: (row) => (
        <div className="min-w-[160px]">
          <p className="font-medium text-bis-text">{row.documentType}</p>
          <p className="max-w-[220px] truncate text-[11px] text-bis-muted">
            {row.purpose}
          </p>
        </div>
      ),
    },
    {
      key: 'requestedAt',
      header: 'Request Date',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div>
          <p className="text-xs text-bis-text">{row.requestedAt}</p>
          <p className="text-[11px] text-bis-muted">{row.fee}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (row) => (
        <StatusBadge label={row.status} tone={STATUS_TONE_MAP[row.status]} />
      ),
    },
    {
      key: 'actions',
      header: 'Available Action',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (row) => {
        const canApprove =
          allowCertManage &&
          (row.status === 'Pending' || row.status === 'For Signature');
        const canRelease = allowCertManage && row.status === 'Approved';

        return (
          <div
            className="inline-flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {canApprove && (
              <button
                type="button"
                onClick={() => handleStatusChange(row, 'Approved')}
                className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-accent transition-colors hover:border-bis-accent/50 hover:bg-bis-accent-soft dark:text-[#93B9E6]"
              >
                <Check className="h-3 w-3" aria-hidden="true" />
                <span>Approve</span>
              </button>
            )}
            {canRelease && (
              <button
                type="button"
                onClick={() => handleStatusChange(row, 'Released')}
                className="inline-flex items-center gap-1 rounded-md bg-bis-accent px-2 py-1 text-xs font-medium text-bis-accent-contrast transition-colors hover:bg-bis-accent-hover"
              >
                <Send className="h-3 w-3" aria-hidden="true" />
                <span>Release</span>
              </button>
            )}
            {!canApprove && !canRelease && (
              <button
                type="button"
                onClick={() => setSelectedTx(row)}
                className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-muted transition-colors hover:text-bis-text"
              >
                <Eye className="h-3 w-3" aria-hidden="true" />
                <span>View</span>
              </button>
            )}

            <IconButton
              size="small"
              aria-label={`More actions for ${row.trackingCode}`}
              onClick={(e) =>
                setMenuState({ anchorEl: e.currentTarget, row })
              }
              className="text-bis-muted hover:text-bis-text"
            >
              <MoreHorizontal className="h-4 w-4" />
            </IconButton>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <section aria-label="Certificate transaction metrics">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {transactionsData.stats.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <SectionCard
        title="Recent Transactions"
        subtitle="Document clearance requests awaiting review, signature, or release."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search ref #, resident..."
              aria-label="Filter recent transactions"
              containerClassName="w-48 sm:w-56"
            />
            <AppButton variant="outline" size="sm" href="/certificates">
              Open Certificates
            </AppButton>
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bis-border bg-bis-surface-subtle px-5 py-2">
          <div
            role="group"
            aria-label="Filter transactions by status"
            className="flex flex-wrap items-center gap-1"
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === option
                    ? 'border border-bis-border bg-bis-surface text-bis-text shadow-[var(--bis-shadow-sm)]'
                    : 'text-bis-muted hover:text-bis-text'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <span className="text-xs text-bis-muted">
            Showing {filteredTransactions.length} requests
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={filteredTransactions}
          getRowKey={(row) => row.id}
          onRowClick={(row) => setSelectedTx(row)}
          emptyTitle="No matching transactions"
          emptyDescription="Clear the search input or choose another status filter."
        />
      </SectionCard>

      <Menu
        anchorEl={menuState?.anchorEl}
        open={Boolean(menuState)}
        onClose={() => setMenuState(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menuState) setSelectedTx(menuState.row);
            setMenuState(null);
          }}
        >
          View Details
        </MenuItem>
        {allowCertManage &&
          menuState &&
          menuState.row.status !== 'Approved' &&
          menuState.row.status !== 'Released' && (
            <MenuItem
              onClick={() => handleStatusChange(menuState.row, 'Approved')}
            >
              Mark as Approved
            </MenuItem>
          )}
        {allowCertManage &&
          menuState &&
          menuState.row.status !== 'Released' &&
          menuState.row.status !== 'Declined' && (
            <MenuItem
              onClick={() => handleStatusChange(menuState.row, 'Released')}
            >
              Mark as Released
            </MenuItem>
          )}
      </Menu>

      <AppModal
        open={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        title="Transaction Details"
        eyebrow={selectedTx?.trackingCode}
        badge={
          selectedTx && (
            <StatusBadge
              label={selectedTx.status}
              tone={STATUS_TONE_MAP[selectedTx.status]}
            />
          )
        }
        maxWidth="xs"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setSelectedTx(null)}>
              Close
            </AppButton>
            <AppButton
              variant="primary"
              href="/certificates"
              onClick={() => setSelectedTx(null)}
            >
              Open Certificates Module
            </AppButton>
          </>
        }
      >
        {selectedTx && (
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-bis-muted">Reference Number</dt>
              <dd className="font-mono font-semibold text-bis-text">
                {selectedTx.trackingCode}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bis-muted">Resident Name</dt>
              <dd className="font-medium text-bis-text">
                {selectedTx.residentName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bis-muted">Purok</dt>
              <dd className="text-bis-text">{selectedTx.purok}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bis-muted">Document Type</dt>
              <dd className="font-medium text-bis-text">
                {selectedTx.documentType}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bis-muted">Purpose</dt>
              <dd className="text-right text-bis-text">{selectedTx.purpose}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bis-muted">Fee</dt>
              <dd className="font-medium text-bis-text">{selectedTx.fee}</dd>
            </div>
          </dl>
        )}
      </AppModal>
    </div>
  );
}
