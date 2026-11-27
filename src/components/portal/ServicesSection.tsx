'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { m } from 'motion/react';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import {
  AppButton,
  EmptyState,
  SearchInput,
  StatusBadge,
} from '@/components/ui';
import type { PortalService } from '@/types/portal';
import {
  BUTTON_HOVER_LIFT,
  BUTTON_TAP_PRESS,
  EDITORIAL_EASE,
  PortalReveal,
  PortalStaggerGrid,
  PortalStaggerItem,
} from './motion';
import { ServiceCard } from './ServiceCard';

export interface ServicesSectionProps {
  services: PortalService[];
}

/**
 * "Barangay Services Made Accessible" section providing accurate walk-in
 * document requirements without claiming unimplemented online filing.
 */
export function ServicesSection({ services }: ServicesSectionProps) {
  const [selectedService, setSelectedService] =
    React.useState<PortalService | null>(null);
  const [allServicesOpen, setAllServicesOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredServices = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (svc) =>
        svc.name.toLowerCase().includes(q) ||
        svc.shortDescription.toLowerCase().includes(q) ||
        svc.fullRequirements.some((req) => req.toLowerCase().includes(q))
    );
  }, [services, searchQuery]);

  return (
    <>
      <section
        id="services"
        aria-labelledby="services-heading"
        className="border-t border-bis-border bg-bis-surface py-14 sm:py-16"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <PortalReveal variant="fadeUp">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bis-border pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bis-accent dark:text-[#93B9E6]">
                  Citizen Service Guide
                </p>
                <h2
                  id="services-heading"
                  className="mt-1 text-2xl font-semibold tracking-tight text-bis-text sm:text-[1.75rem]"
                >
                  Barangay Services Made Accessible
                </h2>
              </div>

              <m.div
                whileHover={BUTTON_HOVER_LIFT}
                whileTap={BUTTON_TAP_PRESS}
                transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
              >
                <AppButton
                  variant="primary"
                  size="md"
                  endIcon={
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 motion-safe:group-hover/svc-all:translate-x-0.5" />
                  }
                  onClick={() => setAllServicesOpen(true)}
                  className="group/svc-all transition-shadow duration-150 hover:shadow-[var(--bis-shadow-md)]"
                >
                  Explore All Barangay Services
                </AppButton>
              </m.div>
            </div>
          </PortalReveal>

          {/* Honest Walk-In Service Reminder */}
          <PortalReveal variant="fadeIn" delay={0.05}>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-bis-border border-l-4 border-l-bis-amber bg-bis-surface-subtle px-4 py-3.5 text-xs text-bis-muted dark:text-slate-300">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-bis-amber"
                aria-hidden="true"
              />
              <p>
                <strong className="font-semibold text-bis-text">
                  In-Person Filing Required:{' '}
                </strong>
                Review the document checklists below and bring valid IDs to your assigned Barangay Hall window during office hours.
              </p>
            </div>
          </PortalReveal>

          {/* Numbered 01-06 Architectural Hairline Matrix */}
          <PortalStaggerGrid
            stagger={0.055}
            className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-bis-border bg-bis-border shadow-[var(--bis-shadow-sm)] md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service, idx) => (
              <PortalStaggerItem key={service.id} className="h-full">
                <ServiceCard
                  service={service}
                  indexNumber={idx}
                  matrixCell
                  onViewRequirements={setSelectedService}
                />
              </PortalStaggerItem>
            ))}
          </PortalStaggerGrid>
        </div>
      </section>

      {/* Searchable Full Service Guide Modal */}
      <Dialog
        open={allServicesOpen}
        onClose={() => setAllServicesOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex flex-wrap items-center justify-between gap-3 text-base font-semibold text-bis-text">
          <span>Barangay Services &amp; Requirements Directory</span>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search certificates or requirements..."
            aria-label="Search barangay services"
            containerClassName="w-full sm:w-72"
          />
        </DialogTitle>
        <DialogContent dividers>
          {filteredServices.length === 0 ? (
            <EmptyState
              compact
              title="No matching services"
              description={`No services matched "${searchQuery}".`}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredServices.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  service={svc}
                  onViewRequirements={(item) => {
                    setAllServicesOpen(false);
                    setSelectedService(item);
                  }}
                />
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-3">
          <AppButton variant="outline" onClick={() => setAllServicesOpen(false)}>
            Close
          </AppButton>
        </DialogActions>
      </Dialog>

      {/* Requirements Checklist Modal */}
      <Dialog
        open={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedService && (
          <>
            <DialogTitle className="flex flex-wrap items-center justify-between gap-2 text-base font-semibold text-bis-text">
              <span>{selectedService.name}</span>
              <StatusBadge label="Walk-In Counter Service" tone="accent" />
            </DialogTitle>
            <DialogContent dividers className="space-y-4">
              <p className="text-sm leading-relaxed text-bis-muted">
                {selectedService.shortDescription}
              </p>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-bis-text">
                  Required Documents &amp; Steps
                </h4>
                <ul className="mt-2 space-y-2">
                  {selectedService.fullRequirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-2 text-sm text-bis-text"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-bis-accent dark:text-[#93B9E6]"
                        aria-hidden="true"
                      />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3.5 text-xs space-y-1.5">
                <p>
                  <span className="font-semibold text-bis-text">
                    Assigned Counter:{' '}
                  </span>
                  <span className="text-bis-muted">
                    {selectedService.officeWindow}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-bis-text">
                    Processing Time:{' '}
                  </span>
                  <span className="text-bis-muted">
                    {selectedService.processingEstimate}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-bis-text">Fee Note: </span>
                  <span className="text-bis-muted">{selectedService.feeNote}</span>
                </p>
              </div>
            </DialogContent>
            <DialogActions className="px-6 py-3">
              <AppButton
                variant="outline"
                onClick={() => setSelectedService(null)}
              >
                Close
              </AppButton>
              <AppButton
                variant="primary"
                href="#contact"
                onClick={() => setSelectedService(null)}
              >
                View Office Location &amp; Hours
              </AppButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
