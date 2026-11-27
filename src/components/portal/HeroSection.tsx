'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'motion/react';
import { ArrowRight, Bell, Clock, FileCheck2, MapPin } from 'lucide-react';
import type { PortalAnnouncement } from '@/types/portal';
import {
  BUTTON_HOVER_LIFT,
  BUTTON_TAP_PRESS,
  EDITORIAL_EASE,
  PortalReveal,
  PortalStaggerGrid,
  PortalStaggerItem,
} from './motion';

export interface HeroSectionProps {
  barangayName: string;
  locationLabel: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  featuredAnnouncement?: PortalAnnouncement;
  onInspectAnnouncement: (announcement: PortalAnnouncement) => void;
}

/**
 * Immersive full-bleed photographic hero with layered deep navy scrim,
 * warm amber highlights, editorial headline, and connected glass advisory dispatch.
 */
export function HeroSection({
  barangayName,
  locationLabel,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  featuredAnnouncement,
  onInspectAnnouncement,
}: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-bis-navy-deep text-white"
    >
      {/* Full-Width Community Photograph Layer */}
      <m.div
        initial={{ opacity: 0.35, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, ease: EDITORIAL_EASE }}
        className="pointer-events-none absolute inset-0"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
      </m.div>

      {/* Deep Navy Directional Scrims for WCAG Text Legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#091528]/95 via-[#0F213B]/86 to-[#163056]/68"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091528]/88 via-transparent to-[#091528]/45"
      />

      {/* Main Content Grid with Generous Bottom Cushion for Overlapping Stats Band */}
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Editorial Identity & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            <PortalReveal immediate variant="fadeIn" delay={0.02}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-200 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                  Official Digital Community Portal
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200/90">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  <span>
                    {barangayName} • {locationLabel}
                  </span>
                </span>
              </div>
            </PortalReveal>

            <PortalReveal immediate variant="fadeUp" delay={0.06}>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl lg:text-[2.85rem] lg:leading-[1.1]">
                {title}
              </h1>
            </PortalReveal>

            <PortalReveal immediate variant="fadeUp" delay={0.14}>
              <p className="max-w-2xl text-[15px] leading-relaxed text-slate-200/90 sm:text-base">
                {subtitle}
              </p>
            </PortalReveal>

            <PortalStaggerGrid
              immediate
              stagger={0.07}
              delayChildren={0.2}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <PortalStaggerItem>
                <m.div
                  whileHover={BUTTON_HOVER_LIFT}
                  whileTap={BUTTON_TAP_PRESS}
                  transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
                >
                  <Link
                    href="#services"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#B45309] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#92400E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                  >
                    <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                    <span>Explore Barangay Services</span>
                  </Link>
                </m.div>
              </PortalStaggerItem>

              <PortalStaggerItem>
                <m.div
                  whileHover={BUTTON_HOVER_LIFT}
                  whileTap={BUTTON_TAP_PRESS}
                  transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
                >
                  <Link
                    href="#announcements"
                    className="group/hero-cta inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-150 hover:border-white/50 hover:bg-white/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span>View Latest Announcements</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 motion-safe:group-hover/hero-cta:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </m.div>
              </PortalStaggerItem>
            </PortalStaggerGrid>
          </div>

          {/* Right Layered Glass Advisory Dispatch Card */}
          <div className="lg:col-span-5">
            {featuredAnnouncement && (
              <PortalReveal immediate variant="scale" delay={0.22}>
                <aside
                  aria-label="Latest community advisory dispatch"
                  className="rounded-xl border border-white/20 bg-[#0B192E]/88 p-5 shadow-2xl backdrop-blur-md sm:p-6"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 text-amber-300">
                        <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                        Latest Advisory
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-200">
                      {featuredAnnouncement.publishedDate}
                    </span>
                  </div>

                  <h2 className="mt-3.5 text-base font-semibold leading-snug text-white sm:text-[17px]">
                    {featuredAnnouncement.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-200 sm:text-[13px]">
                    {featuredAnnouncement.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] font-medium text-slate-300">
                      {featuredAnnouncement.authorOffice}
                    </span>
                    <button
                      type="button"
                      onClick={() => onInspectAnnouncement(featuredAnnouncement)}
                      className="group/advisory inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition-colors hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                    >
                      <span>Read Full Advisory</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover/advisory:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-[11px] text-slate-200">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
                    <span>Walk-In Desk: Mon–Fri, 8:00 AM – 5:00 PM</span>
                  </div>
                </aside>
              </PortalReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
