'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AppButton, StatusBadge } from '@/components/ui';
import type { PortalProgram } from '@/types/portal';
import {
  PortalReveal,
  PortalStaggerGrid,
  PortalStaggerItem,
} from './motion';
import { ProgramCard } from './ProgramCard';

export interface ProgramsSectionProps {
  programs: PortalProgram[];
}

/**
 * "Programs That Serve Our Community" section using a varied two-tier layout:
 * featured photographic spotlights followed by a structured directory of all 8 categories.
 */
export function ProgramsSection({ programs }: ProgramsSectionProps) {
  const [selectedProgram, setSelectedProgram] =
    React.useState<PortalProgram | null>(null);

  const spotlightPrograms = programs.filter((item) => item.spotlight);
  const directoryPrograms = programs.filter((item) => !item.spotlight);

  return (
    <>
      <section
        id="programs"
        aria-labelledby="programs-heading"
        className="border-t border-bis-border bg-bis-bg py-14 sm:py-16"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <PortalReveal variant="fadeUp">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bis-border pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bis-accent dark:text-[#93B9E6]">
                    Community Development &amp; Support
                  </p>
                  <StatusBadge label="Sample Programs" tone="neutral" dot={false} />
                </div>
                <h2
                  id="programs-heading"
                  className="mt-1 text-2xl font-semibold tracking-tight text-bis-text sm:text-[1.75rem]"
                >
                  Programs That Serve Our Community
                </h2>
              </div>
              <p className="text-xs font-medium text-bis-muted">
                8 core resident support tracks
              </p>
            </div>
          </PortalReveal>

          {/* Tier 1: Asymmetric 7/5 Photography-Led + Navy Civic Feature */}
          <PortalStaggerGrid
            stagger={0.08}
            className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12"
          >
            {spotlightPrograms.map((program, idx) => (
              <PortalStaggerItem
                key={program.id}
                className={idx === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}
              >
                <ProgramCard
                  program={program}
                  variant={program.imageUrl ? 'spotlight-photo' : 'spotlight-navy'}
                  onLearnMore={setSelectedProgram}
                />
              </PortalStaggerItem>
            ))}
          </PortalStaggerGrid>

          {/* Tier 2: 2-Column Architectural Program Index */}
          <PortalReveal variant="fadeUp" delay={0.08} className="mt-6">
            <div className="overflow-hidden rounded-xl border border-bis-border bg-bis-surface shadow-[var(--bis-shadow-sm)]">
              <div className="flex items-center justify-between border-b border-bis-border bg-bis-surface-subtle px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-bis-muted">
                  Health, Education, Youth, Senior, PWD &amp; Environmental Directory
                </span>
                <span className="font-mono text-[11px] text-bis-muted">
                  {directoryPrograms.length} active tracks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {directoryPrograms.map((program, index) => (
                  <div
                    key={program.id}
                    className={`border-bis-border ${
                      index < directoryPrograms.length - 2
                        ? 'border-b'
                        : index < directoryPrograms.length - 1
                          ? 'border-b md:border-b-0'
                          : ''
                    } ${index % 2 === 0 ? 'md:border-r' : ''}`}
                  >
                    <ProgramCard
                      program={program}
                      variant="directory-row"
                      onLearnMore={setSelectedProgram}
                    />
                  </div>
                ))}
              </div>
            </div>
          </PortalReveal>
        </div>
      </section>

      <Dialog
        open={Boolean(selectedProgram)}
        onClose={() => setSelectedProgram(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedProgram && (
          <>
            <DialogTitle className="flex flex-wrap items-center justify-between gap-2 text-base font-semibold text-bis-text">
              <span>{selectedProgram.category}</span>
              <StatusBadge
                label={selectedProgram.status}
                tone={selectedProgram.statusTone}
              />
            </DialogTitle>
            <DialogContent dividers className="space-y-3">
              <h3 className="text-lg font-semibold text-bis-text">
                {selectedProgram.title}
              </h3>
              <p className="text-sm leading-relaxed text-bis-text">
                {selectedProgram.description}
              </p>
              <p className="text-sm leading-relaxed text-bis-muted">
                {selectedProgram.details}
              </p>
              <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3 text-xs space-y-1">
                <p>
                  <span className="font-semibold text-bis-text">
                    Target Beneficiaries:{' '}
                  </span>
                  <span className="text-bis-muted">
                    {selectedProgram.targetBeneficiaries}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-bis-text">
                    Coordination Desk:{' '}
                  </span>
                  <span className="text-bis-muted">
                    {selectedProgram.scheduleOrContact}
                  </span>
                </p>
              </div>
            </DialogContent>
            <DialogActions className="px-6 py-3">
              <AppButton
                variant="outline"
                onClick={() => setSelectedProgram(null)}
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
