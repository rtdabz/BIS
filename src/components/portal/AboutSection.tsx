'use client';

import * as React from 'react';
import { Clock, MapPin, Shield, Target } from 'lucide-react';
import { BarangaySealLogo } from '@/components/layout/BarangaySealLogo';
import { StatusBadge } from '@/components/ui';
import type { PortalOverviewData } from '@/types/portal';
import { PortalMedia } from './PortalMedia';
import { PortalReveal } from './motion';

export interface AboutSectionProps {
  barangayName: string;
  about: PortalOverviewData['about'];
}

/**
 * Institutional visual storytelling section combining a civic emblem profile,
 * ruled mission & vision manifesto, and the Sangguniang Barangay council directory.
 */
export function AboutSection({ barangayName, about }: AboutSectionProps) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-bis-border bg-bis-bg py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <PortalReveal variant="fadeUp">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bis-border pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bis-accent dark:text-[#93B9E6]">
                Governance &amp; Institutional Profile
              </p>
              <h2
                id="about-heading"
                className="mt-1 text-2xl font-semibold tracking-tight text-bis-text sm:text-[1.75rem]"
              >
                About {barangayName}
              </h2>
            </div>
            <StatusBadge label="Placeholder Profile" tone="neutral" dot={false} />
          </div>
        </PortalReveal>

        {/* Top Visual Identity & Editorial Narrative Split */}
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Style B: Deep Navy Civic Emblem & Operations Card */}
          <PortalReveal variant="fadeUp" delay={0.04} className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep text-white shadow-[var(--bis-shadow-md)]">
              {about.storyImageUrl ? (
                <div className="relative">
                  <PortalMedia
                    src={about.storyImageUrl}
                    alt={about.storyImageAlt ?? `${barangayName} community overview`}
                    aspectClass="aspect-[16/10]"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bis-navy-deep via-transparent to-transparent"
                  />
                </div>
              ) : (
                <div className="relative border-b border-white/15 bg-gradient-to-br from-[#142B4B] to-[#0A172B] px-6 py-7 sm:px-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-white/10 p-2 backdrop-blur-sm">
                      <BarangaySealLogo className="h-12 w-12" />
                    </div>
                    <div>
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                        Local Governance Identity
                      </span>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {barangayName}
                      </p>
                      <p className="text-xs text-slate-200">
                        Sangguniang Barangay &amp; Secretariat
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7 space-y-5">
                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-slate-200">
                        Office Location
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-white">
                        {about.officeLocationPlaceholder}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-t border-white/15 pt-4">
                    <Clock
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-slate-200">
                        Operating Schedule
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-200">
                        {about.officeHoursPlaceholder}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-[11px] leading-relaxed text-slate-200">
                  Official barangay charter history and verified council roster update automatically when connected to the database.
                </div>
              </div>
            </div>
          </PortalReveal>

          {/* Right Style C Clean Narrative + Ruled Mission & Vision */}
          <PortalReveal variant="fadeUp" delay={0.08} className="lg:col-span-7">
            <div className="flex h-full flex-col justify-between rounded-xl border border-bis-border bg-bis-surface p-6 shadow-[var(--bis-shadow-sm)] sm:p-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
                  Community Charter
                </p>
                <h3 className="mt-1.5 text-lg font-semibold text-bis-text sm:text-xl">
                  Barangay Background &amp; Service Mandate
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-bis-muted dark:text-slate-300 sm:text-[15px]">
                  {about.backgroundPlaceholder}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 border-t border-bis-border pt-6 sm:grid-cols-2">
                <div className="border-l-2 border-bis-amber pl-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bis-amber">
                    <Target className="h-4 w-4" aria-hidden="true" />
                    <span>Mission</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-bis-muted dark:text-slate-300 sm:text-[13px]">
                    {about.missionPlaceholder}
                  </p>
                </div>

                <div className="border-l-2 border-bis-accent pl-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bis-accent dark:text-[#93B9E6]">
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    <span>Vision</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-bis-muted dark:text-slate-300 sm:text-[13px]">
                    {about.visionPlaceholder}
                  </p>
                </div>
              </div>
            </div>
          </PortalReveal>
        </div>

        {/* Bottom Architectural Sangguniang Barangay Council Roster */}
        <PortalReveal variant="fadeUp" delay={0.08} className="mt-6">
          <div className="overflow-hidden rounded-xl border border-bis-border bg-bis-surface shadow-[var(--bis-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bis-border bg-bis-surface-subtle px-6 py-3.5">
              <div>
                <h3 className="text-sm font-semibold text-bis-text">
                  Sangguniang Barangay Directory
                </h3>
                <p className="text-xs text-bis-muted">
                  Council seats &amp; committee assignments (placeholder names)
                </p>
              </div>
              <span className="font-mono text-[11px] font-medium text-bis-muted">
                {about.officials.length} council seats
              </span>
            </div>

            <ul className="grid grid-cols-1 divide-y divide-bis-border md:grid-cols-2 md:divide-y-0">
              {about.officials.map((official, index) => (
                <li
                  key={official.id}
                  className={`flex flex-wrap items-center justify-between gap-3 border-bis-border px-6 py-3.5 text-sm transition-colors duration-150 hover:bg-bis-surface-subtle/70 ${
                    index < about.officials.length - 1 ? 'border-b' : ''
                  } ${
                    index >= about.officials.length - 2
                      ? 'md:border-b-0'
                      : 'md:border-b'
                  } ${index % 2 === 0 ? 'md:border-r' : ''}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-bis-text">
                      {official.namePlaceholder}
                    </p>
                    <p className="text-xs text-bis-muted dark:text-slate-300">
                      {official.committee}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                      official.position === 'Punong Barangay' ||
                      official.position === 'SK Chairperson'
                        ? 'border-bis-warning/35 bg-bis-amber-soft text-[#92400E] dark:text-[#FBBF24]'
                        : 'border-bis-border bg-bis-surface-subtle text-bis-accent dark:text-[#93B9E6]'
                    }`}
                  >
                    {official.position}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </PortalReveal>
      </div>
    </section>
  );
}
