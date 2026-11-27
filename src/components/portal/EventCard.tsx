'use client';

import * as React from 'react';
import { m } from 'motion/react';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import type { PortalEvent } from '@/types/portal';
import {
  BUTTON_HOVER_LIFT,
  BUTTON_TAP_PRESS,
  CARD_HOVER_LIFT,
  CARD_HOVER_TRANSITION,
  EDITORIAL_EASE,
} from './motion';
import { PortalMedia } from './PortalMedia';

export interface EventCardProps {
  event: PortalEvent;
  variant?: 'featured' | 'list';
  surface?: 'navy' | 'adaptive';
  onViewDetails: (event: PortalEvent) => void;
}

/**
 * Community event card supporting:
 * - featured: Style A (photo + overlay when imageUrl set) or Style B (Solid Deep Navy Feature Card)
 * - list: Style C Clean Information Card with light/dark surface contrast
 */
export function EventCard({
  event,
  variant = 'list',
  surface = 'adaptive',
  onViewDetails,
}: EventCardProps) {
  const hasPhoto = Boolean(event.imageUrl);
  const isNavy = surface === 'navy';

  if (variant === 'featured') {
    return (
      <m.article
        whileHover={CARD_HOVER_LIFT}
        transition={CARD_HOVER_TRANSITION}
        className="group overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep text-white shadow-[var(--bis-shadow-md)] transition-[border-color] duration-200 hover:border-amber-400/50"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Calendar Date Monolith (or photo if configured in CMS) */}
          {hasPhoto ? (
            <div className="relative lg:col-span-5">
              <PortalMedia
                src={event.imageUrl}
                alt={event.imageAlt}
                placeholderLabel={event.category}
                aspectClass="aspect-[16/10] lg:h-full lg:aspect-auto"
                zoomOnHover
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="border-b lg:border-b-0 lg:border-r border-white/15"
              />
            </div>
          ) : (
            <div className="flex flex-col justify-between border-b border-white/15 bg-[#0A172B] p-6 sm:p-8 lg:col-span-4 lg:border-b-0 lg:border-r">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  Featured Event
                </span>

                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-5xl font-semibold leading-none tracking-tight tabular-nums text-white sm:text-6xl">
                    {event.dayNumber}
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                      {event.monthShort}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-200">
                      {event.dateLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-white/15 pt-4 text-xs text-slate-200">
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
                  <span>{event.time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
                  <span>{event.venue}</span>
                </p>
              </div>
            </div>
          )}

          {/* Right Event Narrative & Action */}
          <div
            className={`flex flex-col justify-between p-6 sm:p-8 ${
              hasPhoto ? 'lg:col-span-7' : 'lg:col-span-8'
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {event.category}
                </span>
                {hasPhoto && (
                  <span className="inline-flex items-center rounded-md border border-amber-400/40 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200 tabular-nums">
                    {event.monthShort} {event.dayNumber}
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                {event.title}
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
                {event.description}
              </p>

              <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-slate-300">
                {event.details}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
              <span className="text-xs text-slate-300">
                Sample schedule • Open to all residents
              </span>
              <m.button
                type="button"
                whileHover={BUTTON_HOVER_LIFT}
                whileTap={BUTTON_TAP_PRESS}
                transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
                onClick={() => onViewDetails(event)}
                className="group/evt-cta inline-flex items-center gap-2 rounded-lg bg-[#B45309] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#92400E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                <span>View Event Details</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/evt-cta:translate-x-0.5"
                  aria-hidden="true"
                />
              </m.button>
            </div>
          </div>
        </div>
      </m.article>
    );
  }

  /* Style C Clean Information Card (default & calendar modal) */
  return (
    <m.article
      whileHover={CARD_HOVER_LIFT}
      transition={CARD_HOVER_TRANSITION}
      className={`group flex h-full flex-col justify-between overflow-hidden rounded-xl border p-5 transition-[border-color,background-color,box-shadow] duration-200 ${
        isNavy
          ? 'border-[#28446E] bg-bis-navy-elevated text-white hover:border-amber-400/50'
          : 'border-bis-border bg-bis-surface-subtle/70 text-bis-text shadow-[var(--bis-shadow-sm)] hover:border-bis-border-strong hover:bg-bis-surface hover:shadow-[var(--bis-shadow-md)]'
      }`}
    >
      {hasPhoto && (
        <div className="-mx-5 -mt-5 mb-4 overflow-hidden border-b border-bis-border/30">
          <PortalMedia
            src={event.imageUrl}
            alt={event.imageAlt}
            placeholderLabel={event.category}
            aspectClass="aspect-[16/9]"
            zoomOnHover
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-2">
          {isNavy ? (
            <span className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white">
              {event.category}
            </span>
          ) : (
            <StatusBadge label={event.category} tone="neutral" dot={false} />
          )}
          <div
            className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular-nums transition-colors duration-200 ${
              isNavy
                ? 'border-amber-400/40 bg-amber-500/20 text-amber-200'
                : 'border-bis-border bg-bis-surface text-bis-accent dark:text-[#93B9E6]'
            }`}
          >
            <span>{event.monthShort}</span>
            <span>{event.dayNumber}</span>
          </div>
        </div>

        <h3
          className={`mt-3 text-[15px] font-semibold leading-snug ${
            isNavy ? 'text-white' : 'text-bis-text'
          }`}
        >
          {event.title}
        </h3>
        <p
          className={`mt-1.5 line-clamp-2 text-xs leading-relaxed ${
            isNavy ? 'text-slate-200' : 'text-bis-muted dark:text-slate-300'
          }`}
        >
          {event.description}
        </p>

        <div
          className={`mt-3.5 space-y-1 text-xs ${
            isNavy ? 'text-slate-200' : 'text-bis-muted dark:text-slate-300'
          }`}
        >
          <p className="flex items-center gap-1.5">
            <Clock
              className={`h-3.5 w-3.5 shrink-0 ${
                isNavy ? 'text-amber-300' : 'text-bis-accent dark:text-[#93B9E6]'
              }`}
              aria-hidden="true"
            />
            <span className="truncate">
              {event.dateLabel} • {event.time}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin
              className={`h-3.5 w-3.5 shrink-0 ${
                isNavy ? 'text-amber-300' : 'text-bis-accent dark:text-[#93B9E6]'
              }`}
              aria-hidden="true"
            />
            <span className="truncate">{event.venue}</span>
          </p>
        </div>
      </div>

      <div
        className={`mt-4 flex items-center justify-between border-t pt-3 ${
          isNavy ? 'border-white/15' : 'border-bis-border/80'
        }`}
      >
        <span
          className={`text-[11px] font-medium ${
            isNavy ? 'text-slate-300' : 'text-bis-muted'
          }`}
        >
          {event.dateLabel}
        </span>
        <button
          type="button"
          onClick={() => onViewDetails(event)}
          className={`group/evt-link inline-flex items-center gap-1 text-xs font-semibold hover:underline ${
            isNavy
              ? 'text-amber-300 hover:text-amber-200'
              : 'text-bis-accent dark:text-[#93B9E6]'
          }`}
        >
          <span>View Details</span>
          <ArrowRight
            className="h-3 w-3 transition-transform duration-200 motion-safe:group-hover/evt-link:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </m.article>
  );
}
