'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Skeleton from '@mui/material/Skeleton';
import { Download } from 'lucide-react';
import {
  AppButton,
  DataTable,
  SectionCard,
  StatusBadge,
  type DataTableColumn,
} from '@/components/ui';
import { useIsMounted } from '@/hooks/useIsMounted';
import type {
  DateRangePreset,
  PeriodStatisticRow,
  RegistrationTrendPoint,
  ReportsAnalyticsTabData,
  TransactionTrendPoint,
} from '@/types/dashboard';
import { ChartTooltip } from './ChartTooltip';
import { RegistrationTrendsChart } from './RegistrationTrendsChart';

export interface ReportsAnalyticsTabProps {
  reportsData: ReportsAnalyticsTabData;
  registrationTrends: RegistrationTrendPoint[];
  incidentTrends: TransactionTrendPoint[];
  dateRange: DateRangePreset;
}

type GranularityMode = 'monthly' | 'yearly';

/**
 * Reports & Analytics tab organized cleanly into Population, Transactions,
 * and Blotter & Incidents without repeating KPI cards from other tabs.
 */
export function ReportsAnalyticsTab({
  reportsData,
  registrationTrends,
  incidentTrends,
  dateRange,
}: ReportsAnalyticsTabProps) {
  const mounted = useIsMounted();
  const [granularity, setGranularity] = React.useState<GranularityMode>('monthly');
  const [exportNote, setExportNote] = React.useState<string | null>(null);

  const activeSeries = React.useMemo(() => {
    if (granularity === 'yearly') {
      return reportsData.yearlySeries;
    }
    if (dateRange === '3m') {
      return reportsData.monthlySeries.slice(-3);
    }
    return reportsData.monthlySeries;
  }, [granularity, dateRange, reportsData.monthlySeries, reportsData.yearlySeries]);

  const activeIncidentTrends = React.useMemo(() => {
    if (dateRange === '3m') return incidentTrends.slice(-3);
    if (dateRange === '30d') return incidentTrends.slice(-4);
    return incidentTrends;
  }, [incidentTrends, dateRange]);

  const blotterTotals = React.useMemo(() => {
    return reportsData.blotterIncidentSummary.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        settled: acc.settled + item.settled,
        active: acc.active + item.active,
      }),
      { total: 0, settled: 0, active: 0 }
    );
  }, [reportsData.blotterIncidentSummary]);

  const handleExportCsv = () => {
    const header = [
      'Period',
      'Residents Added',
      'Households Added',
      'Certificates Issued',
      'Lupon Settlement Rate',
      'Collections',
    ];
    const lines = activeSeries.map((row) => [
      row.period,
      row.residentsRegistered,
      row.householdsAdded,
      row.certificatesIssued,
      row.blotterSettledRate,
      row.collectionsPhp,
    ]);
    const csv = [header, ...lines].map((cols) => cols.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bis-${granularity}-summary-2026.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNote(`Exported ${granularity} CSV`);
    window.setTimeout(() => setExportNote(null), 2500);
  };

  const summaryColumns: DataTableColumn<PeriodStatisticRow>[] = [
    {
      key: 'period',
      header: granularity === 'monthly' ? 'Month' : 'Fiscal Year',
      render: (row) => (
        <span className="font-semibold text-bis-text">{row.period}</span>
      ),
    },
    {
      key: 'residentsRegistered',
      header: 'Residents Added',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-bis-text">
          {row.residentsRegistered.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'householdsAdded',
      header: 'Households Added',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-bis-text">
          {row.householdsAdded.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'certificatesIssued',
      header: 'Certificates Issued',
      align: 'right',
      render: (row) => (
        <span className="font-medium tabular-nums text-bis-text">
          {row.certificatesIssued.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'blotterSettledRate',
      header: 'Lupon Settled',
      align: 'right',
      render: (row) => (
        <StatusBadge label={row.blotterSettledRate} tone="accent" dot={false} />
      ),
    },
    {
      key: 'collectionsPhp',
      header: 'Fee Collections',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-text">
          {row.collectionsPhp}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Granularity Controls & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-bis-border bg-bis-surface px-5 py-3.5 shadow-[var(--bis-shadow-sm)]">
        <div>
          <h2 className="text-[15px] font-semibold text-bis-text">
            Operational Reports &amp; Period Analytics
          </h2>
          <p className="text-xs text-bis-muted">
            Segmented performance across population, document issuance, and Lupon cases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {exportNote && <StatusBadge label={exportNote} tone="accent" />}

          <div
            role="group"
            aria-label="Statistics granularity"
            className="inline-flex rounded-lg border border-bis-border bg-bis-surface-subtle p-0.5"
          >
            {(
              [
                { id: 'monthly', label: 'Monthly' },
                { id: 'yearly', label: 'Yearly' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGranularity(opt.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  granularity === opt.id
                    ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                    : 'text-bis-muted hover:text-bis-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <AppButton
            variant="outline"
            size="sm"
            startIcon={<Download className="h-3.5 w-3.5" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </AppButton>
        </div>
      </div>

      {/* 1. Population Section */}
      <section aria-label="Population reports" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2 border-b border-bis-border pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
            Population
          </h3>
          <span className="text-xs text-[#475569] dark:text-bis-muted">
            Intake growth, demographic distribution, and household averages
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <RegistrationTrendsChart
              data={registrationTrends}
              dateRange={dateRange}
              title="Population & Household Trends"
              subtitle="Monthly additions synced with active reporting period."
            />
          </div>

          <div className="xl:col-span-6">
            <SectionCard
              title="Demographic & Household Statistics"
              subtitle="Population and household density across Purok 1–7."
              className="h-full"
              headerAction={
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: 'var(--bis-chart-primary)' }}
                      aria-hidden="true"
                    />
                    <span className="text-bis-muted">Residents</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: 'var(--bis-chart-secondary)' }}
                      aria-hidden="true"
                    />
                    <span className="text-bis-muted">Households</span>
                  </span>
                </div>
              }
            >
              <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-bis-border bg-bis-surface-subtle p-3 text-center">
                <div>
                  <p className="text-[11px] text-bis-muted">Avg Household Size</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-bis-text">
                    4.09
                  </p>
                </div>
                <div className="border-x border-bis-border">
                  <p className="text-[11px] text-bis-muted">Active Puroks</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-bis-text">
                    7 Clusters
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-bis-muted">Registered Voters</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-bis-text">
                    63.2%
                  </p>
                </div>
              </div>

              <div className="h-[225px] w-full">
                {!mounted ? (
                  <Skeleton variant="rounded" width="100%" height={225} />
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 480, height: 225 }}
                  >
                    <BarChart
                      data={reportsData.purokDemographics}
                      margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--bis-chart-grid)"
                      />
                      <XAxis
                        dataKey="purok"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                        width={44}
                      />
                      <Tooltip content={(props) => <ChartTooltip {...props} />} />
                      <Bar
                        dataKey="residents"
                        name="Residents"
                        fill="var(--bis-chart-primary)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="households"
                        name="Households"
                        fill="var(--bis-chart-secondary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </section>

      {/* 2. Transactions Section */}
      <section aria-label="Transaction reports" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2 border-b border-bis-border pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
            Transactions
          </h3>
          <span className="text-xs text-[#475569] dark:text-bis-muted">
            Document issuance mix, request volume, and turnaround times
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <SectionCard
              title={`${granularity === 'monthly' ? 'Monthly Transaction Volume' : 'Yearly Issuance Volume'}`}
              subtitle="Request processing volume alongside civil registration growth."
              className="h-full"
            >
              <div className="h-[250px] w-full">
                {!mounted ? (
                  <Skeleton variant="rounded" width="100%" height={250} />
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 520, height: 250 }}
                  >
                    <BarChart
                      data={activeSeries}
                      margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--bis-chart-grid)"
                      />
                      <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                        width={46}
                      />
                      <Tooltip content={(props) => <ChartTooltip {...props} />} />
                      <Bar
                        dataKey="certificatesIssued"
                        name="Certificates Issued"
                        fill="var(--bis-chart-primary)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="residentsRegistered"
                        name="Residents Added"
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
              title="Document Issuance Summary"
              subtitle="Year-to-date distribution and counter turnaround."
              className="h-full"
            >
              <div className="space-y-3.5">
                {reportsData.certificateIssuanceSummary.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-bis-text">
                        {item.type}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-bis-text">
                        {item.count.toLocaleString()}{' '}
                        <span className="font-normal text-bis-muted">
                          ({item.sharePercent}% • {item.avgTurnaround})
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full border border-bis-border/50 bg-bis-surface-subtle">
                      <div
                        className="h-full rounded-full bg-bis-accent"
                        style={{ width: `${Math.max(5, item.sharePercent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </section>

      {/* 3. Blotter and Incidents Section */}
      <section aria-label="Blotter and incident reports" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2 border-b border-bis-border pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
            Blotter and Incidents
          </h3>
          <span className="text-xs text-[#475569] dark:text-bis-muted">
            Katarungang Pambarangay case counts, resolution status, and incident trends
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <SectionCard
              title="Recorded Cases & Resolution"
              subtitle="Blotter case categories settled via Lupon mediation."
              className="h-full"
            >
              <div className="mb-4 grid grid-cols-3 gap-2.5 rounded-lg border border-bis-border bg-bis-surface-subtle p-3 text-center">
                <div>
                  <p className="text-[11px] text-bis-muted">Recorded Cases</p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums text-bis-text">
                    {blotterTotals.total}
                  </p>
                </div>
                <div className="border-x border-bis-border">
                  <p className="text-[11px] text-bis-muted">Resolved</p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums text-bis-accent dark:text-[#93B9E6]">
                    {blotterTotals.settled}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-bis-muted">Active</p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums text-bis-warning">
                    {blotterTotals.active}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {reportsData.blotterIncidentSummary.map((item) => (
                  <div
                    key={item.category}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bis-border bg-bis-surface-subtle/50 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-bis-text">
                        {item.category}
                      </p>
                      <p className="text-xs text-bis-muted">
                        {item.total} total logged
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge
                        label={`${item.settled} resolved`}
                        tone="neutral"
                        dot={false}
                      />
                      <StatusBadge
                        label={`${item.active} active`}
                        tone={item.active >= 3 ? 'danger' : 'warning'}
                        dot={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="xl:col-span-7">
            <SectionCard
              title="Incident Trends"
              subtitle="Monthly blotter reports recorded across the barangay."
              className="h-full"
            >
              <div className="h-[270px] w-full">
                {!mounted ? (
                  <Skeleton variant="rounded" width="100%" height={270} />
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 520, height: 270 }}
                  >
                    <AreaChart
                      data={activeIncidentTrends}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--bis-chart-grid)"
                      />
                      <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                        width={40}
                      />
                      <Tooltip
                        content={(props) => (
                          <ChartTooltip
                            {...props}
                            labelSuffix=" 2026"
                            valueSuffix=" cases"
                          />
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="blotter"
                        name="Recorded Incidents"
                        stroke="var(--bis-chart-primary)"
                        strokeWidth={2.2}
                        fill="var(--bis-chart-primary)"
                        fillOpacity={0.14}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </section>

      {/* Audit Ledger Table */}
      <SectionCard
        title={`${granularity === 'monthly' ? 'Monthly' : 'Yearly'} Period Ledger`}
        subtitle="Export-ready breakdown for DILG and council reporting."
        noPadding
      >
        <DataTable
          columns={summaryColumns}
          rows={activeSeries}
          getRowKey={(row) => row.period}
        />
      </SectionCard>
    </div>
  );
}
