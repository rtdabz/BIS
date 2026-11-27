'use client';

import * as React from 'react';
import { domAnimation, LazyMotion, m, MotionConfig } from 'motion/react';
import { FilePlus2, RefreshCw } from 'lucide-react';
import { AppButton, PageHeader, StatusBadge, useToast } from '@/components/ui';
import { useBisStore } from '@/lib/store/BisStoreContext';
import {
  deriveBarangayProfile,
  deriveDashboardOverview,
} from '@/lib/store/bisSelectors';
import type {
  DashboardTabId,
  DateRangePreset,
} from '@/types/dashboard';
import { DashboardTabs } from './DashboardTabs';
import { OverviewTab } from './OverviewTab';
import { ReportsAnalyticsTab } from './ReportsAnalyticsTab';
import { ResidentsTab } from './ResidentsTab';
import { TransactionsTab } from './TransactionsTab';

/**
 * Primary administrative dashboard derived live from the centralized BisStore.
 */
export function DashboardOverview() {
  const { db } = useBisStore();
  const { showToast } = useToast();

  const profile = React.useMemo(() => deriveBarangayProfile(db), [db]);
  const data = React.useMemo(() => deriveDashboardOverview(db), [db]);

  const [activeTab, setActiveTab] = React.useState<DashboardTabId>('overview');
  const [dateRange, setDateRange] = React.useState<DateRangePreset>('6m');
  const [customSyncLabel, setCustomSyncLabel] = React.useState<string | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const pendingDocsCount =
    data.stats.find((item) => item.id === 'stat-pending-docs')?.value ?? 0;

  const handleRefreshPreview = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCustomSyncLabel(`Refreshed live totals • ${timeStr}`);
      setIsRefreshing(false);
      showToast({
        title: 'Dashboard totals synchronized',
        message: 'KPIs and charts updated from active session records.',
        tone: 'accent',
      });
    }, 280);
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="space-y-5">
          <PageHeader
            eyebrow={`${profile.barangayName} • ${profile.municipalityOrCity}`}
            title="Administrative Dashboard"
            subtitle="Live summary of resident records, clearances, Lupon cases, and community operations."
            metadata={
              <StatusBadge
                label={customSyncLabel ?? data.lastSyncedLabel}
                tone="neutral"
              />
            }
            actions={
              <>
                <AppButton
                  variant="outline"
                  size="md"
                  loading={isRefreshing}
                  startIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={handleRefreshPreview}
                >
                  Sync Data
                </AppButton>
                <AppButton
                  variant="primary"
                  size="md"
                  href="/certificates?action=new"
                  startIcon={<FilePlus2 className="h-4 w-4" />}
                >
                  Issue Certificate
                </AppButton>
              </>
            }
          />

          <DashboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            pendingTransactionsCount={pendingDocsCount}
          />

          <m.div
            key={activeTab}
            initial={{ opacity: 0.01, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            role="tabpanel"
            id={`dashboard-panel-${activeTab}`}
            aria-labelledby={`dashboard-tab-${activeTab}`}
          >
            {activeTab === 'overview' && (
              <OverviewTab data={data} dateRange={dateRange} />
            )}
            {activeTab === 'residents' && (
              <ResidentsTab
                residentsData={data.residentsTab}
                populationByAge={data.populationByAge}
                populationBySector={data.populationBySector}
              />
            )}
            {activeTab === 'transactions' && (
              <TransactionsTab transactionsData={data.transactionsTab} />
            )}
            {activeTab === 'reports' && (
              <ReportsAnalyticsTab
                reportsData={data.reportsTab}
                registrationTrends={data.registrationTrends}
                incidentTrends={data.transactionsTab.trends}
                dateRange={dateRange}
              />
            )}
          </m.div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
