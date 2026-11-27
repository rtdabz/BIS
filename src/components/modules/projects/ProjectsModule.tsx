'use client';

import * as React from 'react';
import {
  CheckSquare,
  FolderPlus,
  MapPin,
  Pencil,
  Square,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  AppButton,
  AppModal,
  DetailField,
  FilterSelect,
  FormField,
  PageHeader,
  RecordDrawer,
  SearchInput,
  SectionCard,
  SelectInput,
  StatCard,
  StatusBadge,
  TextAreaInput,
  TextInput,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import { formatPhp, formatResidentFullName } from '@/lib/store/bisSelectors';
import type {
  BarangayProjectRecord,
  ProjectCategory,
  ProjectStatus,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const CATEGORIES: ProjectCategory[] = [
  'Infrastructure',
  'Health & Wellness',
  'Livelihood & Skills',
  'Disaster Preparedness',
  'Youth & Education',
  'Environment & Sanitation',
];

const STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  Planned: 'neutral',
  Ongoing: 'accent',
  'On Hold': 'warning',
  Completed: 'success',
};

export function ProjectsModule() {
  const { db, createProject, updateProject } = useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('projects');

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | ProjectStatus>('All');
  const [categoryFilter, setCategoryFilter] = React.useState('All');

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [beneficiaryToAdd, setBeneficiaryToAdd] = React.useState('');

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState<ProjectCategory>('Infrastructure');
  const [leadCommittee, setLeadCommittee] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [startDate, setStartDate] = React.useState('2026-11-27');
  const [targetEndDate, setTargetEndDate] = React.useState('2027-02-28');
  const [allocatedBudgetPhp, setAllocatedBudgetPhp] = React.useState('100000');
  const [utilizedBudgetPhp, setUtilizedBudgetPhp] = React.useState('0');
  const [progressPercent, setProgressPercent] = React.useState('0');
  const [status, setStatus] = React.useState<ProjectStatus>('Planned');
  const [beneficiarySummary, setBeneficiarySummary] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const totalAllocated = db.projects.reduce(
    (s, p) => s + p.allocatedBudgetPhp,
    0
  );
  const totalUtilized = db.projects.reduce(
    (s, p) => s + p.utilizedBudgetPhp,
    0
  );

  const stats: StatMetric[] = [
    {
      id: 'prj-total',
      label: 'Projects & Programs',
      value: db.projects.length,
      formattedValue: String(db.projects.length),
      icon: 'FolderKanban',
      changeLabel: `${db.projects.filter((p) => p.status === 'Ongoing').length} active`,
      changeContext: 'FY 2026 implementation plan',
      trend: 'up',
      tone: 'accent',
      href: '/projects',
    },
    {
      id: 'prj-completed',
      label: 'Completed Initiatives',
      value: db.projects.filter((p) => p.status === 'Completed').length,
      formattedValue: String(
        db.projects.filter((p) => p.status === 'Completed').length
      ),
      icon: 'CheckCircle2',
      changeLabel: 'Delivered',
      changeContext: 'verified completed milestones',
      trend: 'up',
      tone: 'success',
      href: '/projects',
    },
    {
      id: 'prj-budget',
      label: 'Allocated Budget',
      value: totalAllocated,
      formattedValue: formatPhp(totalAllocated),
      icon: 'Wallet',
      changeLabel: `${totalAllocated > 0 ? Math.round((totalUtilized / totalAllocated) * 100) : 0}% utilized`,
      changeContext: `${formatPhp(totalUtilized)} disbursed`,
      trend: 'neutral',
      tone: 'accent',
      href: '/financial',
    },
    {
      id: 'prj-beneficiaries',
      label: 'Tagged Resident Beneficiaries',
      value: db.projects.reduce(
        (s, p) => s + p.beneficiaryResidentIds.length,
        0
      ),
      formattedValue: String(
        db.projects.reduce((s, p) => s + p.beneficiaryResidentIds.length, 0)
      ),
      icon: 'Users',
      changeLabel: 'Verified',
      changeContext: 'enrolled participants',
      trend: 'up',
      tone: 'accent',
      href: '/projects',
    },
  ];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.projects.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.projectCode.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.leadCommittee.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, db.projects, search, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Infrastructure');
    setLeadCommittee('Committee on Public Works & Infrastructure');
    setLocation('');
    setStartDate('2026-12-01');
    setTargetEndDate('2027-02-28');
    setAllocatedBudgetPhp('100000');
    setUtilizedBudgetPhp('0');
    setProgressPercent('10');
    setStatus('Planned');
    setBeneficiarySummary('');
    setDescription('');
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (prj: BarangayProjectRecord) => {
    setEditingId(prj.id);
    setTitle(prj.title);
    setCategory(prj.category);
    setLeadCommittee(prj.leadCommittee);
    setLocation(prj.location);
    setStartDate(prj.startDate);
    setTargetEndDate(prj.targetEndDate);
    setAllocatedBudgetPhp(String(prj.allocatedBudgetPhp));
    setUtilizedBudgetPhp(String(prj.utilizedBudgetPhp));
    setProgressPercent(String(prj.progressPercent));
    setStatus(prj.status);
    setBeneficiarySummary(prj.beneficiarySummary);
    setDescription(prj.description);
    setErrors({});
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Project title is required.';
    if (!location.trim()) errs.location = 'Location is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: title.trim(),
      category,
      leadCommittee: leadCommittee.trim() || 'Sangguniang Barangay',
      location: location.trim(),
      startDate,
      targetEndDate,
      allocatedBudgetPhp: Math.max(0, Number(allocatedBudgetPhp) || 0),
      utilizedBudgetPhp: Math.max(0, Number(utilizedBudgetPhp) || 0),
      progressPercent: Math.min(100, Math.max(0, Number(progressPercent) || 0)),
      status,
      beneficiarySummary: beneficiarySummary.trim() || 'Barangay residents',
      description: description.trim(),
    };

    if (editingId) {
      updateProject(editingId, payload, actorMeta);
      showToast({
        title: 'Project updated',
        message: payload.title,
        tone: 'success',
      });
    } else {
      const created = createProject(
        {
          ...payload,
          beneficiaryResidentIds: [],
          milestones: [
            {
              id: `ms-${Date.now()}`,
              title: 'Initial kick-off & site/beneficiary validation',
              targetDate: startDate,
              completed: false,
            },
          ],
        },
        actorMeta
      );
      showToast({
        title: 'Project created',
        message: `${created.projectCode} — ${created.title}`,
        tone: 'success',
      });
    }
    setFormOpen(false);
  };

  const selected = selectedId
    ? db.projects.find((p) => p.id === selectedId) ?? null
    : null;

  const toggleMilestone = (milestoneId: string) => {
    if (!selected || !allowManage) return;
    const nextMilestones = selected.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = nextMilestones.filter((m) => m.completed).length;
    const computedPct =
      nextMilestones.length > 0
        ? Math.round((completedCount / nextMilestones.length) * 100)
        : selected.progressPercent;

    updateProject(
      selected.id,
      {
        milestones: nextMilestones,
        progressPercent: computedPct,
        status: computedPct === 100 ? 'Completed' : selected.status,
      },
      actorMeta
    );
    showToast({
      title: 'Milestone updated',
      message: `Project progress updated to ${computedPct}%.`,
      tone: 'accent',
    });
  };

  const handleAddBeneficiary = () => {
    if (!selected || !beneficiaryToAdd) return;
    if (selected.beneficiaryResidentIds.includes(beneficiaryToAdd)) return;
    updateProject(
      selected.id,
      {
        beneficiaryResidentIds: [
          ...selected.beneficiaryResidentIds,
          beneficiaryToAdd,
        ],
      },
      actorMeta
    );
    setBeneficiaryToAdd('');
    showToast({
      title: 'Beneficiary added',
      message: `Assigned to ${selected.projectCode}.`,
      tone: 'success',
    });
  };

  const handleRemoveBeneficiary = (resId: string) => {
    if (!selected) return;
    updateProject(
      selected.id,
      {
        beneficiaryResidentIds: selected.beneficiaryResidentIds.filter(
          (id) => id !== resId
        ),
      },
      actorMeta
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Projects & Community Programs"
        subtitle="Monitor barangay infrastructure builds, social welfare initiatives, budgets, milestones, and beneficiaries."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<FolderPlus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Add Project / Program
            </AppButton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Filter Bar */}
      <SectionCard
        title="Project & Program Directory"
        subtitle="Click any initiative to monitor milestones, update budget utilization, or manage beneficiaries."
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search code, title, location..."
              aria-label="Search projects"
              containerClassName="w-52 sm:w-64"
            />
            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'All', label: 'All Categories' },
                ...CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-bis-border pb-3">
          <div className="flex flex-wrap items-center gap-1">
            {(['All', 'Ongoing', 'Planned', 'On Hold', 'Completed'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === tab
                      ? 'bg-bis-accent text-bis-accent-contrast shadow-[var(--bis-shadow-sm)]'
                      : 'text-bis-muted hover:bg-bis-surface-subtle hover:text-bis-text'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
          <span className="text-xs text-bis-muted">
            Showing {filtered.length} initiatives
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((prj) => {
            const budgetPct =
              prj.allocatedBudgetPhp > 0
                ? Math.min(
                    100,
                    Math.round(
                      (prj.utilizedBudgetPhp / prj.allocatedBudgetPhp) * 100
                    )
                  )
                : 0;
            const completedMs = prj.milestones.filter((m) => m.completed).length;

            return (
              <div
                key={prj.id}
                onClick={() => setSelectedId(prj.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(prj.id);
                  }
                }}
                className="group cursor-pointer rounded-[10px] border border-bis-border bg-bis-surface-subtle/40 p-4 transition-colors hover:border-bis-accent/50 hover:bg-bis-surface-subtle"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-bis-accent dark:text-[#93B9E6]">
                        {prj.projectCode}
                      </span>
                      <span className="text-[11px] text-bis-muted">
                        • {prj.category}
                      </span>
                    </div>
                    <h3 className="mt-1 text-[15px] font-semibold text-bis-text group-hover:text-bis-accent dark:group-hover:text-[#93B9E6]">
                      {prj.title}
                    </h3>
                  </div>
                  <StatusBadge
                    label={prj.status}
                    tone={STATUS_TONE[prj.status]}
                  />
                </div>

                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-bis-muted">
                  {prj.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-bis-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {prj.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {prj.beneficiaryResidentIds.length} tagged ({prj.beneficiarySummary})
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-bis-border/70 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-bis-muted">
                      Progress ({completedMs}/{prj.milestones.length} milestones)
                    </span>
                    <span className="font-mono font-semibold text-bis-text">
                      {prj.progressPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-bis-border/60">
                    <div
                      className="h-full rounded-full bg-bis-accent transition-all"
                      style={{ width: `${prj.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-bis-muted pt-1">
                    <span>
                      Budget: {formatPhp(prj.utilizedBudgetPhp)} /{' '}
                      {formatPhp(prj.allocatedBudgetPhp)} ({budgetPct}%)
                    </span>
                    <span className="font-mono">
                      Due {prj.targetEndDate}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Project Monitoring & Beneficiaries Drawer */}
      <RecordDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        eyebrow={selected?.projectCode}
        title={selected?.title ?? ''}
        subtitle={
          selected ? `${selected.category} • ${selected.leadCommittee}` : undefined
        }
        badge={
          selected && (
            <StatusBadge
              label={selected.status}
              tone={STATUS_TONE[selected.status]}
            />
          )
        }
        footer={
          selected && (
            <>
              <AppButton variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </AppButton>
              {allowManage && (
                <AppButton
                  variant="primary"
                  startIcon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => openEditModal(selected)}
                >
                  Edit Project Details
                </AppButton>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField label="Location" value={selected.location} />
              <DetailField
                label="Schedule"
                value={`${selected.startDate} → ${selected.targetEndDate}`}
                mono
              />
              <DetailField
                label="Allocated Budget"
                value={formatPhp(selected.allocatedBudgetPhp)}
                mono
              />
              <DetailField
                label="Utilized Budget"
                value={formatPhp(selected.utilizedBudgetPhp)}
                mono
              />
            </dl>

            <div className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3.5 text-xs">
              <p className="font-semibold text-bis-text">Scope &amp; Objectives</p>
              <p className="mt-1 leading-relaxed text-bis-muted">
                {selected.description}
              </p>
            </div>

            {/* Milestones Checklist */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Implementation Milestones ({selected.progressPercent}%)
              </h3>
              <div className="space-y-2">
                {selected.milestones.map((ms) => (
                  <button
                    key={ms.id}
                    type="button"
                    disabled={!allowManage}
                    onClick={() => toggleMilestone(ms.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-bis-border bg-bis-surface-subtle/60 px-3 py-2.5 text-left text-xs transition-colors hover:bg-bis-surface-subtle disabled:cursor-default"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {ms.completed ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-bis-accent dark:text-[#93B9E6]" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-bis-muted" />
                      )}
                      <span
                        className={
                          ms.completed
                            ? 'line-through text-bis-muted'
                            : 'font-medium text-bis-text'
                        }
                      >
                        {ms.title}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[10.5px] text-bis-muted">
                      {ms.targetDate}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Beneficiary Roster */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Tagged Beneficiaries ({selected.beneficiaryResidentIds.length})
              </h3>
              <p className="mb-2 text-xs text-bis-muted">
                Target scope: {selected.beneficiarySummary}
              </p>
              <div className="space-y-1.5">
                {selected.beneficiaryResidentIds.map((rId) => {
                  const res = db.residents.find((r) => r.id === rId);
                  return (
                    <div
                      key={rId}
                      className="flex items-center justify-between gap-2 rounded-lg border border-bis-border px-3 py-2 text-xs"
                    >
                      <div>
                        <p className="font-medium text-bis-text">
                          {res ? formatResidentFullName(res) : rId}
                        </p>
                        {res && (
                          <p className="text-[11px] text-bis-muted">
                            {res.residentCode} • {res.purok}
                          </p>
                        )}
                      </div>
                      {allowManage && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBeneficiary(rId)}
                          aria-label="Remove beneficiary"
                          className="rounded p-1 text-bis-danger hover:bg-bis-danger-soft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {allowManage && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1">
                    <SelectInput
                      value={beneficiaryToAdd}
                      onChange={(e) => setBeneficiaryToAdd(e.target.value)}
                      placeholder="Add resident beneficiary..."
                      options={db.residents
                        .filter(
                          (r) =>
                            r.status === 'Active' &&
                            !selected.beneficiaryResidentIds.includes(r.id)
                        )
                        .map((r) => ({
                          value: r.id,
                          label: `${formatResidentFullName(r)} (${r.purok})`,
                        }))}
                    />
                  </div>
                  <AppButton
                    variant="outline"
                    size="sm"
                    disabled={!beneficiaryToAdd}
                    startIcon={<UserPlus className="h-3.5 w-3.5" />}
                    onClick={handleAddBeneficiary}
                  >
                    Add
                  </AppButton>
                </div>
              )}
            </div>
          </div>
        )}
      </RecordDrawer>

      {/* Create / Edit Project Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Project / Program' : 'Create Project / Program'}
        eyebrow="Projects & Programs"
        maxWidth="md"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-prj-form" variant="primary">
              {editingId ? 'Save Changes' : 'Create Project'}
            </AppButton>
          </>
        }
      >
        <form id="bis-prj-form" onSubmit={handleSave} className="space-y-4">
          <FormField label="Project / Program Title" required error={errors.title}>
            <TextInput
              value={title}
              hasError={Boolean(errors.title)}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Category">
              <SelectInput
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
            <FormField label="Status">
              <SelectInput
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                options={[
                  { value: 'Planned', label: 'Planned' },
                  { value: 'Ongoing', label: 'Ongoing' },
                  { value: 'On Hold', label: 'On Hold' },
                  { value: 'Completed', label: 'Completed' },
                ]}
              />
            </FormField>
            <FormField label="Progress (%)">
              <TextInput
                type="number"
                min={0}
                max={100}
                value={progressPercent}
                onChange={(e) => setProgressPercent(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Lead Committee">
              <TextInput
                value={leadCommittee}
                onChange={(e) => setLeadCommittee(e.target.value)}
              />
            </FormField>
            <FormField label="Location" required error={errors.location}>
              <TextInput
                value={location}
                hasError={Boolean(errors.location)}
                onChange={(e) => setLocation(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <FormField label="Start Date">
              <TextInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="Target End">
              <TextInput
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
              />
            </FormField>
            <FormField label="Allocated (₱)">
              <TextInput
                type="number"
                min={0}
                value={allocatedBudgetPhp}
                onChange={(e) => setAllocatedBudgetPhp(e.target.value)}
              />
            </FormField>
            <FormField label="Utilized (₱)">
              <TextInput
                type="number"
                min={0}
                value={utilizedBudgetPhp}
                onChange={(e) => setUtilizedBudgetPhp(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Beneficiary Target Summary">
            <TextInput
              value={beneficiarySummary}
              onChange={(e) => setBeneficiarySummary(e.target.value)}
              placeholder="e.g., 250 households in Purok 3 & 4"
            />
          </FormField>

          <FormField label="Description" required error={errors.description}>
            <TextAreaInput
              rows={3}
              value={description}
              hasError={Boolean(errors.description)}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
        </form>
      </AppModal>
    </div>
  );
}
