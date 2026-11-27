'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { m } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import {
  AppButton,
  EmptyState,
  SearchInput,
  StatusBadge,
} from '@/components/ui';
import type { PortalAnnouncement } from '@/types/portal';
import {
  BUTTON_HOVER_LIFT,
  BUTTON_TAP_PRESS,
  EDITORIAL_EASE,
  PortalReveal,
  PortalStaggerGrid,
  PortalStaggerItem,
} from './motion';
import { AnnouncementCard } from './AnnouncementCard';

export interface AnnouncementsSectionProps {
  announcements: PortalAnnouncement[];
  selectedAnnouncement: PortalAnnouncement | null;
  onSelectAnnouncement: (announcement: PortalAnnouncement | null) => void;
}

const CATEGORY_FILTERS: ('All' | PortalAnnouncement['category'])[] = [
  'All',
  'Public Advisory',
  'Community News',
  'Health Advisory',
  'Public Notice',
  'Emergency Updates',
  'General Announcement',
];

/**
 * "What's Happening in Our Barangay" editorial updates section with
 * featured lead story, category filters, and archive modal.
 */
export function AnnouncementsSection({
  announcements,
  selectedAnnouncement,
  onSelectAnnouncement,
}: AnnouncementsSectionProps) {
  const [categoryFilter, setCategoryFilter] = React.useState<
    'All' | PortalAnnouncement['category']
  >('All');
  const [hasFiltered, setHasFiltered] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [archiveQuery, setArchiveQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (categoryFilter === 'All') return announcements;
    return announcements.filter((item) => item.category === categoryFilter);
  }, [announcements, categoryFilter]);

  const featuredItem =
    filtered.find((item) => item.featured) ?? filtered[0] ?? null;
  const secondaryItems = filtered
    .filter((item) => item.id !== featuredItem?.id)
    .slice(0, 4);

  const archiveMatches = React.useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [announcements, archiveQuery]);

  return (
    <>
      <section
        id="announcements"
        aria-labelledby="announcements-heading"
        className="bg-bis-bg py-14 sm:py-16"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <PortalReveal variant="fadeUp">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bis-accent dark:text-[#93B9E6]">
                    Official Bulletins &amp; Community Updates
                  </p>
                  <StatusBadge label="Sample Bulletins" tone="neutral" dot={false} />
                </div>
                <h2
                  id="announcements-heading"
                  className="mt-1 text-2xl font-semibold tracking-tight text-bis-text sm:text-[1.75rem]"
                >
                  What&apos;s Happening in Our Barangay
                </h2>
              </div>

              <m.div
                whileHover={BUTTON_HOVER_LIFT}
                whileTap={BUTTON_TAP_PRESS}
                transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
              >
                <AppButton
                  variant="outline"
                  size="sm"
                  endIcon={
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/ann-all:translate-x-0.5" />
                  }
                  onClick={() => setArchiveOpen(true)}
                  className="group/ann-all"
                >
                  View All Announcements
                </AppButton>
              </m.div>
            </div>
          </PortalReveal>

          {/* Category Filter Strip */}
          <PortalReveal variant="fadeUp" delay={0.05}>
            <div
              role="group"
              aria-label="Filter announcements by category"
              className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1"
            >
              {CATEGORY_FILTERS.map((cat) => {
                const active = categoryFilter === cat;
                return (
                  <m.button
                    key={cat}
                    type="button"
                    whileTap={BUTTON_TAP_PRESS}
                    onClick={() => {
                      setHasFiltered(true);
                      setCategoryFilter(cat);
                    }}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'border-bis-accent bg-bis-accent text-bis-accent-contrast'
                        : 'border-bis-border bg-bis-surface-subtle text-bis-muted hover:text-bis-text'
                    }`}
                  >
                    {cat}
                  </m.button>
                );
              })}
            </div>
          </PortalReveal>

          {/* Editorial Asymmetric Layout */}
          <div className="mt-6">
            {!featuredItem ? (
              <EmptyState
                compact
                title="No announcements in this category"
                description="Select another category or open the full announcements archive."
                action={
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryFilter('All')}
                  >
                    Show All Updates
                  </AppButton>
                }
              />
            ) : (
              <div key={categoryFilter} className="space-y-6">
                <PortalReveal variant="fadeUp" immediate={hasFiltered}>
                  <AnnouncementCard
                    announcement={featuredItem}
                    variant="featured"
                    onReadMore={onSelectAnnouncement}
                  />
                </PortalReveal>

                {secondaryItems.length === 0 ? (
                  <EmptyState
                    compact
                    title="Single advisory in this filter"
                    description="Switch back to All to inspect all recent community announcements."
                  />
                ) : (
                  <PortalStaggerGrid
                    stagger={0.055}
                    delayChildren={0.05}
                    immediate={hasFiltered}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    {secondaryItems.map((item) => (
                      <PortalStaggerItem key={item.id}>
                        <AnnouncementCard
                          announcement={item}
                          variant="compact"
                          onReadMore={onSelectAnnouncement}
                        />
                      </PortalStaggerItem>
                    ))}
                  </PortalStaggerGrid>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full Archive Modal */}
      <Dialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex flex-wrap items-center justify-between gap-3 text-base font-semibold text-bis-text">
          <span>All Barangay Announcements &amp; News</span>
          <SearchInput
            value={archiveQuery}
            onChange={setArchiveQuery}
            placeholder="Search updates..."
            aria-label="Search announcements archive"
            containerClassName="w-full sm:w-64"
          />
        </DialogTitle>
        <DialogContent dividers>
          {archiveMatches.length === 0 ? (
            <EmptyState
              compact
              title="No matching announcements"
              description={`No updates match "${archiveQuery}".`}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {archiveMatches.map((item) => (
                <AnnouncementCard
                  key={item.id}
                  announcement={item}
                  variant="grid"
                  onReadMore={(ann) => {
                    setArchiveOpen(false);
                    onSelectAnnouncement(ann);
                  }}
                />
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-3">
          <AppButton variant="outline" onClick={() => setArchiveOpen(false)}>
            Close
          </AppButton>
        </DialogActions>
      </Dialog>

      {/* Reader Modal */}
      <Dialog
        open={Boolean(selectedAnnouncement)}
        onClose={() => onSelectAnnouncement(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle className="flex flex-wrap items-center justify-between gap-2 text-base font-semibold text-bis-text">
              <StatusBadge
                label={selectedAnnouncement.category}
                tone="accent"
                dot={false}
              />
              <span className="text-xs font-normal text-bis-muted">
                {selectedAnnouncement.publishedDate}
              </span>
            </DialogTitle>
            <DialogContent dividers className="space-y-3">
              <h3 className="text-lg font-semibold leading-snug text-bis-text">
                {selectedAnnouncement.title}
              </h3>
              <p className="text-xs font-medium text-bis-muted">
                Issued by: {selectedAnnouncement.authorOffice}
              </p>
              <p className="text-sm leading-relaxed text-bis-text">
                {selectedAnnouncement.summary}
              </p>
              <p className="text-sm leading-relaxed text-bis-muted">
                {selectedAnnouncement.fullContent}
              </p>
            </DialogContent>
            <DialogActions className="px-6 py-3">
              <AppButton
                variant="outline"
                onClick={() => onSelectAnnouncement(null)}
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
