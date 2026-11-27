'use client';

import * as React from 'react';
import Link from 'next/link';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { BarangaySealLogo } from '@/components/layout/BarangaySealLogo';
import { AppButton } from '@/components/ui';
import type { PortalOverviewData } from '@/types/portal';
import { PortalReveal } from './motion';

export interface PublicFooterProps {
  data: PortalOverviewData;
}

/**
 * Organized community portal footer with navigation, services directory,
 * contact details, policy dialogs, and copyright notice.
 */
export function PublicFooter({ data }: PublicFooterProps) {
  const [policyModal, setPolicyModal] = React.useState<
    'privacy' | 'terms' | null
  >(null);

  return (
    <>
      <footer className="border-t-2 border-bis-amber bg-bis-navy-deep text-slate-100">
        <PortalReveal variant="fadeIn">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
              {/* Brand Summary */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <BarangaySealLogo className="h-9 w-9 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {data.barangayName}
                    </p>
                    <p className="text-xs text-slate-300">{data.locationLabel}</p>
                  </div>
                </div>
                <p className="max-w-sm text-xs leading-relaxed text-slate-300">
                  Digital Barangay Community Information Portal providing residents
                  with transparent public updates, event schedules, community
                  programs, and clear front-desk service requirements.
                </p>
                <div className="pt-1">
                  <Link
                    href="/dashboard"
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline"
                  >
                    Staff &amp; Officials Admin Portal →
                  </Link>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="lg:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Quick Links
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li>
                    <a href="#home" className="transition-colors hover:text-amber-300">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="transition-colors hover:text-amber-300">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#announcements" className="transition-colors hover:text-amber-300">
                      News &amp; Announcements
                    </a>
                  </li>
                  <li>
                    <a href="#events" className="transition-colors hover:text-amber-300">
                      Upcoming Events
                    </a>
                  </li>
                  <li>
                    <a href="#programs" className="transition-colors hover:text-amber-300">
                      Programs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Services */}
              <div className="lg:col-span-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Barangay Services
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  {data.services.slice(0, 5).map((service) => (
                    <li key={service.id}>
                      <a href="#services" className="transition-colors hover:text-amber-300">
                        {service.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact & Social */}
              <div className="lg:col-span-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Contact Information
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li>{data.contact.addressPlaceholder}</li>
                  <li>{data.contact.phonePlaceholder}</li>
                  <li>{data.contact.emailPlaceholder}</li>
                  <li className="pt-1 flex flex-wrap gap-3">
                    {data.contact.socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="font-medium text-amber-300 hover:text-amber-200 hover:underline"
                      >
                        {social.label}
                      </a>
                    ))}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © 2026 {data.barangayName} — {data.portalName}. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setPolicyModal('privacy')}
                  className="transition-colors hover:text-white hover:underline"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyModal('terms')}
                  className="transition-colors hover:text-white hover:underline"
                >
                  Terms of Use
                </button>
              </div>
            </div>
          </div>
        </PortalReveal>
      </footer>

      <Dialog
        open={Boolean(policyModal)}
        onClose={() => setPolicyModal(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="text-base font-semibold text-bis-text">
          {policyModal === 'privacy'
            ? 'Data Privacy Notice (Placeholder)'
            : 'Portal Terms of Use (Placeholder)'}
        </DialogTitle>
        <DialogContent dividers>
          <p className="text-sm leading-relaxed text-bis-muted">
            {policyModal === 'privacy'
              ? 'This public portal displays community announcements, event schedules, and document requirement guides only. Personal resident records remain restricted inside the authenticated Barangay Information System administrative workspace in compliance with the Philippine Data Privacy Act of 2012 (RA 10173).'
              : 'Information published on this portal serves as a public reference guide. Official barangay clearances, certifications, and schedules remain subject to verification at the Barangay Hall front desk.'}
          </p>
        </DialogContent>
        <DialogActions className="px-6 py-3">
          <AppButton variant="outline" onClick={() => setPolicyModal(null)}>
            Close
          </AppButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
