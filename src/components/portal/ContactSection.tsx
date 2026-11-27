'use client';

import * as React from 'react';
import { m } from 'motion/react';
import { Clock, ExternalLink, Mail, MapPin, Phone, Share2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import type { PortalOverviewData } from '@/types/portal';
import {
  BUTTON_TAP_PRESS,
  EDITORIAL_EASE,
  PortalReveal,
} from './motion';

export interface ContactSectionProps {
  barangayName: string;
  contact: PortalOverviewData['contact'];
}

/**
 * Clean practical contact section combining frameless typographic contact channels
 * on pure surface with a deep-navy architectural Barangay Hall GIS map panel.
 */
export function ContactSection({ barangayName, contact }: ContactSectionProps) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-bis-border bg-bis-surface py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <PortalReveal variant="fadeUp">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-bis-border pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bis-accent dark:text-[#93B9E6]">
                Citizen Assistance &amp; Inquiries
              </p>
              <h2
                id="contact-heading"
                className="mt-1 text-2xl font-semibold tracking-tight text-bis-text sm:text-[1.75rem]"
              >
                Contact and Barangay Hall Location
              </h2>
            </div>
            <StatusBadge label="Placeholder Contact Details" tone="neutral" dot={false} />
          </div>
        </PortalReveal>

        <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Style C Clean Contact Information List */}
          <PortalReveal variant="fadeUp" delay={0.04} className="lg:col-span-5">
            <div className="divide-y divide-bis-border rounded-xl border border-bis-border bg-bis-surface-subtle/60 px-5 py-2 shadow-[var(--bis-shadow-sm)]">
              <div className="flex items-start gap-3.5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bis-accent-soft text-bis-accent dark:text-[#93B9E6]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                    Barangay Office Address
                  </h3>
                  <p className="mt-1 text-sm font-medium text-bis-text">
                    {contact.addressPlaceholder}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bis-accent-soft text-bis-accent dark:text-[#93B9E6]">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                    Telephone &amp; Hotline
                  </h3>
                  <p className="mt-1 text-sm font-medium text-bis-text">
                    {contact.phonePlaceholder}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bis-accent-soft text-bis-accent dark:text-[#93B9E6]">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                    Official Email
                  </h3>
                  <p className="mt-1 text-sm font-medium text-bis-text">
                    {contact.emailPlaceholder}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bis-accent-soft text-bis-accent dark:text-[#93B9E6]">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                    Office Hours
                  </h3>
                  <p className="mt-1 text-sm text-bis-text">
                    {contact.officeHours}
                  </p>
                </div>
              </div>

              <div className="py-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                  <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Public Communication Channels</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {contact.socialLinks.map((social) => (
                    <m.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ y: -1.5 }}
                      whileTap={BUTTON_TAP_PRESS}
                      transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
                      className="group/social inline-flex items-center gap-1.5 rounded-lg border border-bis-border bg-bis-surface px-3 py-1.5 text-xs font-medium text-bis-text transition-colors duration-150 hover:border-bis-accent/55 hover:bg-bis-accent-soft hover:text-bis-accent dark:hover:text-[#93B9E6]"
                    >
                      <span>{social.label}</span>
                      <ExternalLink
                        className="h-3 w-3 text-bis-muted transition-transform duration-200 motion-safe:group-hover/social:translate-x-0.5 motion-safe:group-hover/social:-translate-y-0.5 group-hover/social:text-bis-accent dark:group-hover/social:text-[#93B9E6]"
                        aria-hidden="true"
                      />
                    </m.a>
                  ))}
                </div>
              </div>
            </div>
          </PortalReveal>

          {/* Style B Deep Navy Architectural Map / Location Panel */}
          <PortalReveal variant="scale" delay={0.08} className="lg:col-span-7">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#28446E] bg-bis-navy-deep text-white shadow-[var(--bis-shadow-md)]">
              <div className="flex items-center justify-between border-b border-white/15 bg-[#0A182B] px-5 py-3.5">
                <span className="text-xs font-semibold text-white">
                  {barangayName} Hall — Location Map
                </span>
                <span className="font-mono text-[11px] font-medium text-amber-300">
                  GIS / Map Slot
                </span>
              </div>

              <div className="relative flex flex-1 min-h-[300px] flex-col items-center justify-center p-6 text-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                  }}
                />
                <div className="relative z-10 max-w-md rounded-xl border border-white/20 bg-[#0F213B]/92 px-6 py-5 backdrop-blur-md shadow-2xl">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#B45309] text-white shadow-sm">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3.5 text-sm font-semibold text-white">
                    Barangay Hall Map Placeholder
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                    {contact.landmarksPlaceholder}
                  </p>
                  <p className="mt-2.5 font-mono text-[11px] text-amber-300">
                    Leaflet / Google Maps coordinates connect here
                  </p>
                </div>
              </div>
            </div>
          </PortalReveal>
        </div>
      </div>
    </section>
  );
}
