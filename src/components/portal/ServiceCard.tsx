'use client';

import * as React from 'react';
import { m } from 'motion/react';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Building2,
  Check,
  FileCheck2,
  FileText,
  HeartHandshake,
  Home,
} from 'lucide-react';
import type { PortalService, PortalServiceIconName } from '@/types/portal';
import { CARD_HOVER_LIFT, CARD_HOVER_TRANSITION } from './motion';

export interface ServiceCardProps {
  service: PortalService;
  indexNumber?: number;
  matrixCell?: boolean;
  onViewRequirements: (service: PortalService) => void;
}

const SERVICE_ICON_MAP: Record<PortalServiceIconName, typeof FileCheck2> = {
  FileCheck2,
  Home,
  HeartHandshake,
  Building2,
  Award,
  BriefcaseBusiness,
  FileText,
};

/**
 * Style C Clean Information Service Card supporting seamless hairline-matrix layout
 * on the landing directory as well as standalone cards in modals.
 */
export function ServiceCard({
  service,
  indexNumber,
  matrixCell = false,
  onViewRequirements,
}: ServiceCardProps) {
  const Icon = SERVICE_ICON_MAP[service.icon];
  const formattedIndex =
    typeof indexNumber === 'number'
      ? String(indexNumber + 1).padStart(2, '0')
      : null;

  const content = (
    <>
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bis-accent-soft text-bis-accent transition-colors duration-200 group-hover:bg-bis-accent group-hover:text-white dark:text-[#93B9E6] dark:group-hover:bg-[#5285C1] dark:group-hover:text-[#0F172A]">
              <Icon className="h-5 w-5" strokeWidth={1.85} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-snug text-bis-text">
                {service.name}
              </h3>
              <p className="mt-0.5 text-[11px] font-medium text-bis-muted">
                {service.officeWindow}
              </p>
            </div>
          </div>

          {formattedIndex && (
            <span className="shrink-0 font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
              {formattedIndex}
            </span>
          )}
        </div>

        <p className="mt-3.5 text-xs leading-relaxed text-bis-muted dark:text-slate-300">
          {service.shortDescription}
        </p>

        {/* Requirements Preview */}
        <div className="mt-4 border-t border-bis-border/80 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-bis-text">
            Basic Requirements
          </p>
          <ul className="mt-2 space-y-1.5">
            {service.requirementsPreview.map((req) => (
              <li
                key={req}
                className="flex items-start gap-2 text-xs text-bis-muted dark:text-slate-300"
              >
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bis-accent dark:text-[#93B9E6]"
                  aria-hidden="true"
                />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-bis-border/80 pt-3">
        <span className="text-[11px] font-medium text-bis-muted">Walk-in Filing</span>
        <button
          type="button"
          onClick={() => onViewRequirements(service)}
          className="group/svc-link inline-flex items-center gap-1 rounded-sm text-xs font-semibold text-bis-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bis-accent dark:text-[#93B9E6]"
        >
          <span>View Requirements</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/svc-link:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </>
  );

  if (matrixCell) {
    return (
      <article className="group flex h-full flex-col justify-between bg-bis-surface p-5 transition-colors duration-150 hover:bg-bis-surface-subtle/85 focus-within:bg-bis-surface-subtle sm:p-6">
        {content}
      </article>
    );
  }

  return (
    <m.article
      whileHover={CARD_HOVER_LIFT}
      transition={CARD_HOVER_TRANSITION}
      className="group flex h-full flex-col justify-between rounded-xl border border-bis-border bg-bis-surface p-5 shadow-[var(--bis-shadow-sm)] transition-[border-color,box-shadow] duration-200 hover:border-bis-border-strong hover:shadow-[var(--bis-shadow-md)] focus-within:border-bis-accent"
    >
      {content}
    </m.article>
  );
}
