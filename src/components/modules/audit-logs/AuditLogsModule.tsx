'use client';

import * as React from 'react';
import { Download, Eye } from 'lucide-react';
import {
  AppButton,
  DataTable,
  DetailField,
  FilterSelect,
  PageHeader,
  PaginationBar,
  RecordDrawer,
  SearchInput,
  SectionCard,
  StatusBadge,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useBisStore } from '@/lib/store/BisStoreContext';
import type { AuditActionType, AuditLogEntry } from '@/types/bis';
import type { StatusTone } from '@/types/dashboard';

const ACTION_TONE: Partial<Record<AuditActionType, StatusTone>> = {
  Create: 'accent',
  Approve: 'success',
  Release: 'success',
  Archive: 'warning',
  Void: 'danger',
  Publish: 'accent',
  Login: 'neutral',
  Logout: 'neutral',
};

export function AuditLogsModule() {
  const { db } = useBisStore();
  const { showToast } = useToast();

  const [search, setSearch] = React.useState('');
  const [moduleFilter, setModuleFilter] = React.useState('All');
  const [actionFilter, setActionFilter] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);
  const [selected, setSelected] = React.useState<AuditLogEntry | null>(null);

  const uniqueModules = React.useMemo(
    () => Array.from(new Set(db.auditLogs.map((l) => l.module))).sort(),
    [db.auditLogs]
  );

  const uniqueActions = React.useMemo(
    () => Array.from(new Set(db.auditLogs.map((l) => l.action))).sort(),
    [db.auditLogs]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.auditLogs.filter((l) => {
      if (moduleFilter !== 'All' && l.module !== moduleFilter) return false;
      if (actionFilter !== 'All' && l.action !== actionFilter) return false;
      if (!q) return true;
      return (
        l.targetCode.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q)
      );
    });
  }, [actionFilter, db.auditLogs, moduleFilter, search]);

  const paginated = React.useMemo(() => {
    const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Actor',
      'Role',
      'Module',
      'Action',
      'Target Code',
      'Summary',
    ];
    const lines = filtered.map((l) => [
      l.timestamp,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      l.module,
      l.action,
      l.targetCode,
      `"${l.summary}"`,
    ]);
    const csv = [headers, ...lines].map((cols) => cols.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bis-audit-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Audit log exported',
      message: `${filtered.length} entries written to CSV.`,
      tone: 'accent',
    });
  };

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      className: 'whitespace-nowrap font-mono text-xs text-bis-muted',
      render: (row) => row.timestamp,
    },
    {
      key: 'actorName',
      header: 'Actor',
      render: (row) => (
        <div className="min-w-[150px]">
          <p className="font-medium text-bis-text">{row.actorName}</p>
          <p className="text-[11px] text-bis-muted">{row.actorRole}</p>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module & Action',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge label={row.module} tone="neutral" dot={false} />
          <StatusBadge
            label={row.action}
            tone={ACTION_TONE[row.action] ?? 'neutral'}
          />
        </div>
      ),
    },
    {
      key: 'targetCode',
      header: 'Ref Code',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.targetCode}
        </span>
      ),
    },
    {
      key: 'summary',
      header: 'Activity Summary',
      render: (row) => (
        <p className="max-w-[360px] truncate text-xs text-bis-text">
          {row.summary}
        </p>
      ),
    },
    {
      key: 'inspect',
      header: '',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(row);
          }}
          aria-label={`Inspect audit ${row.id}`}
          className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System Management"
        title="Audit Logs & Activity Trail"
        subtitle="Chronological operational log automatically updated across every BIS module action."
        actions={
          <AppButton
            variant="outline"
            startIcon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </AppButton>
        }
      />

      <SectionCard
        title="Activity Ledger"
        subtitle="Click any audit entry to inspect actor, target reference, and remarks."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search actor, ref code, action..."
              aria-label="Search audit logs"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Module"
              value={moduleFilter}
              onChange={(val) => {
                setModuleFilter(val);
                setPage(1);
              }}
              options={[
                { value: 'All', label: 'All Modules' },
                ...uniqueModules.map((m) => ({ value: m, label: m })),
              ]}
            />
            <FilterSelect
              label="Action"
              value={actionFilter}
              onChange={(val) => {
                setActionFilter(val);
                setPage(1);
              }}
              options={[
                { value: 'All', label: 'All Actions' },
                ...uniqueActions.map((a) => ({ value: a, label: a })),
              ]}
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setSelected(r)}
          emptyTitle="No matching audit entries"
          emptyDescription="Adjust module or action filters."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[15, 30, 50]}
              itemLabel="entries"
            />
          }
        />
      </SectionCard>

      <RecordDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        eyebrow={selected?.targetCode}
        title={selected ? `${selected.module} — ${selected.action}` : ''}
        subtitle={selected?.timestamp}
      >
        {selected && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField label="Actor" value={selected.actorName} />
              <DetailField label="Role" value={selected.actorRole} />
              <DetailField label="Module" value={selected.module} />
              <DetailField label="Action" value={selected.action} />
              <DetailField label="Reference Code" value={selected.targetCode} mono />
              <DetailField label="Timestamp" value={selected.timestamp} mono />
            </dl>
            <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3.5 text-xs space-y-1.5">
              <p className="font-semibold text-bis-text">Summary</p>
              <p className="text-bis-muted">{selected.summary}</p>
              {selected.details && (
                <p className="pt-1 text-bis-text">Details: {selected.details}</p>
              )}
            </div>
          </div>
        )}
      </RecordDrawer>
    </div>
  );
}
