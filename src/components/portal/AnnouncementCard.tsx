'use client';

import * as React from 'react';
import { m } from 'motion/react';
import { ArrowRight, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import type { StatusTone } from '@/types/dashboard';
import type { PortalAnnouncement } from '@/types/portal';
import { CARD_HOVER_LIFT, CARD_HOVER_TRANSITION } from './motion';
import { PortalMedia } from './PortalMedia';

export interface AnnouncementCardProps {
  announcement: PortalAnnouncement;
  variant?: 'featured' | 'compact' | 'grid';
  onReadMore: (announcement: PortalAnnouncement) => void;
}

const PRIORITY_TONE: Record<
  NonNullable<PortalAnnouncement['priority']>,
  StatusTone
> = {
  Featured: 'accent',
  Priority: 'warning',
  Urgent: 'danger',
};

/**
 * Editorial announcement card implementing the three distinct portal card styles:
 * - featured (with photo): Style A Image Background Card with dark navy gradient overlay
 * - featured (text fallback): Style B Solid Deep Navy Feature Card
 * - compact / grid: Style C Clean Information Card with light/dark surface contrast
 */
export function AnnouncementCard({
  announcement,
  variant = 'compact',
  onReadMore,
}: AnnouncementCardProps) {
  const hasPhoto = Boolean(announcement.imageUrl);

  if (variant === 'featured') {
    if (hasPhoto) {
      return (
        <m.article
          whileHover={CARD_HOVER_LIFT}
          transition={CARD_HOVER_TRANSITION}
          className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep text-white shadow-[var(--bis-shadow-md)] sm:min-h-[430px]"
        >
          <div className="absolute inset-0">
            <PortalMedia
              src={announcement.imageUrl}
              alt={announcement.imageAlt}
              placeholderLabel={announcement.category}
              aspectClass="h-full w-full"
              zoomOnHover
              sizes="(max-width: 1024px) 100vw, 90vw"
              className="border-b-0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081325]/96 via-[#0C1D36]/80 to-[#0C1D36]/20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#081325]/85 via-[#0C1D36]/45 to-transparent"
            />
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-200 backdrop-blur-sm">
                Featured Story
              </span>
              <span className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                {announcement.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 sm:ml-auto">
                <Calendar className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                <span>{announcement.publishedDate}</span>
              </span>
            </div>

            <h3 className="mt-4 max-w-3xl text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
              {announcement.title}
            </h3>

            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-[15px]">
              {announcement.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
              <span className="text-xs font-medium text-slate-200">
                {announcement.authorOffice}
              </span>
              <button
                type="button"
                onClick={() => onReadMore(announcement)}
                className="group/readmore inline-flex items-center gap-1.5 rounded-lg bg-[#B45309] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#92400E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                <span>Read Full Bulletin</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/readmore:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </m.article>
      );
    }

    /* Style B Solid Deep Navy Feature Card fallback for non-photo category filters */
    return (
      <m.article
        whileHover={CARD_HOVER_LIFT}
        transition={CARD_HOVER_TRANSITION}
        className="group relative overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep p-6 text-white shadow-[var(--bis-shadow-md)] sm:p-8"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-amber-500"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center rounded-md border border-amber-400/40 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
            {announcement.category}
          </span>
          {announcement.priority && (
            <span className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white">
              {announcement.priority}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-200">
            <Calendar className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            <span>{announcement.publishedDate}</span>
          </span>
        </div>

        <h3 className="mt-4 max-w-3xl text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
          {announcement.title}
        </h3>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-200">
          {announcement.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
          <span className="text-xs font-medium text-slate-300">
            {announcement.authorOffice}
          </span>
          <button
            type="button"
            onClick={() => onReadMore(announcement)}
            className="group/readmore inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            <span>Read Full Bulletin</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/readmore:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>
      </m.article>
    );
  }

  if (variant === 'grid') {
    return (
      <m.article
        whileHover={CARD_HOVER_LIFT}
        transition={CARD_HOVER_TRANSITION}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-bis-border bg-bis-surface shadow-[var(--bis-shadow-sm)] transition-[border-color,box-shadow] duration-200 hover:border-bis-border-strong hover:shadow-[var(--bis-shadow-md)]"
      >
        {hasPhoto ? (
          <PortalMedia
            src={announcement.imageUrl}
            alt={announcement.imageAlt}
            placeholderLabel={announcement.category}
            aspectClass="aspect-[16/10]"
            zoomOnHover
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        ) : (
          <div className="h-1 w-full bg-bis-accent" />
        )}

        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge label={announcement.category} tone="neutral" dot={false} />
              {announcement.priority && (
                <StatusBadge
                  label={announcement.priority}
                  tone={PRIORITY_TONE[announcement.priority]}
                />
              )}
            </div>
            <h3 className="mt-2.5 text-[15px] font-semibold leading-snug text-bis-text">
              {announcement.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-bis-muted dark:text-slate-300">
              {announcement.summary}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-bis-border/80 pt-2.5 text-xs">
            <span className="text-[11px] font-medium text-bis-muted">
              {announcement.publishedDate}
            </span>
            <button
              type="button"
              onClick={() => onReadMore(announcement)}
              className="group/readmore inline-flex items-center gap-1 font-semibold text-bis-accent hover:underline dark:text-[#93B9E6]"
            >
              <span>Read More</span>
              <ArrowRight
                className="h-3 w-3 transition-transform duration-200 motion-safe:group-hover/readmore:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </m.article>
    );
  }

  /* Style C Clean Information Card */
  return (
    <m.article
      whileHover={CARD_HOVER_LIFT}
      transition={CARD_HOVER_TRANSITION}
      className="group relative flex h-full flex-col justify-between rounded-xl border border-bis-border bg-bis-surface p-5 shadow-[var(--bis-shadow-sm)] transition-[border-color,box-shadow] duration-200 hover:border-bis-border-strong hover:shadow-[var(--bis-shadow-md)]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-bis-border transition-colors duration-200 group-hover:bg-bis-accent"
      />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge label={announcement.category} tone="neutral" dot={false} />
            {announcement.priority && (
              <StatusBadge
                label={announcement.priority}
                tone={PRIORITY_TONE[announcement.priority]}
              />
            )}
          </div>
          <span className="text-[11px] font-medium text-bis-muted">
            {announcement.publishedDate}
          </span>
        </div>

        <h3 className="mt-3 text-[15px] font-semibold leading-snug text-bis-text transition-colors group-hover:text-bis-accent dark:group-hover:text-[#93B9E6]">
          {announcement.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-bis-muted dark:text-slate-300">
          {announcement.summary}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-bis-border/80 pt-3 text-xs">
        <span className="truncate text-[11px] font-medium text-bis-muted">
          {announcement.authorOffice}
        </span>
        <button
          type="button"
          onClick={() => onReadMore(announcement)}
          className="group/readmore inline-flex shrink-0 items-center gap-1 font-semibold text-bis-accent hover:underline dark:text-[#93B9E6]"
        >
          <span>Read More</span>
          <ArrowRight
            className="h-3 w-3 transition-transform duration-200 motion-safe:group-hover/readmore:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </m.article>
  );
}
