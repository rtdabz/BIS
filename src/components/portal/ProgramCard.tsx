'use client';

import * as React from 'react';
import { m } from 'motion/react';
import {
  Accessibility,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Leaf,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import type { PortalProgram } from '@/types/portal';
import { CARD_HOVER_LIFT, CARD_HOVER_TRANSITION } from './motion';
import { PortalMedia } from './PortalMedia';

export interface ProgramCardProps {
  program: PortalProgram;
  variant?: 'spotlight-photo' | 'spotlight-navy' | 'directory-row';
  onLearnMore: (program: PortalProgram) => void;
}

const PROGRAM_ICON_MAP: Record<PortalProgram['category'], typeof HeartPulse> = {
  'Health and Wellness': HeartPulse,
  'Education Assistance': GraduationCap,
  'Livelihood Development': BriefcaseBusiness,
  'Youth Development': Sparkles,
  'Senior Citizen Support': HeartHandshake,
  'PWD Assistance': Accessibility,
  'Environmental Programs': Leaf,
  'Disaster Preparedness': ShieldAlert,
};

/**
 * Program card implementing Style A (Image Background Feature),
 * Style B (Solid Deep Navy Feature), and Style C (Clean Directory Index Row).
 */
export function ProgramCard({
  program,
  variant = 'directory-row',
  onLearnMore,
}: ProgramCardProps) {
  const Icon = PROGRAM_ICON_MAP[program.category];

  if (variant === 'spotlight-photo' && program.imageUrl) {
    return (
      <m.article
        whileHover={CARD_HOVER_LIFT}
        transition={CARD_HOVER_TRANSITION}
        className="group relative flex min-h-[350px] flex-col justify-end overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep text-white shadow-[var(--bis-shadow-md)] sm:min-h-[390px]"
      >
        <div className="absolute inset-0">
          <PortalMedia
            src={program.imageUrl}
            alt={program.imageAlt ?? program.title}
            aspectClass="h-full w-full"
            zoomOnHover
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081325]/97 via-[#0D1E38]/82 to-[#0D1E38]/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#081325]/80 via-[#0D1E38]/40 to-transparent"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-end p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-200 backdrop-blur-sm">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{program.category}</span>
            </span>
            <span className="rounded-md border border-white/25 bg-[#0F213B]/80 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              {program.status}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-semibold leading-snug text-white sm:text-2xl">
            {program.title}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-100">
            {program.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Users className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>{program.targetBeneficiaries}</span>
            </span>
            <button
              type="button"
              onClick={() => onLearnMore(program)}
              className="group/learnmore inline-flex shrink-0 items-center gap-1.5 font-semibold text-amber-300 transition-colors hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              <span>Learn More</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/learnmore:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </m.article>
    );
  }

  if (variant === 'spotlight-navy' || variant === 'spotlight-photo') {
    return (
      <m.article
        whileHover={CARD_HOVER_LIFT}
        transition={CARD_HOVER_TRANSITION}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep p-6 text-white shadow-[var(--bis-shadow-md)] sm:p-7"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-amber-500"
        />

        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-amber-300">
              <Icon className="h-5 w-5" strokeWidth={1.85} aria-hidden="true" />
            </div>
            <span className="rounded-md border border-amber-400/40 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
              {program.status}
            </span>
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
            {program.category}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold leading-snug text-white sm:text-xl">
            {program.title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-200">
            {program.description}
          </p>
        </div>

        <div className="mt-6 space-y-3 border-t border-white/15 pt-4 text-xs">
          <p className="flex items-start gap-2 text-slate-200">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
            <span>{program.targetBeneficiaries}</span>
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-300">{program.scheduleOrContact}</span>
            <button
              type="button"
              onClick={() => onLearnMore(program)}
              className="group/learnmore inline-flex shrink-0 items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              <span>Learn More</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/learnmore:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </m.article>
    );
  }

  /* Style C Clean Directory Index Row */
  return (
    <article className="group flex h-full flex-col justify-between bg-bis-surface p-5 transition-colors duration-150 hover:bg-bis-surface-subtle/85 sm:p-6">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-bis-border bg-bis-surface-subtle text-bis-accent transition-colors duration-200 group-hover:border-bis-accent/40 group-hover:bg-bis-accent-soft dark:text-[#93B9E6]">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.85} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-bis-muted">
                {program.category}
              </p>
              <h3 className="text-[15px] font-semibold leading-snug text-bis-text">
                {program.title}
              </h3>
            </div>
          </div>
          <StatusBadge label={program.status} tone={program.statusTone} />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-bis-muted dark:text-slate-300">
          {program.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-bis-border/80 pt-3 text-xs">
        <span className="truncate text-[11px] text-bis-muted dark:text-slate-300">
          <strong className="font-medium text-bis-text">For: </strong>
          {program.targetBeneficiaries}
        </span>
        <button
          type="button"
          onClick={() => onLearnMore(program)}
          className="group/learnmore inline-flex shrink-0 items-center gap-1 font-semibold text-bis-accent hover:underline dark:text-[#93B9E6]"
        >
          <span>Learn More</span>
          <ArrowRight
            className="h-3 w-3 transition-transform duration-200 motion-safe:group-hover/learnmore:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}
