'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { m } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Droplets,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { AppButton, StatusBadge } from '@/components/ui';
import type { PublicNotice } from '@/types/portal';
import {
  BUTTON_TAP_PRESS,
  EDITORIAL_EASE,
  PortalReveal,
  PortalStaggerGrid,
  staggerItemVariants,
} from './motion';

export interface PublicNoticesSectionProps {
  notices: PublicNotice[];
}

const NOTICE_ICON_MAP: Record<PublicNotice['category'], typeof AlertTriangle> = {
  'Emergency Advisory': AlertTriangle,
  'Water Interruption': Droplets,
  'Power Interruption': Zap,
  'Garbage Collection': Trash2,
  'Office Schedule': CalendarClock,
  'Public Safety': ShieldCheck,
};

/**
 * High-visibility asymmetric public notices dispatch:
 * Left deep-navy urgent spotlight paired with a scannable operational ledger.
 */
export function PublicNoticesSection({ notices }: PublicNoticesSectionProps) {
  const [selectedNotice, setSelectedNotice] =
    React.useState<PublicNotice | null>(null);

  const urgentSpotlight =
    notices.find((n) => n.status === 'Urgent') ?? notices[0];
  const ledgerNotices = notices.filter((n) => n.id !== urgentSpotlight?.id);

  return (
    <>
      <section
        aria-labelledby="public-notices-heading"
        className="border-b border-bis-border bg-bis-surface py-14 sm:py-16"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <PortalReveal variant="fadeUp">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-bis-border pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bis-accent dark:text-[#93B9E6]">
                  Public Advisories &amp; Civic Schedules
                </p>
                <h2
                  id="public-notices-heading"
                  className="mt-1 text-2xl font-semibold tracking-tight text-bis-text sm:text-[1.75rem]"
                >
                  Important Notices and Public Advisories
                </h2>
              </div>
              <StatusBadge label="Sample Advisories" tone="neutral" />
            </div>
          </PortalReveal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Style B: Solid Deep Navy Urgent Dispatch Feature Card */}
            {urgentSpotlight && (
              <PortalReveal variant="fadeUp" delay={0.04} className="lg:col-span-5">
                <m.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={BUTTON_TAP_PRESS}
                  transition={{ duration: 0.2, ease: EDITORIAL_EASE }}
                  onClick={() => setSelectedNotice(urgentSpotlight)}
                  className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep p-6 text-left text-white shadow-[var(--bis-shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-amber-500"
                  />

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-red-200">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        <span>{urgentSpotlight.status} Advisory</span>
                      </span>
                      <span className="text-xs font-medium text-slate-200">
                        {urgentSpotlight.publishedDate}
                      </span>
                    </div>

                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                      {urgentSpotlight.category}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold leading-snug text-white sm:text-xl">
                      {urgentSpotlight.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-200">
                      {urgentSpotlight.summary}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-white/15 pt-4">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-200">
                      <span className="text-slate-300">Affected Area:</span>
                      <span className="font-medium text-white">
                        {urgentSpotlight.affectedAreas}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                      <span>Read Full Advisory</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </m.button>
              </PortalReveal>
            )}

            {/* Right Style C: Clean Information Operational Ledger */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-xl border border-bis-border bg-bis-surface-subtle/60 shadow-[var(--bis-shadow-sm)]">
                <div className="flex items-center justify-between border-b border-bis-border bg-bis-surface-subtle px-5 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                    Scheduled Utility, Sanitation &amp; Safety Advisories
                  </span>
                  <span className="font-mono text-[11px] font-medium text-bis-muted">
                    {ledgerNotices.length} active entries
                  </span>
                </div>

                <PortalStaggerGrid
                  stagger={0.045}
                  className="divide-y divide-bis-border bg-bis-surface"
                >
                  {ledgerNotices.map((notice) => {
                    const Icon = NOTICE_ICON_MAP[notice.category];
                    return (
                      <m.button
                        key={notice.id}
                        type="button"
                        variants={staggerItemVariants}
                        whileTap={BUTTON_TAP_PRESS}
                        onClick={() => setSelectedNotice(notice)}
                        className="group flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-bis-surface-subtle focus-visible:bg-bis-surface-subtle focus-visible:outline-2 focus-visible:outline-bis-accent"
                      >
                        <div className="flex min-w-0 items-start gap-3.5">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle text-bis-accent transition-colors duration-150 group-hover:border-bis-accent/40 group-hover:bg-bis-accent-soft dark:text-[#93B9E6]">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-bis-muted">
                                {notice.category}
                              </span>
                              <StatusBadge label={notice.status} tone={notice.tone} />
                            </div>
                            <h3 className="mt-1 text-sm font-semibold leading-snug text-bis-text group-hover:text-bis-accent dark:group-hover:text-[#93B9E6]">
                              {notice.title}
                            </h3>
                            <p className="mt-1 line-clamp-1 text-xs text-bis-muted dark:text-slate-300">
                              {notice.summary}
                            </p>
                            <p className="mt-1.5 text-[11px] text-bis-muted">
                              <span>{notice.affectedAreas}</span>
                              <span className="mx-1.5">•</span>
                              <span>{notice.publishedDate}</span>
                            </p>
                          </div>
                        </div>

                        <ArrowRight
                          className="mt-2 h-4 w-4 shrink-0 text-bis-muted transition-all duration-200 group-hover:text-bis-accent motion-safe:group-hover:translate-x-1 dark:group-hover:text-[#93B9E6]"
                          aria-hidden="true"
                        />
                      </m.button>
                    );
                  })}
                </PortalStaggerGrid>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog
        open={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotice && (
          <>
            <DialogTitle className="flex items-center justify-between gap-3 text-base font-semibold text-bis-text">
              <span>{selectedNotice.category}</span>
              <StatusBadge
                label={selectedNotice.status}
                tone={selectedNotice.tone}
              />
            </DialogTitle>
            <DialogContent dividers className="space-y-3">
              <h3 className="text-base font-semibold text-bis-text">
                {selectedNotice.title}
              </h3>
              <p className="text-sm leading-relaxed text-bis-muted">
                {selectedNotice.summary}
              </p>
              <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3 text-xs space-y-1">
                <p>
                  <span className="font-semibold text-bis-text">Coverage: </span>
                  <span className="text-bis-muted">
                    {selectedNotice.affectedAreas}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-bis-text">Published: </span>
                  <span className="text-bis-muted">
                    {selectedNotice.publishedDate}
                  </span>
                </p>
              </div>
            </DialogContent>
            <DialogActions className="px-6 py-3">
              <AppButton
                variant="outline"
                onClick={() => setSelectedNotice(null)}
              >
                Close
              </AppButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
