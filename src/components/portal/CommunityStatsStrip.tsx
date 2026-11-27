'use client';

import * as React from 'react';
import type { CommunityStatItem } from '@/types/portal';
import {
  AnimatedStatNumber,
  PortalReveal,
} from './motion';

export interface CommunityStatsStripProps {
  stats: CommunityStatItem[];
  disclaimer: string;
}

/**
 * Overlapping institutional metrics ribbon anchored across the Hero boundary,
 * featuring scroll-triggered animated numerals and restrained warm amber markers.
 */
export function CommunityStatsStrip({
  stats,
  disclaimer,
}: CommunityStatsStripProps) {
  return (
    <section
      aria-label="Community portal overview metrics"
      className="relative z-20 border-b border-bis-border bg-bis-bg pb-6"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <PortalReveal variant="fadeUp" delay={0.05} className="-mt-10 sm:-mt-12">
          <div className="grid grid-cols-2 divide-y divide-bis-border overflow-hidden rounded-xl border border-bis-border bg-bis-surface shadow-[var(--bis-shadow-md)] lg:grid-cols-4 lg:divide-y-0 lg:divide-x">
            {stats.map((stat, idx) => (
              <div
                key={stat.id}
                className={`group relative px-4 py-4 transition-colors duration-200 hover:bg-bis-surface-subtle/80 sm:px-6 sm:py-5 ${
                  idx % 2 === 1 ? 'border-l border-bis-border lg:border-l-0' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-bis-accent transition-transform duration-300 ease-out motion-safe:group-hover:scale-x-100 motion-reduce:transition-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-bis-muted">{stat.label}</p>
                  <span className="font-mono text-[10px] font-semibold text-bis-accent dark:text-[#93B9E6]">
                    0{idx + 1}
                  </span>
                </div>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-bis-text transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 sm:text-[1.75rem]">
                  <AnimatedStatNumber value={stat.value} />
                </p>
                <p className="mt-1 text-[11px] text-bis-muted">{stat.context}</p>
              </div>
            ))}
          </div>
        </PortalReveal>

        <PortalReveal variant="fadeIn" delay={0.14}>
          <p className="mt-2.5 text-right text-[11px] text-bis-muted">
            {disclaimer}
          </p>
        </PortalReveal>
      </div>
    </section>
  );
}
