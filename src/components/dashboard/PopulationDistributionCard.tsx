'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Skeleton from '@mui/material/Skeleton';
import { SectionCard } from '@/components/ui';
import { useIsMounted } from '@/hooks/useIsMounted';
import type { DemographicSlice } from '@/types/dashboard';
import { ChartTooltip } from './ChartTooltip';

export interface PopulationDistributionCardProps {
  byAge: DemographicSlice[];
  bySector: DemographicSlice[];
  byGender?: DemographicSlice[];
  totalResidents: number;
}

type DistributionTab = 'age' | 'gender' | 'sector';

/**
 * Demographic distribution card pairing a Recharts donut visualization with
 * structured progress bars strictly in Navy Blue & Slate tones.
 */
export function PopulationDistributionCard({
  byAge,
  bySector,
  byGender,
  totalResidents,
}: PopulationDistributionCardProps) {
  const [tab, setTab] = React.useState<DistributionTab>('age');
  const mounted = useIsMounted();

  const activeSlices =
    tab === 'age'
      ? byAge
      : tab === 'gender' && byGender
        ? byGender
        : bySector;

  const chartData = React.useMemo(
    () =>
      activeSlices.map((slice) => ({
        ...slice,
        name: slice.label,
        value: slice.count,
        fill: slice.colorToken,
      })),
    [activeSlices]
  );

  const tabOptions: { id: DistributionTab; label: string }[] = React.useMemo(() => {
    const opts: { id: DistributionTab; label: string }[] = [
      { id: 'age', label: 'Age' },
    ];
    if (byGender && byGender.length > 0) {
      opts.push({ id: 'gender', label: 'Gender' });
    }
    opts.push({ id: 'sector', label: 'Sector' });
    return opts;
  }, [byGender]);

  return (
    <SectionCard
      title="Population Distribution"
      subtitle="Registered residents grouped by age bracket, gender, or sector."
      className="h-full"
      headerAction={
        <div
          role="group"
          aria-label="Demographic grouping"
          className="inline-flex rounded-lg border border-bis-border bg-bis-surface-subtle p-0.5"
        >
          {tabOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTab(option.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tab === option.id
                  ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                  : 'text-bis-muted hover:text-bis-text'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-[178px] w-[178px] shrink-0">
          {!mounted ? (
            <Skeleton variant="circular" width={178} height={178} />
          ) : (
            <>
              <ResponsiveContainer
                width="100%"
                height="100%"
                initialDimension={{ width: 178, height: 178 }}
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="var(--bis-surface)"
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={(props) => (
                      <ChartTooltip {...props} valueSuffix=" residents" />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-semibold tabular-nums tracking-tight text-bis-text">
                  {totalResidents.toLocaleString()}
                </span>
                <span className="text-[10.5px] font-medium text-bis-muted">
                  Total Residents
                </span>
              </div>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {activeSlices.map((slice) => (
            <div key={slice.id}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: slice.colorToken }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-medium text-bis-text">
                    {slice.label}
                  </span>
                </div>
                <span className="shrink-0 font-semibold tabular-nums text-bis-text">
                  {slice.count.toLocaleString()}{' '}
                  <span className="font-normal text-bis-muted">
                    ({slice.percentage}%)
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full border border-bis-border/50 bg-bis-surface-subtle">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(4, slice.percentage))}%`,
                    backgroundColor: slice.colorToken,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
