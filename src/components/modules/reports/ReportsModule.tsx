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
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import {
  AppButton,
  DataTable,
  FilterSelect,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { ChartTooltip } from '@/components/dashboard/ChartTooltip';
import { PUROK_LIST } from '@/data/mock/bisSeedResidents';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useBisStore } from '@/lib/store/BisStoreContext';
import {
  computeResidentAge,
  formatPhp,
  isActiveBlotter,
} from '@/lib/store/bisSelectors';
import type { StatMetric } from '@/types/dashboard';

type ReportType =
  | 'population'
  | 'certificates'
  | 'blotter'
  | 'financial'
  | 'sectoral';

interface GenericReportRow {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
}

export function ReportsModule() {
  const mounted = useIsMounted();
  const { db } = useBisStore();
  const { showToast } = useToast();

  const [reportType, setReportType] = React.useState<ReportType>('population');
  const [purokFilter, setPurokFilter] = React.useState('All');
  const [dateFrom, setDateFrom] = React.useState('2026-06-01');
  const [dateTo, setDateTo] = React.useState('2026-11-30');

  const inRange = React.useCallback(
    (isoDate: string) => {
      const d = isoDate.slice(0, 10);
      return (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
    },
    [dateFrom, dateTo]
  );

  const reportPayload = React.useMemo(() => {
    if (reportType === 'population') {
      const activeResidents = db.residents.filter(
        (r) =>
          r.status === 'Active' &&
          (purokFilter === 'All' || r.purok === purokFilter) &&
          inRange(r.registeredAt)
      );
      const puroks =
        purokFilter === 'All' ? PUROK_LIST : PUROK_LIST.filter((p) => p === purokFilter);
      const rows: GenericReportRow[] = puroks.map((p) => {
        const list = activeResidents.filter((r) => r.purok === p);
        const hhCount = db.households.filter(
          (h) => h.status === 'Active' && h.purok === p
        ).length;
        const seniors = list.filter(
          (r) => computeResidentAge(r.birthDate) >= 60
        ).length;
        const voters = list.filter((r) => r.isRegisteredVoter).length;
        return {
          id: p,
          col1: p,
          col2: String(list.length),
          col3: String(hhCount),
          col4: String(voters),
          col5: String(seniors),
        };
      });
      return {
        title: 'Population & Demographic Summary Report',
        subtitle: 'Active inhabitants, households, registered voters, and senior citizens by purok.',
        columns: ['Purok', 'Residents', 'Households', 'Registered Voters', 'Senior Citizens'],
        chartData: rows.map((r) => ({
          name: r.col1,
          primary: Number(r.col2),
          secondary: Number(r.col4),
        })),
        primaryName: 'Residents',
        secondaryName: 'Voters',
        rows,
        stats: [
          {
            id: 'rep-1',
            label: 'Matched Residents',
            value: activeResidents.length,
            formattedValue: String(activeResidents.length),
            icon: 'Users' as const,
            changeLabel: purokFilter,
            changeContext: 'filtered active records',
            trend: 'up' as const,
            tone: 'success' as const,
            href: '/residents',
          },
          {
            id: 'rep-2',
            label: 'Female / Male Ratio',
            value: activeResidents.filter((r) => r.sex === 'Female').length,
            formattedValue: `${activeResidents.filter((r) => r.sex === 'Female').length}F / ${activeResidents.filter((r) => r.sex === 'Male').length}M`,
            icon: 'UserCheck' as const,
            changeLabel: 'Balanced',
            changeContext: 'gender distribution',
            trend: 'neutral' as const,
            tone: 'accent' as const,
            href: '/residents',
          },
          {
            id: 'rep-3',
            label: 'Registered Voters',
            value: activeResidents.filter((r) => r.isRegisteredVoter).length,
            formattedValue: String(
              activeResidents.filter((r) => r.isRegisteredVoter).length
            ),
            icon: 'CheckCircle2' as const,
            changeLabel: `${activeResidents.length > 0 ? Math.round((activeResidents.filter((r) => r.isRegisteredVoter).length / activeResidents.length) * 100) : 0}%`,
            changeContext: 'voting-age share',
            trend: 'up' as const,
            tone: 'accent' as const,
            href: '/residents',
          },
          {
            id: 'rep-4',
            label: 'Active Households',
            value: rows.reduce((s, r) => s + Number(r.col3), 0),
            formattedValue: String(rows.reduce((s, r) => s + Number(r.col3), 0)),
            icon: 'Home' as const,
            changeLabel: 'Units',
            changeContext: 'across selected puroks',
            trend: 'neutral' as const,
            tone: 'accent' as const,
            href: '/households',
          },
        ] satisfies StatMetric[],
      };
    }

    if (reportType === 'certificates') {
      const list = db.certificates.filter(
        (c) =>
          (purokFilter === 'All' || c.purok === purokFilter) &&
          inRange(c.requestedAt)
      );
      const map = new Map<
        string,
        { total: number; released: number; pending: number; fees: number }
      >();
      list.forEach((c) => {
        const cur = map.get(c.documentType) ?? {
          total: 0,
          released: 0,
          pending: 0,
          fees: 0,
        };
        cur.total += 1;
        if (c.status === 'Released') {
          cur.released += 1;
          cur.fees += c.isFeeExempt ? 0 : c.feeAmount;
        }
        if (c.status === 'Pending' || c.status === 'For Signature') {
          cur.pending += 1;
        }
        map.set(c.documentType, cur);
      });
      const rows: GenericReportRow[] = Array.from(map.entries()).map(
        ([docType, val]) => ({
          id: docType,
          col1: docType,
          col2: String(val.total),
          col3: String(val.released),
          col4: String(val.pending),
          col5: formatPhp(val.fees),
        })
      );
      const totalFees = list
        .filter((c) => c.status === 'Released' && !c.isFeeExempt)
        .reduce((s, c) => s + c.feeAmount, 0);

      return {
        title: 'Certificate & Clearance Issuance Report',
        subtitle: 'Request counts, release completion, and collected clearance fees.',
        columns: ['Document Type', 'Total Requests', 'Released', 'Pending', 'Fees Collected'],
        chartData: rows.map((r) => ({
          name: r.col1.split(' ')[0],
          primary: Number(r.col2),
          secondary: Number(r.col3),
        })),
        primaryName: 'Requested',
        secondaryName: 'Released',
        rows,
        stats: [
          {
            id: 'rep-c1',
            label: 'Total Requests',
            value: list.length,
            formattedValue: String(list.length),
            icon: 'FileText' as const,
            changeLabel: 'Filtered',
            changeContext: 'selected date range',
            trend: 'up' as const,
            tone: 'accent' as const,
            href: '/certificates',
          },
          {
            id: 'rep-c2',
            label: 'Released',
            value: list.filter((c) => c.status === 'Released').length,
            formattedValue: String(
              list.filter((c) => c.status === 'Released').length
            ),
            icon: 'FileCheck2' as const,
            changeLabel: 'Completed',
            changeContext: 'printed & claimed',
            trend: 'up' as const,
            tone: 'success' as const,
            href: '/certificates',
          },
          {
            id: 'rep-c3',
            label: 'Pending / Signature',
            value: list.filter(
              (c) => c.status === 'Pending' || c.status === 'For Signature'
            ).length,
            formattedValue: String(
              list.filter(
                (c) => c.status === 'Pending' || c.status === 'For Signature'
              ).length
            ),
            icon: 'FileClock' as const,
            changeLabel: 'Queue',
            changeContext: 'open requests',
            trend: 'neutral' as const,
            tone: 'warning' as const,
            href: '/certificates',
          },
          {
            id: 'rep-c4',
            label: 'Fee Collections',
            value: totalFees,
            formattedValue: formatPhp(totalFees),
            icon: 'Wallet' as const,
            changeLabel: 'Posted',
            changeContext: 'released document fees',
            trend: 'up' as const,
            tone: 'accent' as const,
            href: '/financial',
          },
        ] satisfies StatMetric[],
      };
    }

    if (reportType === 'blotter') {
      const list = db.blotterRecords.filter(
        (b) =>
          (purokFilter === 'All' || b.purok === purokFilter) &&
          inRange(b.filedAt)
      );
      const map = new Map<
        string,
        { total: number; active: number; settled: number; cfa: number }
      >();
      list.forEach((b) => {
        const cur = map.get(b.incidentCategory) ?? {
          total: 0,
          active: 0,
          settled: 0,
          cfa: 0,
        };
        cur.total += 1;
        if (isActiveBlotter(b)) cur.active += 1;
        if (b.status === 'Amicably Settled') cur.settled += 1;
        if (b.status === 'CFA Issued') cur.cfa += 1;
        map.set(b.incidentCategory, cur);
      });
      const rows: GenericReportRow[] = Array.from(map.entries()).map(
        ([cat, val]) => ({
          id: cat,
          col1: cat,
          col2: String(val.total),
          col3: String(val.settled),
          col4: String(val.active),
          col5: String(val.cfa),
        })
      );
      const activeTotal = list.filter(isActiveBlotter).length;
      const settledTotal = list.filter(
        (b) => b.status === 'Amicably Settled'
      ).length;

      return {
        title: 'Lupon & Blotter Resolution Report',
        subtitle: 'Katarungang Pambarangay incident categories and amicable settlement rates.',
        columns: ['Incident Category', 'Total Cases', 'Amicably Settled', 'Active / Open', 'CFA Issued'],
        chartData: rows.map((r) => ({
          name: r.col1.split('/')[0].trim(),
          primary: Number(r.col2),
          secondary: Number(r.col3),
        })),
        primaryName: 'Total Cases',
        secondaryName: 'Settled',
        rows,
        stats: [
          {
            id: 'rep-b1',
            label: 'Total Cases',
            value: list.length,
            formattedValue: String(list.length),
            icon: 'ShieldAlert' as const,
            changeLabel: 'Docketed',
            changeContext: 'in period',
            trend: 'neutral' as const,
            tone: 'accent' as const,
            href: '/blotter',
          },
          {
            id: 'rep-b2',
            label: 'Amicably Settled',
            value: settledTotal,
            formattedValue: String(settledTotal),
            icon: 'Scale' as const,
            changeLabel: `${list.length > 0 ? Math.round((settledTotal / list.length) * 100) : 0}%`,
            changeContext: 'settlement rate',
            trend: 'up' as const,
            tone: 'success' as const,
            href: '/blotter',
          },
          {
            id: 'rep-b3',
            label: 'Active / Mediation',
            value: activeTotal,
            formattedValue: String(activeTotal),
            icon: 'FileClock' as const,
            changeLabel: 'Ongoing',
            changeContext: 'hearings queued',
            trend: 'neutral' as const,
            tone: activeTotal > 0 ? 'warning' : 'accent',
            href: '/blotter',
          },
          {
            id: 'rep-b4',
            label: 'Complaints Logged',
            value: db.complaints.filter(
              (c) => purokFilter === 'All' || c.purok === purokFilter
            ).length,
            formattedValue: String(
              db.complaints.filter(
                (c) => purokFilter === 'All' || c.purok === purokFilter
              ).length
            ),
            icon: 'MessageSquareWarning' as const,
            changeLabel: 'Desk',
            changeContext: 'related grievances',
            trend: 'neutral' as const,
            tone: 'accent' as const,
            href: '/complaints',
          },
        ] satisfies StatMetric[],
      };
    }

    if (reportType === 'financial') {
      const list = db.financialTransactions.filter(
        (f) => f.status !== 'Voided' && inRange(f.transactionDate)
      );
      const map = new Map<
        string,
        { type: string; count: number; total: number }
      >();
      list.forEach((f) => {
        const cur = map.get(f.category) ?? {
          type: f.type,
          count: 0,
          total: 0,
        };
        cur.count += 1;
        cur.total += f.amountPhp;
        map.set(f.category, cur);
      });
      const rows: GenericReportRow[] = Array.from(map.entries()).map(
        ([cat, val]) => ({
          id: cat,
          col1: cat,
          col2: val.type,
          col3: String(val.count),
          col4: formatPhp(val.total),
          col5: `${Math.round((val.total / Math.max(1, list.reduce((s, x) => s + x.amountPhp, 0))) * 100)}%`,
        })
      );
      const inc = list
        .filter((f) => f.type === 'Income')
        .reduce((s, f) => s + f.amountPhp, 0);
      const exp = list
        .filter((f) => f.type === 'Expense')
        .reduce((s, f) => s + f.amountPhp, 0);

      return {
        title: 'Treasury & Financial Summary Report',
        subtitle: 'Categorized inflows and disbursements across the selected reporting window.',
        columns: ['Budget Category', 'Type', 'Entries', 'Total Amount', 'Volume Share'],
        chartData: rows.slice(0, 7).map((r) => ({
          name: r.col1.split(' ')[0],
          primary: Number(r.col4.replace(/[₱,]/g, '')),
          secondary: Number(r.col3) * 1000,
        })),
        primaryName: 'Total PHP',
        secondaryName: 'Activity Scale',
        rows,
        stats: [
          {
            id: 'rep-f1',
            label: 'Posted Income',
            value: inc,
            formattedValue: formatPhp(inc),
            icon: 'TrendingUp' as const,
            changeLabel: 'Receipts',
            changeContext: 'in reporting window',
            trend: 'up' as const,
            tone: 'success' as const,
            href: '/financial',
          },
          {
            id: 'rep-f2',
            label: 'Posted Expenses',
            value: exp,
            formattedValue: formatPhp(exp),
            icon: 'TrendingDown' as const,
            changeLabel: 'Disbursed',
            changeContext: 'in reporting window',
            trend: 'neutral' as const,
            tone: 'warning' as const,
            href: '/financial',
          },
          {
            id: 'rep-f3',
            label: 'Net Balance',
            value: inc - exp,
            formattedValue: formatPhp(inc - exp),
            icon: 'Wallet' as const,
            changeLabel: inc >= exp ? 'Surplus' : 'Deficit',
            changeContext: 'net treasury position',
            trend: 'up' as const,
            tone: 'accent' as const,
            href: '/financial',
          },
          {
            id: 'rep-f4',
            label: 'Total Entries',
            value: list.length,
            formattedValue: String(list.length),
            icon: 'FileText' as const,
            changeLabel: 'Posted',
            changeContext: 'excluding voided',
            trend: 'neutral' as const,
            tone: 'accent' as const,
            href: '/financial',
          },
        ] satisfies StatMetric[],
      };
    }

    // sectoral
    const filteredSectoral = db.sectoralRecords.filter((s) => {
      if (purokFilter === 'All') return true;
      const r = db.residents.find((res) => res.id === s.residentId);
      return r?.purok === purokFilter;
    });
    const map = new Map<
      string,
      { total: number; verified: number; pending: number; renewal: number }
    >();
    filteredSectoral.forEach((s) => {
      const cur = map.get(s.sector) ?? {
        total: 0,
        verified: 0,
        pending: 0,
        renewal: 0,
      };
      cur.total += 1;
      if (s.verificationStatus === 'Verified') cur.verified += 1;
      if (s.verificationStatus === 'Pending Validation') cur.pending += 1;
      if (s.verificationStatus === 'For Renewal') cur.renewal += 1;
      map.set(s.sector, cur);
    });
    const rows: GenericReportRow[] = Array.from(map.entries()).map(
      ([sec, val]) => ({
        id: sec,
        col1: sec,
        col2: String(val.total),
        col3: String(val.verified),
        col4: String(val.pending),
        col5: String(val.renewal),
      })
    );

    return {
      title: 'Sectoral Registry & Verification Report',
      subtitle: 'Membership and validation standing across OSCA, PDAO, Solo Parent, 4Ps, and KK.',
      columns: ['Sector', 'Enrolled', 'Verified', 'Pending Validation', 'For Renewal'],
      chartData: rows.map((r) => ({
        name: r.col1,
        primary: Number(r.col2),
        secondary: Number(r.col3),
      })),
      primaryName: 'Enrolled',
      secondaryName: 'Verified',
      rows,
      stats: [
        {
          id: 'rep-s1',
          label: 'Total Enrollments',
          value: filteredSectoral.length,
          formattedValue: String(filteredSectoral.length),
          icon: 'UserCheck' as const,
          changeLabel: '5 sectors',
          changeContext: 'active registries',
          trend: 'up' as const,
          tone: 'accent' as const,
          href: '/sectoral-records',
        },
        {
          id: 'rep-s2',
          label: 'Verified IDs',
          value: filteredSectoral.filter((s) => s.verificationStatus === 'Verified')
            .length,
          formattedValue: String(
            filteredSectoral.filter((s) => s.verificationStatus === 'Verified')
              .length
          ),
          icon: 'CheckCircle2' as const,
          changeLabel: 'Active',
          changeContext: 'validated memberships',
          trend: 'up' as const,
          tone: 'success' as const,
          href: '/sectoral-records',
        },
        {
          id: 'rep-s3',
          label: 'Pending / Renewal',
          value: filteredSectoral.filter(
            (s) =>
              s.verificationStatus === 'Pending Validation' ||
              s.verificationStatus === 'For Renewal'
          ).length,
          formattedValue: String(
            filteredSectoral.filter(
              (s) =>
                s.verificationStatus === 'Pending Validation' ||
                s.verificationStatus === 'For Renewal'
            ).length
          ),
          icon: 'FileClock' as const,
          changeLabel: 'Action',
          changeContext: 'awaiting ID update',
          trend: 'neutral' as const,
          tone: 'warning' as const,
          href: '/sectoral-records',
        },
        {
          id: 'rep-s4',
          label: '4Ps Households',
          value: db.households.filter((h) => h.is4PsHousehold).length,
          formattedValue: String(
            db.households.filter((h) => h.is4PsHousehold).length
          ),
          icon: 'Home' as const,
          changeLabel: 'Tagged',
          changeContext: 'Pantawid family units',
          trend: 'neutral' as const,
          tone: 'accent' as const,
          href: '/households',
        },
      ] satisfies StatMetric[],
    };
  }, [db, inRange, purokFilter, reportType]);

  const columns: DataTableColumn<GenericReportRow>[] = [
    {
      key: 'col1',
      header: reportPayload.columns[0],
      render: (r) => <span className="font-semibold text-bis-text">{r.col1}</span>,
    },
    {
      key: 'col2',
      header: reportPayload.columns[1],
      align: 'right',
      render: (r) => <span className="tabular-nums">{r.col2}</span>,
    },
    {
      key: 'col3',
      header: reportPayload.columns[2],
      align: 'right',
      render: (r) => <span className="tabular-nums">{r.col3}</span>,
    },
    {
      key: 'col4',
      header: reportPayload.columns[3],
      align: 'right',
      render: (r) => <span className="tabular-nums">{r.col4}</span>,
    },
    {
      key: 'col5',
      header: reportPayload.columns[4],
      align: 'right',
      render: (r) => <span className="font-mono text-xs font-semibold">{r.col5}</span>,
    },
  ];

  const handleExportCsv = () => {
    const csv = [
      reportPayload.columns,
      ...reportPayload.rows.map((r) => [
        `"${r.col1}"`,
        `"${r.col2}"`,
        `"${r.col3}"`,
        `"${r.col4}"`,
        `"${r.col5}"`,
      ]),
    ]
      .map((line) => line.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bis-${reportType}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Report exported',
      message: `${reportPayload.title} saved to CSV.`,
      tone: 'success',
    });
  };

  return (
    <div className="space-y-5">
      <div className="bis-no-print">
        <PageHeader
          eyebrow="System Management"
          title="Reports & Analytics Generator"
          subtitle="Generate live barangay summaries across population, clearances, blotter resolution, treasury, and sectoral registries."
          actions={
            <>
              <AppButton
                variant="outline"
                startIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Print Report
              </AppButton>
              <AppButton
                variant="primary"
                startIcon={<Download className="h-4 w-4" />}
                onClick={handleExportCsv}
              >
                Export CSV
              </AppButton>
            </>
          }
        />
      </div>

      {/* Report Configuration Controls */}
      <div className="bis-no-print rounded-[10px] border border-bis-border bg-bis-surface p-4 shadow-[var(--bis-shadow-sm)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bis-text">
            <FileSpreadsheet className="h-4 w-4 text-bis-accent dark:text-[#93B9E6]" />
            <span>Report Module:</span>
          </div>
          <FilterSelect
            label="Select Report Type"
            value={reportType}
            onChange={(val) => setReportType(val as ReportType)}
            options={[
              { value: 'population', label: 'Population & Purok Demographics' },
              { value: 'certificates', label: 'Certificates & Clearances Issuance' },
              { value: 'blotter', label: 'Blotter & Lupon Resolution' },
              { value: 'financial', label: 'Financial Summary & Treasury' },
              { value: 'sectoral', label: 'Sectoral Registry Summary' },
            ]}
          />
          <FilterSelect
            label="Filter by Purok"
            value={purokFilter}
            onChange={setPurokFilter}
            options={[
              { value: 'All', label: 'All Puroks (1–7)' },
              ...PUROK_LIST.map((p) => ({ value: p, label: p })),
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-bis-muted">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Date range start"
            className="rounded-lg border border-bis-border bg-bis-surface-subtle px-2.5 py-1 text-xs text-bis-text"
          />
          <span className="text-bis-muted">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Date range end"
            className="rounded-lg border border-bis-border bg-bis-surface-subtle px-2.5 py-1 text-xs text-bis-text"
          />
        </div>
      </div>

      {/* Derived Report KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {reportPayload.stats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Visualization + Summary Table */}
      <div className="bis-printable-sheet space-y-5">
        <div className="hidden print:block border-b-2 border-[#173B63] pb-3 text-center">
          <p className="text-xs uppercase text-slate-600">
            {db.settings.barangayName} • {db.settings.municipalityOrCity}
          </p>
          <h2 className="text-lg font-bold text-[#173B63]">
            {reportPayload.title}
          </h2>
          <p className="text-xs text-slate-600">
            Period: {dateFrom} to {dateTo} • Scope: {purokFilter}
          </p>
        </div>

        <SectionCard
          title={reportPayload.title}
          subtitle={reportPayload.subtitle}
          headerAction={
            <StatusBadge label={`${reportPayload.rows.length} groups`} tone="accent" dot={false} />
          }
        >
          <div className="h-[260px] w-full">
            {!mounted ? (
              <Skeleton variant="rounded" width="100%" height={260} />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
                initialDimension={{ width: 640, height: 260 }}
              >
                <BarChart
                  data={reportPayload.chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--bis-chart-grid)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                    width={52}
                  />
                  <Tooltip content={(props) => <ChartTooltip {...props} />} />
                  <Bar
                    dataKey="primary"
                    name={reportPayload.primaryName}
                    fill="var(--bis-chart-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="secondary"
                    name={reportPayload.secondaryName}
                    fill="var(--bis-chart-secondary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Generated Breakdown Table"
          subtitle="Derived directly from live BIS session records."
          noPadding
        >
          <DataTable
            columns={columns}
            rows={reportPayload.rows}
            getRowKey={(r) => r.id}
            emptyTitle="No data in selected date/purok filter"
            emptyDescription="Broaden the date range or select All Puroks."
          />
        </SectionCard>
      </div>
    </div>
  );
}
