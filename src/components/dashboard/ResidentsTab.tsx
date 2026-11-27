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
  AppButton,
  DataTable,
  SearchInput,
  SectionCard,
  StatCard,
  StatusBadge,
  type DataTableColumn,
} from '@/components/ui';
import { useIsMounted } from '@/hooks/useIsMounted';
import type {
  DemographicSlice,
  RegisteredResidentRecord,
  ResidentsTabData,
  StatusTone,
} from '@/types/dashboard';
import { ChartTooltip } from './ChartTooltip';
import { PopulationDistributionCard } from './PopulationDistributionCard';

export interface ResidentsTabProps {
  residentsData: ResidentsTabData;
  populationByAge: DemographicSlice[];
  populationBySector: DemographicSlice[];
}

const VERIFICATION_TONE: Record<
  RegisteredResidentRecord['verificationStatus'],
  StatusTone
> = {
  Verified: 'accent',
  'Pending ID': 'warning',
  'For Renewal': 'neutral',
};

/**
 * Residents tab displaying core population KPIs, interactive demographic & age-group
 * charts, and a concise summary of recent civil registrations.
 */
export function ResidentsTab({
  residentsData,
  populationByAge,
  populationBySector,
}: ResidentsTabProps) {
  const mounted = useIsMounted();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredResidents = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return residentsData.recentResidents.filter((resident) => {
      if (!q) return true;
      return (
        resident.fullName.toLowerCase().includes(q) ||
        resident.residentCode.toLowerCase().includes(q) ||
        resident.purok.toLowerCase().includes(q) ||
        resident.sectorTag.toLowerCase().includes(q)
      );
    });
  }, [residentsData.recentResidents, searchQuery]);

  const totalResidentsCount =
    residentsData.stats.find((item) => item.id === 'res-total-pop')?.value ??
    14892;

  const columns: DataTableColumn<RegisteredResidentRecord>[] = [
    {
      key: 'residentCode',
      header: 'Resident ID',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.residentCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Resident Name',
      render: (row) => (
        <div>
          <p className="font-medium text-bis-text">{row.fullName}</p>
          <p className="text-[11px] text-bis-muted">
            {row.age} yrs • {row.sex}
          </p>
        </div>
      ),
    },
    {
      key: 'purok',
      header: 'Purok',
      className: 'whitespace-nowrap',
      render: (row) => <span className="text-bis-text">{row.purok}</span>,
    },
    {
      key: 'sectorTag',
      header: 'Classification',
      render: (row) => (
        <StatusBadge label={row.sectorTag} tone="neutral" dot={false} />
      ),
    },
    {
      key: 'registeredAt',
      header: 'Registered',
      className: 'whitespace-nowrap text-xs text-bis-muted',
      render: (row) => row.registeredAt,
    },
    {
      key: 'verificationStatus',
      header: 'Status',
      align: 'right',
      render: (row) => (
        <StatusBadge
          label={row.verificationStatus}
          tone={VERIFICATION_TONE[row.verificationStatus]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* 4 Core Population & Household KPIs */}
      <section aria-label="Resident demographic statistics">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {residentsData.stats.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* 2 Complementary Visualizations: Population Distribution & Age Group Distribution */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <PopulationDistributionCard
            byAge={populationByAge}
            byGender={residentsData.genderSplit}
            bySector={populationBySector}
            totalResidents={totalResidentsCount}
          />
        </div>

        <div className="xl:col-span-7">
          <SectionCard
            title="Age Group Distribution"
            subtitle="Female and male population totals across demographic brackets."
            className="h-full"
            headerAction={
              <div className="flex items-center gap-3 text-xs">
                {residentsData.genderSplit.map((item) => (
                  <span key={item.id} className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: item.colorToken }}
                      aria-hidden="true"
                    />
                    <span className="text-bis-muted">
                      {item.label.split(' ')[0]}
                    </span>
                  </span>
                ))}
              </div>
            }
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
                    data={residentsData.ageByGender}
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--bis-chart-grid)"
                    />
                    <XAxis
                      dataKey="ageGroup"
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
                    <Tooltip
                      content={(props) => (
                        <ChartTooltip {...props} valueSuffix=" residents" />
                      )}
                    />
                    <Bar
                      dataKey="female"
                      name="Female"
                      fill="var(--bis-chart-primary)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="male"
                      name="Male"
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

      {/* Recent Registrations Summary Table */}
      <SectionCard
        title="Recent Registrations"
        subtitle="Latest inhabitants enrolled in the resident registry."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter name, ID, purok..."
              aria-label="Filter recent registrations"
              containerClassName="w-48 sm:w-56"
            />
            <AppButton variant="outline" size="sm" href="/residents">
              Manage Residents
            </AppButton>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={filteredResidents.slice(0, 5)}
          getRowKey={(row) => row.id}
          emptyTitle="No matching registrations"
          emptyDescription="Adjust the search query or open the full Residents module."
        />
      </SectionCard>
    </div>
  );
}
