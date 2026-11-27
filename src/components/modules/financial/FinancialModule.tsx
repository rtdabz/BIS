'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Skeleton from '@mui/material/Skeleton';
import {
  Ban,
  Download,
  Pencil,
  Plus,
  Printer,
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
  TextInput,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { ChartTooltip } from '@/components/dashboard/ChartTooltip';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import { formatPhp } from '@/lib/store/bisSelectors';
import type {
  FinancialCategory,
  FinancialEntryType,
  FinancialTransactionRecord,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const INCOME_CATEGORIES: FinancialCategory[] = [
  'Clearance & Permit Fees',
  'IRA / NTA Allotment',
  'Real Property Tax Share',
  'Grants & Subsidies',
  'Other Local Revenue',
];

const EXPENSE_CATEGORIES: FinancialCategory[] = [
  'Personal Services / Honoraria',
  'MOOE & Office Operations',
  'Infrastructure & Capital Outlay',
  'DRRM & Disaster Relief',
  'Health & Social Welfare',
  'SK & Youth Fund',
];

const STATUS_TONE: Record<FinancialTransactionRecord['status'], StatusTone> = {
  Posted: 'accent',
  'Pending Verification': 'warning',
  Voided: 'danger',
};

export function FinancialModule() {
  const mounted = useIsMounted();
  const { db, createFinancialTransaction, updateFinancialTransaction, voidFinancialTransaction } =
    useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('financial');

  const [search, setSearch] = React.useState('');
  const [typeTab, setTypeTab] = React.useState<'All' | 'Income' | 'Expense' | 'Voided'>('All');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [entryType, setEntryType] = React.useState<FinancialEntryType>('Income');
  const [category, setCategory] = React.useState<FinancialCategory>('Clearance & Permit Fees');
  const [description, setDescription] = React.useState('');
  const [payeeOrPayer, setPayeeOrPayer] = React.useState('');
  const [amountPhp, setAmountPhp] = React.useState('');
  const [transactionDate, setTransactionDate] = React.useState('2026-11-27');
  const [paymentMethod, setPaymentMethod] =
    React.useState<FinancialTransactionRecord['paymentMethod']>('Cash');
  const [orOrVoucherNo, setOrOrVoucherNo] = React.useState('');
  const [entryStatus, setEntryStatus] =
    React.useState<FinancialTransactionRecord['status']>('Posted');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [voidTarget, setVoidTarget] =
    React.useState<FinancialTransactionRecord | null>(null);

  const activeEntries = React.useMemo(
    () => db.financialTransactions.filter((f) => f.status !== 'Voided'),
    [db.financialTransactions]
  );

  const totalIncome = activeEntries
    .filter((f) => f.type === 'Income')
    .reduce((sum, f) => sum + f.amountPhp, 0);
  const totalExpense = activeEntries
    .filter((f) => f.type === 'Expense')
    .reduce((sum, f) => sum + f.amountPhp, 0);
  const netBalance = totalIncome - totalExpense;
  const clearanceIncome = activeEntries
    .filter((f) => f.type === 'Income' && f.category === 'Clearance & Permit Fees')
    .reduce((sum, f) => sum + f.amountPhp, 0);

  const stats: StatMetric[] = [
    {
      id: 'fin-income',
      label: 'Total Posted Income',
      value: totalIncome,
      formattedValue: formatPhp(totalIncome),
      icon: 'TrendingUp',
      changeLabel: `${activeEntries.filter((f) => f.type === 'Income').length} receipts`,
      changeContext: 'NTA, RPT, fees & grants',
      trend: 'up',
      tone: 'success',
      href: '/financial',
    },
    {
      id: 'fin-expense',
      label: 'Total Disbursements',
      value: totalExpense,
      formattedValue: formatPhp(totalExpense),
      icon: 'TrendingDown',
      changeLabel: `${activeEntries.filter((f) => f.type === 'Expense').length} vouchers`,
      changeContext: 'personal, MOOE & projects',
      trend: 'neutral',
      tone: 'warning',
      href: '/financial',
    },
    {
      id: 'fin-balance',
      label: 'Net Fund Balance',
      value: netBalance,
      formattedValue: formatPhp(netBalance),
      icon: 'Wallet',
      changeLabel: netBalance >= 0 ? 'Surplus' : 'Deficit',
      changeContext: 'FY 2026 treasury balance',
      trend: netBalance >= 0 ? 'up' : 'down',
      tone: netBalance >= 0 ? 'accent' : 'danger',
      href: '/financial',
    },
    {
      id: 'fin-fees',
      label: 'Clearance Fee Collections',
      value: clearanceIncome,
      formattedValue: formatPhp(clearanceIncome),
      icon: 'FileCheck2',
      changeLabel: 'Counter',
      changeContext: 'linked to released docs',
      trend: 'up',
      tone: 'accent',
      href: '/certificates',
    },
  ];

  const monthlyCashflow = React.useMemo(() => {
    const months = [
      { code: '2026-07', label: 'Jul' },
      { code: '2026-08', label: 'Aug' },
      { code: '2026-09', label: 'Sep' },
      { code: '2026-10', label: 'Oct' },
      { code: '2026-11', label: 'Nov' },
    ];
    return months.map((m) => {
      const inc = activeEntries
        .filter((f) => f.type === 'Income' && f.transactionDate.startsWith(m.code))
        .reduce((s, f) => s + f.amountPhp, 0);
      const exp = activeEntries
        .filter((f) => f.type === 'Expense' && f.transactionDate.startsWith(m.code))
        .reduce((s, f) => s + f.amountPhp, 0);
      return { month: m.label, income: inc, expense: exp };
    });
  }, [activeEntries]);

  const expenseBreakdown = React.useMemo(() => {
    const map = new Map<string, number>();
    activeEntries
      .filter((f) => f.type === 'Expense')
      .forEach((f) => {
        map.set(f.category, (map.get(f.category) ?? 0) + f.amountPhp);
      });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }));
  }, [activeEntries, totalExpense]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.financialTransactions
      .filter((f) => {
        if (typeTab === 'Income' && (f.type !== 'Income' || f.status === 'Voided')) {
          return false;
        }
        if (typeTab === 'Expense' && (f.type !== 'Expense' || f.status === 'Voided')) {
          return false;
        }
        if (typeTab === 'Voided' && f.status !== 'Voided') return false;
        if (categoryFilter !== 'All' && f.category !== categoryFilter) {
          return false;
        }
        if (!q) return true;
        return (
          f.referenceNo.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.payeeOrPayer.toLowerCase().includes(q) ||
          f.orOrVoucherNo.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  }, [categoryFilter, db.financialTransactions, search, typeTab]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const openCreateModal = () => {
    setEditingId(null);
    setEntryType('Income');
    setCategory('Clearance & Permit Fees');
    setDescription('');
    setPayeeOrPayer('');
    setAmountPhp('');
    setTransactionDate('2026-11-27');
    setPaymentMethod('Cash');
    setOrOrVoucherNo('');
    setEntryStatus('Posted');
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (row: FinancialTransactionRecord) => {
    setEditingId(row.id);
    setEntryType(row.type);
    setCategory(row.category);
    setDescription(row.description);
    setPayeeOrPayer(row.payeeOrPayer);
    setAmountPhp(String(row.amountPhp));
    setTransactionDate(row.transactionDate);
    setPaymentMethod(row.paymentMethod);
    setOrOrVoucherNo(row.orOrVoucherNo);
    setEntryStatus(row.status);
    setErrors({});
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const numAmount = Number(amountPhp);
    if (!description.trim()) errs.description = 'Description is required.';
    if (!payeeOrPayer.trim()) errs.payeeOrPayer = 'Payee / Payer is required.';
    if (!orOrVoucherNo.trim()) errs.orOrVoucherNo = 'OR / Voucher # is required.';
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      errs.amountPhp = 'Enter a valid amount greater than zero.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      type: entryType,
      category,
      description: description.trim(),
      payeeOrPayer: payeeOrPayer.trim(),
      amountPhp: numAmount,
      transactionDate,
      paymentMethod,
      orOrVoucherNo: orOrVoucherNo.trim(),
      recordedBy: actorMeta.name,
      status: entryStatus,
    };

    if (editingId) {
      updateFinancialTransaction(editingId, payload, actorMeta);
      showToast({
        title: 'Financial entry updated',
        message: `${orOrVoucherNo} saved.`,
        tone: 'success',
      });
    } else {
      const created = createFinancialTransaction(payload, actorMeta);
      showToast({
        title: `${created.type} recorded`,
        message: `${created.referenceNo} — ${formatPhp(created.amountPhp)}`,
        tone: 'success',
      });
    }
    setFormOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Reference',
      'Date',
      'Type',
      'Category',
      'OR/Voucher',
      'Payee/Payer',
      'Amount PHP',
      'Status',
    ];
    const lines = filtered.map((f) => [
      f.referenceNo,
      f.transactionDate,
      f.type,
      `"${f.category}"`,
      f.orOrVoucherNo,
      `"${f.payeeOrPayer}"`,
      f.amountPhp,
      f.status,
    ]);
    const csv = [headers, ...lines].map((cols) => cols.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bis-financial-ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Financial ledger exported',
      message: `${filtered.length} transactions exported to CSV.`,
      tone: 'accent',
    });
  };

  const columns: DataTableColumn<FinancialTransactionRecord>[] = [
    {
      key: 'referenceNo',
      header: 'Ref / OR #',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
            {row.referenceNo}
          </p>
          <p className="font-mono text-[11px] text-bis-muted">
            {row.orOrVoucherNo}
          </p>
        </div>
      ),
    },
    {
      key: 'transactionDate',
      header: 'Date',
      className: 'whitespace-nowrap font-mono text-xs text-bis-muted',
      render: (row) => row.transactionDate,
    },
    {
      key: 'description',
      header: 'Particulars & Payee/Payer',
      render: (row) => (
        <div className="min-w-[200px] max-w-[300px]">
          <p className="truncate font-medium text-bis-text">
            {row.description}
          </p>
          <p className="truncate text-[11px] text-bis-muted">
            {row.payeeOrPayer} • {row.category}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <StatusBadge
          label={row.type}
          tone={row.type === 'Income' ? 'accent' : 'warning'}
          dot={false}
        />
      ),
    },
    {
      key: 'amountPhp',
      header: 'Amount',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span
          className={`font-mono text-xs font-semibold ${
            row.status === 'Voided'
              ? 'line-through text-bis-muted'
              : row.type === 'Income'
                ? 'text-bis-accent dark:text-[#93B9E6]'
                : 'text-bis-text'
          }`}
        >
          {row.type === 'Income' ? '+' : '−'}
          {formatPhp(row.amountPhp)}
        </span>
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
        allowManage && row.status !== 'Voided' ? (
          <div className="inline-flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openEditModal(row)}
              aria-label={`Edit ${row.referenceNo}`}
              className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setVoidTarget(row)}
              aria-label={`Void ${row.referenceNo}`}
              className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-danger hover:bg-bis-danger-soft"
            >
              <Ban className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Financial Management & Treasury"
        subtitle="Track barangay revenues, IRA/NTA shares, disbursement vouchers, and net fund summaries."
        actions={
          <>
            <AppButton
              variant="outline"
              startIcon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Print Summary
            </AppButton>
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
                startIcon={<Plus className="h-4 w-4" />}
                onClick={openCreateModal}
              >
                Record Transaction
              </AppButton>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Financial Cashflow Chart & Category Breakdown */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SectionCard
            title="Monthly Income vs. Disbursements"
            subtitle="Posted treasury inflows and expenditures (Jul–Nov 2026)."
            className="h-full"
          >
            <div className="h-[235px] w-full">
              {!mounted ? (
                <Skeleton variant="rounded" width="100%" height={235} />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  initialDimension={{ width: 520, height: 235 }}
                >
                  <BarChart
                    data={monthlyCashflow}
                    margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--bis-chart-grid)"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                      width={56}
                      tickFormatter={(v) => `₱${Math.round(Number(v) / 1000)}k`}
                    />
                    <Tooltip content={(props) => <ChartTooltip {...props} />} />
                    <Bar
                      dataKey="income"
                      name="Income (₱)"
                      fill="var(--bis-chart-primary)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expenses (₱)"
                      fill="var(--bis-chart-secondary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="xl:col-span-5">
          <SectionCard
            title="Disbursement Allocation by Category"
            subtitle="Share of posted barangay expenditures across budget lines."
            className="h-full"
          >
            <div className="space-y-3">
              {expenseBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium text-bis-text">
                      {item.category}
                    </span>
                    <span className="shrink-0 font-mono font-semibold text-bis-text">
                      {formatPhp(item.amount)}{' '}
                      <span className="font-normal text-bis-muted">
                        ({item.pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full border border-bis-border/50 bg-bis-surface-subtle">
                    <div
                      className="h-full rounded-full bg-bis-accent"
                      style={{ width: `${Math.max(4, item.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Financial Transaction Ledger"
        subtitle="Audit-ready record of official receipts and disbursement vouchers."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search ref #, OR/DV, payee..."
              aria-label="Search financial transactions"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'All', label: 'All Categories' },
                ...[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((c) => ({
                  value: c,
                  label: c,
                })),
              ]}
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bis-border bg-bis-surface-subtle px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {(['All', 'Income', 'Expense', 'Voided'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTypeTab(tab)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  typeTab === tab
                    ? 'border border-bis-border bg-bis-surface text-bis-text shadow-[var(--bis-shadow-sm)]'
                    : 'text-bis-muted hover:text-bis-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs text-bis-muted">
            {filtered.length} entries
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          emptyTitle="No matching financial records"
          emptyDescription="Adjust filters or record a new receipt or voucher."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="transactions"
            />
          }
        />
      </SectionCard>

      {/* Record / Edit Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Financial Entry' : 'Record Financial Transaction'}
        eyebrow="Treasury Ledger"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-fin-form" variant="primary">
              {editingId ? 'Save Changes' : 'Post Entry'}
            </AppButton>
          </>
        }
      >
        <form id="bis-fin-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Transaction Type">
              <SelectInput
                value={entryType}
                onChange={(e) => {
                  const t = e.target.value as FinancialEntryType;
                  setEntryType(t);
                  setCategory(
                    t === 'Income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
                  );
                }}
                options={[
                  { value: 'Income', label: 'Income / Collection' },
                  { value: 'Expense', label: 'Expense / Disbursement' },
                ]}
              />
            </FormField>
            <FormField label="Category">
              <SelectInput
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as FinancialCategory)
                }
                options={(entryType === 'Income'
                  ? INCOME_CATEGORIES
                  : EXPENSE_CATEGORIES
                ).map((c) => ({ value: c, label: c }))}
              />
            </FormField>
          </div>

          <FormField label="Particulars / Description" required error={errors.description}>
            <TextInput
              value={description}
              hasError={Boolean(errors.description)}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Office printer supplies or NTA share"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label={entryType === 'Income' ? 'Payer / Source' : 'Payee / Supplier'}
              required
              error={errors.payeeOrPayer}
            >
              <TextInput
                value={payeeOrPayer}
                hasError={Boolean(errors.payeeOrPayer)}
                onChange={(e) => setPayeeOrPayer(e.target.value)}
              />
            </FormField>
            <FormField
              label="OR / Voucher #"
              required
              error={errors.orOrVoucherNo}
            >
              <TextInput
                value={orOrVoucherNo}
                hasError={Boolean(errors.orOrVoucherNo)}
                onChange={(e) => setOrOrVoucherNo(e.target.value)}
                placeholder="OR-2026-xxxx / DV-2026-xxxx"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Amount (₱)" required error={errors.amountPhp}>
              <TextInput
                type="number"
                min={1}
                step="0.01"
                startAdornment="₱"
                value={amountPhp}
                hasError={Boolean(errors.amountPhp)}
                onChange={(e) => setAmountPhp(e.target.value)}
              />
            </FormField>
            <FormField label="Date">
              <TextInput
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </FormField>
            <FormField label="Payment Method">
              <SelectInput
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as FinancialTransactionRecord['paymentMethod']
                  )
                }
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Check', label: 'Check' },
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'Treasury Deposit', label: 'Treasury Deposit' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Posting Status">
            <SelectInput
              value={entryStatus}
              onChange={(e) =>
                setEntryStatus(
                  e.target.value as FinancialTransactionRecord['status']
                )
              }
              options={[
                { value: 'Posted', label: 'Posted' },
                { value: 'Pending Verification', label: 'Pending Verification' },
              ]}
            />
          </FormField>
        </form>
      </AppModal>

      <ConfirmDialog
        open={Boolean(voidTarget)}
        onClose={() => setVoidTarget(null)}
        title="Void Financial Entry"
        description={
          voidTarget
            ? `Void ${voidTarget.referenceNo} (${formatPhp(voidTarget.amountPhp)})? Voided records are excluded from totals but retained in the audit ledger.`
            : ''
        }
        confirmLabel="Void Transaction"
        tone="danger"
        requireReason
        reasonLabel="Void Reason"
        onConfirm={(reason) => {
          if (!voidTarget) return;
          voidFinancialTransaction(
            voidTarget.id,
            reason ?? 'Voided by treasury',
            actorMeta
          );
          showToast({
            title: `${voidTarget.referenceNo} voided`,
            tone: 'warning',
          });
          setVoidTarget(null);
        }}
      />
    </div>
  );
}
