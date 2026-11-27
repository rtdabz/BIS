'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { m } from 'motion/react';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import {
  AppButton,
  EmptyState,
  SearchInput,
  StatusBadge,
} from '@/components/ui';
import type { PortalEvent } from '@/types/portal';
import {
  BUTTON_HOVER_LIFT,
  BUTTON_TAP_PRESS,
  EDITORIAL_EASE,
  PortalReveal,
  PortalStaggerGrid,
  PortalStaggerItem,
} from './motion';
import { EventCard } from './EventCard';

export interface EventsSectionProps {
  events: PortalEvent[];
}

/**
 * "Upcoming Community Events" section featuring an editorial spotlight event,
 * upcoming schedule list, clear sample-content labeling, and calendar modal.
 */
export function EventsSection({ events }: EventsSectionProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<PortalEvent | null>(
    null
  );
  const [allEventsOpen, setAllEventsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const featuredEvent = events.find((item) => item.featured) ?? events[0];
  const upcomingEvents = events.filter((item) => item.id !== featuredEvent?.id);

  const filteredEvents = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (evt) =>
        evt.title.toLowerCase().includes(q) ||
        evt.category.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  return (
    <>
      <section
        id="events"
        aria-labelledby="events-heading"
        className="border-t border-bis-border bg-bis-surface py-14 sm:py-16"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <PortalReveal variant="fadeUp">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bis-border pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bis-accent dark:text-[#93B9E6]">
                    Community Calendar
                  </p>
                  <StatusBadge label="Sample Schedule" tone="neutral" dot={false} />
                </div>
                <h2
                  id="events-heading"
                  className="mt-1.5 text-2xl font-semibold tracking-tight text-bis-text sm:text-[1.75rem]"
                >
                  Upcoming Community Events
                </h2>
                <p className="mt-1 text-xs text-bis-muted sm:text-[13px]">
                  Community assemblies, clean-up drives, health outreaches, and youth activities.
                </p>
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
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/evt-all:translate-x-0.5" />
                  }
                  onClick={() => setAllEventsOpen(true)}
                  className="group/evt-all"
                >
                  View All Events
                </AppButton>
              </m.div>
            </div>
          </PortalReveal>

          {/* Featured Event (Style B Solid Deep Navy Feature Card) */}
          {featuredEvent && (
            <PortalReveal variant="fadeUp" delay={0.04} className="mt-7">
              <EventCard
                event={featuredEvent}
                variant="featured"
                surface="navy"
                onViewDetails={setSelectedEvent}
              />
            </PortalReveal>
          )}

          {/* Upcoming Events Grid (Style C Clean Information Cards) */}
          <PortalStaggerGrid
            stagger={0.06}
            delayChildren={0.05}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {upcomingEvents.slice(0, 3).map((event) => (
              <PortalStaggerItem key={event.id}>
                <EventCard
                  event={event}
                  variant="list"
                  surface="adaptive"
                  onViewDetails={setSelectedEvent}
                />
              </PortalStaggerItem>
            ))}
          </PortalStaggerGrid>
        </div>
      </section>

      {/* All Events Modal */}
      <Dialog
        open={allEventsOpen}
        onClose={() => setAllEventsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex flex-wrap items-center justify-between gap-3 text-base font-semibold text-bis-text">
          <span>Full Sample Events Calendar</span>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter events or venues..."
            aria-label="Filter community events"
            containerClassName="w-full sm:w-64"
          />
        </DialogTitle>
        <DialogContent dividers>
          {filteredEvents.length === 0 ? (
            <EmptyState
              compact
              title="No matching events"
              description={`No sample events matched "${searchQuery}".`}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredEvents.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  variant="list"
                  onViewDetails={(item) => {
                    setAllEventsOpen(false);
                    setSelectedEvent(item);
                  }}
                />
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-3">
          <AppButton variant="outline" onClick={() => setAllEventsOpen(false)}>
            Close
          </AppButton>
        </DialogActions>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle className="flex flex-wrap items-center justify-between gap-2 text-base font-semibold text-bis-text">
              <span>{selectedEvent.category}</span>
              <StatusBadge label="Sample Schedule" tone="accent" />
            </DialogTitle>
            <DialogContent dividers className="space-y-3">
              <h3 className="text-lg font-semibold text-bis-text">
                {selectedEvent.title}
              </h3>
              <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3 space-y-1.5 text-xs text-bis-muted">
                <p className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-bis-accent dark:text-[#93B9E6]" />
                  <span>{selectedEvent.dateLabel}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-bis-accent dark:text-[#93B9E6]" />
                  <span>{selectedEvent.time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-bis-accent dark:text-[#93B9E6]" />
                  <span>{selectedEvent.venue}</span>
                </p>
              </div>
              <p className="text-sm leading-relaxed text-bis-text">
                {selectedEvent.description}
              </p>
              <p className="text-sm leading-relaxed text-bis-muted">
                {selectedEvent.details}
              </p>
            </DialogContent>
            <DialogActions className="px-6 py-3">
              <AppButton variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </AppButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
