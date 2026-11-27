'use client';

import * as React from 'react';
import { StatCard } from '@/components/ui';
import type { DashboardOverviewData, DateRangePreset } from '@/types/dashboard';
import { PendingTransactionsCard } from './PendingTransactionsCard';
import { PopulationDistributionCard } from './PopulationDistributionCard';
import { QuickActionsCard } from './QuickActionsCard';
import { RecentActivitiesCard } from './RecentActivitiesCard';
import { RegistrationTrendsChart } from './RegistrationTrendsChart';

export interface OverviewTabProps {
  data: DashboardOverviewData;
  dateRange: DateRangePreset;
}

const OVERVIEW_PRIMARY_IDS = new Set([
  'stat-residents',
  'stat-households',
  'stat-pending-docs',
  'stat-blotter',
]);

/**
 * Executive overview combining key KPIs, front-desk quick actions,
 * registration & demographic charts, recent activities, and pending queues.
 */
export function OverviewTab({ data, dateRange }: OverviewTabProps) {
  const primaryStats = React.useMemo(
    () => data.stats.filter((item) => OVERVIEW_PRIMARY_IDS.has(item.id)),
    [data.stats]
  );

  const totalResidents =
    data.stats.find((s) => s.id === 'stat-residents')?.value ?? 0;

  return (
    <div className="space-y-5">
      {/* 4 Core Executive Statistics */}
      <section aria-label="Overview key statistics">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {primaryStats.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Direct Front-Desk Quick Actions */}
      <QuickActionsCard actions={data.quickActions} layout="horizontal" />

      {/* Trends & Demographic Snapshot */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <RegistrationTrendsChart
            data={data.registrationTrends}
            dateRange={dateRange}
          />
        </div>
        <div className="xl:col-span-5">
          <PopulationDistributionCard
            byAge={data.populationByAge}
            byGender={data.residentsTab.genderSplit}
            bySector={data.populationBySector}
            totalResidents={totalResidents}
          />
        </div>
      </div>

      {/* Activity Timeline & Pending Action Queue */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentActivitiesCard activities={data.recentActivities} />
        </div>
        <div className="lg:col-span-5">
          <PendingTransactionsCard transactions={data.pendingTransactions} />
        </div>
      </div>
    </div>
  );
}
