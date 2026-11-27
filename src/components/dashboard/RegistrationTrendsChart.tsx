'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Skeleton from '@mui/material/Skeleton';
import { SectionCard } from '@/components/ui';
import { useIsMounted } from '@/hooks/useIsMounted';
import { CSS_VAR_TOKENS } from '@/theme/tokens';
import type { DateRangePreset, RegistrationTrendPoint } from '@/types/dashboard';
import { ChartTooltip } from './ChartTooltip';

export interface RegistrationTrendsChartProps {
  data: RegistrationTrendPoint[];
  dateRange?: DateRangePreset;
  title?: string;
  subtitle?: string;
}

type RangeFilter = '6M' | '12M';

function mapPresetToRange(preset?: DateRangePreset): RangeFilter {
  return preset === '30d' || preset === '3m' || preset === '6m' ? '6M' : '12M';
}

/**
 * Monthly resident & household registration chart built with Recharts.
 */
export function RegistrationTrendsChart({
  data,
  dateRange,
  title = 'Population Trends',
  subtitle = 'Resident and household intake across all 7 puroks.',
}: RegistrationTrendsChartProps) {
  const [customRange, setCustomRange] = React.useState<{
    preset?: DateRangePreset;
    range: RangeFilter;
  } | null>(null);
  const mounted = useIsMounted();

  const localRange =
    customRange && customRange.preset === dateRange
      ? customRange.range
      : mapPresetToRange(dateRange);

  const visibleData = React.useMemo(() => {
    if (dateRange === '3m' && localRange === '6M') {
      return data.slice(-3);
    }
    return localRange === '6M' ? data.slice(-6) : data;
  }, [data, dateRange, localRange]);

  const totalResidentsAdded = visibleData.reduce(
    (sum, item) => sum + item.residents,
    0
  );
  const totalHouseholdsAdded = visibleData.reduce(
    (sum, item) => sum + item.households,
    0
  );

  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      headerAction={
        <div
          role="group"
          aria-label="Chart timeframe"
          className="inline-flex rounded-lg border border-bis-border bg-bis-surface-subtle p-0.5"
        >
          {(['6M', '12M'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setCustomRange({ preset: dateRange, range: option })
              }
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                localRange === option
                  ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                  : 'text-bis-muted hover:text-bis-text'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: CSS_VAR_TOKENS.chartPrimary }}
              aria-hidden="true"
            />
            <span className="text-bis-muted">Residents:</span>
            <span className="font-semibold tabular-nums text-bis-text">
              +{totalResidentsAdded.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: CSS_VAR_TOKENS.chartSecondary }}
              aria-hidden="true"
            />
            <span className="text-bis-muted">Households:</span>
            <span className="font-semibold tabular-nums text-bis-text">
              +{totalHouseholdsAdded.toLocaleString()}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-bis-muted">
          {visibleData.length} months shown
        </span>
      </div>

      <div className="h-[250px] w-full">
        {!mounted ? (
          <Skeleton variant="rounded" width="100%" height={250} />
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 520, height: 250 }}
          >
            <AreaChart
              data={visibleData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
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
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--bis-text-secondary)', fontSize: 11 }}
                width={42}
              />
              <Tooltip
                content={(props) => (
                  <ChartTooltip {...props} labelSuffix=" 2026" />
                )}
              />
              <Area
                type="monotone"
                dataKey="residents"
                name="New Residents"
                stroke="var(--bis-chart-primary)"
                strokeWidth={2.2}
                fill="var(--bis-chart-primary)"
                fillOpacity={0.12}
                activeDot={{
                  r: 4.5,
                  fill: 'var(--bis-chart-primary)',
                  stroke: 'var(--bis-surface)',
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="households"
                name="New Households"
                stroke="var(--bis-chart-secondary)"
                strokeWidth={2}
                fill="var(--bis-chart-secondary)"
                fillOpacity={0.08}
                activeDot={{
                  r: 4,
                  fill: 'var(--bis-chart-secondary)',
                  stroke: 'var(--bis-surface)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </SectionCard>
  );
}
