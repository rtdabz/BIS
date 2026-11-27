'use client';

import * as React from 'react';
import { RotateCcw, Save, Settings2 } from 'lucide-react';
import {
  AppButton,
  CheckboxField,
  ConfirmDialog,
  FormField,
  PageHeader,
  SectionCard,
  StatusBadge,
  TextInput,
  ThemeToggle,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import type { CertificateDocumentType } from '@/types/bis';

const CERT_TYPES: CertificateDocumentType[] = [
  'Barangay Clearance',
  'Certificate of Indigency',
  'Certificate of Residency',
  'Business Permit Clearance',
  'Certificate of Good Moral Character',
  'First-Time Jobseeker (RA 11261)',
  'Solo Parent Certification',
];

export function SettingsModule() {
  const { db, hydrated, updateSettings, resetDemoDatabase } = useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('settings');

  const [tab, setTab] = React.useState<'profile' | 'fees' | 'system'>('profile');
  const [resetOpen, setResetOpen] = React.useState(false);

  return (
    <SettingsEditor
      key={`${hydrated ? 'h' : 's'}-${db.settings.barangayName}-${db.settings.signatories.punongBarangay}`}
      initialSettings={db.settings}
      tab={tab}
      setTab={setTab}
      resetOpen={resetOpen}
      setResetOpen={setResetOpen}
      allowManage={allowManage}
      actorMeta={actorMeta}
      updateSettings={updateSettings}
      resetDemoDatabase={resetDemoDatabase}
      showToast={showToast}
    />
  );
}

function SettingsEditor({
  initialSettings,
  tab,
  setTab,
  resetOpen,
  setResetOpen,
  allowManage,
  actorMeta,
  updateSettings,
  resetDemoDatabase,
  showToast,
}: {
  initialSettings: ReturnType<typeof useBisStore>['db']['settings'];
  tab: 'profile' | 'fees' | 'system';
  setTab: (t: 'profile' | 'fees' | 'system') => void;
  resetOpen: boolean;
  setResetOpen: (v: boolean) => void;
  allowManage: boolean;
  actorMeta: { id: string; name: string; role: string };
  updateSettings: ReturnType<typeof useBisStore>['updateSettings'];
  resetDemoDatabase: ReturnType<typeof useBisStore>['resetDemoDatabase'];
  showToast: ReturnType<typeof useToast>['showToast'];
}) {
  const [form, setForm] = React.useState(initialSettings);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form, actorMeta);
    showToast({
      title: 'Barangay configuration saved',
      message: 'Header, sidebar, and official signatories updated.',
      tone: 'success',
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System Management"
        title="Barangay & System Settings"
        subtitle="Configure barangay metadata, official signatories, certificate fee schedules, and theme preferences."
        metadata={<StatusBadge label="Sample Data Mode" tone="accent" />}
      />

      {/* Segment Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-[10px] border border-bis-border bg-bis-surface p-1.5 shadow-[var(--bis-shadow-sm)] w-fit">
        {(
          [
            { id: 'profile', label: 'Barangay Profile & Signatories' },
            { id: 'fees', label: 'Certificate Fees & Workflows' },
            { id: 'system', label: 'Display & Demo Data Controls' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === item.id
                ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                : 'text-bis-muted hover:text-bis-text'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <SectionCard
            title="Barangay Identity & Office Metadata"
            subtitle="Reflected across the navigation shell, printable certificates, and official reports."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Barangay Name">
                <TextInput
                  disabled={!allowManage}
                  value={form.barangayName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, barangayName: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Municipality / City">
                <TextInput
                  disabled={!allowManage}
                  value={form.municipalityOrCity}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      municipalityOrCity: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Province & Region">
                <TextInput
                  disabled={!allowManage}
                  value={form.provinceOrRegion}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, provinceOrRegion: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="PSGC / Barangay Code">
                <TextInput
                  disabled={!allowManage}
                  value={form.barangayCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, barangayCode: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Fiscal Period">
                <TextInput
                  disabled={!allowManage}
                  value={form.fiscalPeriod}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fiscalPeriod: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Contact Phone">
                <TextInput
                  disabled={!allowManage}
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactPhone: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Official Email">
                <TextInput
                  disabled={!allowManage}
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactEmail: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Office Address" className="sm:col-span-2">
                <TextInput
                  disabled={!allowManage}
                  value={form.officeAddress}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, officeAddress: e.target.value }))
                  }
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            title="Official Document Signatories"
            subtitle="Names printed on Barangay Clearances, Indigency Certificates, and Blotter Extracts."
            headerAction={
              allowManage && (
                <AppButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  startIcon={<Save className="h-3.5 w-3.5" />}
                >
                  Save Profile &amp; Signatories
                </AppButton>
              )
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Punong Barangay">
                <TextInput
                  disabled={!allowManage}
                  value={form.signatories.punongBarangay}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      signatories: {
                        ...p.signatories,
                        punongBarangay: e.target.value,
                      },
                    }))
                  }
                />
              </FormField>
              <FormField label="Barangay Secretary">
                <TextInput
                  disabled={!allowManage}
                  value={form.signatories.barangaySecretary}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      signatories: {
                        ...p.signatories,
                        barangaySecretary: e.target.value,
                      },
                    }))
                  }
                />
              </FormField>
              <FormField label="Barangay Treasurer">
                <TextInput
                  disabled={!allowManage}
                  value={form.signatories.barangayTreasurer}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      signatories: {
                        ...p.signatories,
                        barangayTreasurer: e.target.value,
                      },
                    }))
                  }
                />
              </FormField>
              <FormField label="Lupon Tagapamayapa Chair">
                <TextInput
                  disabled={!allowManage}
                  value={form.signatories.luponChair}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      signatories: {
                        ...p.signatories,
                        luponChair: e.target.value,
                      },
                    }))
                  }
                />
              </FormField>
            </div>
          </SectionCard>
        </form>
      )}

      {tab === 'fees' && (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <SectionCard
            title="Certificate Fee Schedule & Processing Rules"
            subtitle="Standard ordinance fees auto-filled when creating new certificate requests."
            headerAction={
              allowManage && (
                <AppButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  startIcon={<Save className="h-3.5 w-3.5" />}
                >
                  Save Fee Schedule
                </AppButton>
              )
            }
          >
            <div className="space-y-3">
              {CERT_TYPES.map((docType) => {
                const cfg = form.certificateFees[docType];
                return (
                  <div
                    key={docType}
                    className="grid grid-cols-1 items-center gap-3 rounded-lg border border-bis-border bg-bis-surface-subtle/50 p-3 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-5">
                      <p className="text-xs font-semibold text-bis-text">
                        {docType}
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <TextInput
                        type="number"
                        min={0}
                        startAdornment="₱"
                        disabled={!allowManage}
                        value={String(cfg.feePhp)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            certificateFees: {
                              ...p.certificateFees,
                              [docType]: {
                                ...cfg,
                                feePhp: Math.max(0, Number(e.target.value) || 0),
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <TextInput
                        disabled={!allowManage}
                        value={cfg.turnaround}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            certificateFees: {
                              ...p.certificateFees,
                              [docType]: {
                                ...cfg,
                                turnaround: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 space-y-2.5">
                <CheckboxField
                  label="Require Active Blotter Verification Before Clearance Approval"
                  description="Displays automatic Lupon hold warnings inside Certificate review drawers."
                  checked={form.requireBlotterCheckForClearance}
                  disabled={!allowManage}
                  onChange={(checked) =>
                    setForm((p) => ({
                      ...p,
                      requireBlotterCheckForClearance: checked,
                    }))
                  }
                />
                <CheckboxField
                  label="Enable Public Portal Announcement Sync Flag"
                  description="Mark published advisories for public community portal visibility."
                  checked={form.enablePublicPortalSync}
                  disabled={!allowManage}
                  onChange={(checked) =>
                    setForm((p) => ({ ...p, enablePublicPortalSync: checked }))
                  }
                />
              </div>
            </div>
          </SectionCard>
        </form>
      )}

      {tab === 'system' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SectionCard
            title="Appearance & Theme Preference"
            subtitle="Switch seamlessly between Light, Dark, and System color themes."
          >
            <div className="flex items-center justify-between gap-4 rounded-lg border border-bis-border bg-bis-surface-subtle p-4">
              <div>
                <p className="text-sm font-semibold text-bis-text">
                  Color Theme Mode
                </p>
                <p className="text-xs text-bis-muted">
                  Persisted locally per browser without flicker.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </SectionCard>

          <SectionCard
            title="Demonstration Data & Backend Readiness"
            subtitle="Current phase runs on centralized browser-persisted sample datasets."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-bis-text inline-flex items-center gap-1.5">
                    <Settings2 className="h-3.5 w-3.5 text-bis-accent dark:text-[#93B9E6]" />
                    Transport Mode
                  </span>
                  <StatusBadge label="Sample Data Mode" tone="accent" />
                </div>
                <p className="text-bis-muted">
                  Service contracts in <code className="font-mono">src/lib/api/</code>{' '}
                  are structured for future Laravel REST API integration when{' '}
                  <code className="font-mono">NEXT_PUBLIC_USE_MOCK_DATA=false</code>.
                </p>
              </div>

              {allowManage && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-bis-danger/25 bg-bis-danger-soft/40 p-3.5">
                  <div>
                    <p className="text-xs font-semibold text-bis-text">
                      Reset Session Sample Dataset
                    </p>
                    <p className="text-[11px] text-bis-muted">
                      Restore all residents, certificates, blotter, and financial entries to initial demo seed values.
                    </p>
                  </div>
                  <AppButton
                    variant="danger"
                    size="sm"
                    startIcon={<RotateCcw className="h-3.5 w-3.5" />}
                    onClick={() => setResetOpen(true)}
                  >
                    Reset Data
                  </AppButton>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset Demonstration Dataset?"
        description="This clears local browser changes made during this session and restores all seeded barangay records to their initial state."
        confirmLabel="Reset Seed Data"
        tone="danger"
        onConfirm={() => {
          resetDemoDatabase(actorMeta);
          showToast({
            title: 'Demo dataset restored',
            message: 'All modules reverted to clean seed records.',
            tone: 'accent',
          });
          setResetOpen(false);
        }}
      />
    </div>
  );
}
