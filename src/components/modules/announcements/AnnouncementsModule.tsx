'use client';

import * as React from 'react';
import {
  Archive,
  Eye,
  Paperclip,
  Pencil,
  Plus,
  Send,
} from 'lucide-react';
import {
  AppButton,
  AppModal,
  CheckboxField,
  ConfirmDialog,
  DataTable,
  FilterSelect,
  FormField,
  PageHeader,
  PaginationBar,
  SearchInput,
  SectionCard,
  SelectInput,
  StatCard,
  StatusBadge,
  TextAreaInput,
  TextInput,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBisStore } from '@/lib/store/BisStoreContext';
import type {
  AnnouncementAttachment,
  AnnouncementCategory,
  AnnouncementRecord,
  AnnouncementStatus,
} from '@/types/bis';
import type { StatMetric, StatusTone } from '@/types/dashboard';

const CATEGORIES: AnnouncementCategory[] = [
  'Public Advisory',
  'Health Advisory',
  'Emergency Updates',
  'Community News',
  'Public Notice',
  'General Announcement',
];

const STATUS_TONE: Record<AnnouncementStatus, StatusTone> = {
  Published: 'accent',
  Scheduled: 'warning',
  Draft: 'neutral',
  Archived: 'neutral',
};

const PRIORITY_TONE: Record<AnnouncementRecord['priority'], StatusTone> = {
  Urgent: 'danger',
  Featured: 'warning',
  Priority: 'accent',
  Standard: 'neutral',
};

export function AnnouncementsModule() {
  const {
    db,
    createAnnouncement,
    updateAnnouncement,
    transitionAnnouncementStatus,
  } = useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('announcements');

  const [statusTab, setStatusTab] = React.useState<'All' | AnnouncementStatus>('All');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [previewItem, setPreviewItem] =
    React.useState<AnnouncementRecord | null>(null);
  const [archiveTarget, setArchiveTarget] =
    React.useState<AnnouncementRecord | null>(null);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [category, setCategory] =
    React.useState<AnnouncementCategory>('Public Advisory');
  const [priority, setPriority] =
    React.useState<AnnouncementRecord['priority']>('Standard');
  const [status, setStatus] = React.useState<AnnouncementStatus>('Published');
  const [authorOffice, setAuthorOffice] = React.useState(
    'Office of the Barangay Secretary'
  );
  const [publishedDate, setPublishedDate] = React.useState('2026-11-27');
  const [expiresAt, setExpiresAt] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [content, setContent] = React.useState('');
  const [showOnPublicPortal, setShowOnPublicPortal] = React.useState(true);
  const [attachmentName, setAttachmentName] = React.useState('');
  const [attachments, setAttachments] = React.useState<AnnouncementAttachment[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const stats: StatMetric[] = [
    {
      id: 'ann-pub',
      label: 'Published Advisories',
      value: db.announcements.filter((a) => a.status === 'Published').length,
      formattedValue: String(
        db.announcements.filter((a) => a.status === 'Published').length
      ),
      icon: 'Megaphone',
      changeLabel: 'Live',
      changeContext: 'active public notices',
      trend: 'up',
      tone: 'success',
      href: '/announcements',
    },
    {
      id: 'ann-sched',
      label: 'Scheduled / Drafts',
      value: db.announcements.filter(
        (a) => a.status === 'Scheduled' || a.status === 'Draft'
      ).length,
      formattedValue: String(
        db.announcements.filter(
          (a) => a.status === 'Scheduled' || a.status === 'Draft'
        ).length
      ),
      icon: 'CalendarClock',
      changeLabel: 'Queued',
      changeContext: 'upcoming releases',
      trend: 'neutral',
      tone: 'warning',
      href: '/announcements',
    },
    {
      id: 'ann-portal',
      label: 'Shown on Community Portal',
      value: db.announcements.filter((a) => a.showOnPublicPortal).length,
      formattedValue: String(
        db.announcements.filter((a) => a.showOnPublicPortal).length
      ),
      icon: 'CheckCircle2',
      changeLabel: 'Portal sync',
      changeContext: 'visible to citizens',
      trend: 'up',
      tone: 'accent',
      href: '/',
    },
    {
      id: 'ann-arch',
      label: 'Archived Bulletins',
      value: db.announcements.filter((a) => a.status === 'Archived').length,
      formattedValue: String(
        db.announcements.filter((a) => a.status === 'Archived').length
      ),
      icon: 'History',
      changeLabel: 'Retained',
      changeContext: 'historical advisories',
      trend: 'neutral',
      tone: 'accent',
      href: '/announcements',
    },
  ];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.announcements.filter((a) => {
      if (statusTab !== 'All' && a.status !== statusTab) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        a.code.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.authorOffice.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, db.announcements, search, statusTab]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Public Advisory');
    setPriority('Standard');
    setStatus('Published');
    setAuthorOffice('Office of the Barangay Secretary');
    setPublishedDate('2026-11-27');
    setExpiresAt('');
    setSummary('');
    setContent('');
    setShowOnPublicPortal(true);
    setAttachments([]);
    setAttachmentName('');
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (ann: AnnouncementRecord) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setCategory(ann.category);
    setPriority(ann.priority);
    setStatus(ann.status);
    setAuthorOffice(ann.authorOffice);
    setPublishedDate(ann.publishedDate);
    setExpiresAt(ann.expiresAt ?? '');
    setSummary(ann.summary);
    setContent(ann.content);
    setShowOnPublicPortal(ann.showOnPublicPortal);
    setAttachments([...ann.attachments]);
    setAttachmentName('');
    setErrors({});
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!summary.trim()) errs.summary = 'Short summary is required.';
    if (!content.trim()) errs.content = 'Announcement body is required.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: title.trim(),
      category,
      priority,
      status,
      authorOffice: authorOffice.trim() || 'Office of the Barangay Secretary',
      publishedDate,
      expiresAt: expiresAt || undefined,
      summary: summary.trim(),
      content: content.trim(),
      showOnPublicPortal,
      attachments,
    };

    if (editingId) {
      updateAnnouncement(editingId, payload, actorMeta);
      showToast({
        title: 'Announcement updated',
        message: payload.title,
        tone: 'success',
      });
    } else {
      const created = createAnnouncement(payload, actorMeta);
      showToast({
        title: `Announcement ${created.status.toLowerCase()}`,
        message: `${created.code} — ${created.title}`,
        tone: 'success',
      });
    }
    setFormOpen(false);
  };

  const columns: DataTableColumn<AnnouncementRecord>[] = [
    {
      key: 'code',
      header: 'Code',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.code}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Advisory & Office',
      render: (row) => (
        <div className="min-w-[210px] max-w-[320px]">
          <p className="truncate font-medium text-bis-text">{row.title}</p>
          <p className="truncate text-[11px] text-bis-muted">
            {row.category} • {row.authorOffice}
          </p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <StatusBadge
          label={row.priority}
          tone={PRIORITY_TONE[row.priority]}
          dot={false}
        />
      ),
    },
    {
      key: 'publishedDate',
      header: 'Pub Date / Portal',
      className: 'whitespace-nowrap text-xs',
      render: (row) => (
        <div>
          <p className="font-mono text-bis-text">{row.publishedDate}</p>
          <p className="text-[11px] text-bis-muted">
            {row.showOnPublicPortal ? 'Visible on Portal' : 'Internal Only'}
            {row.attachments.length > 0
              ? ` • ${row.attachments.length} file(s)`
              : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge label={row.status} tone={STATUS_TONE[row.status]} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div
          className="inline-flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setPreviewItem(row)}
            aria-label={`Preview ${row.code}`}
            className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-text hover:bg-bis-surface-subtle"
          >
            <Eye className="h-3 w-3" />
            <span>Preview</span>
          </button>

          {allowManage && (
            <>
              {(row.status === 'Draft' || row.status === 'Scheduled') && (
                <button
                  type="button"
                  onClick={() => {
                    transitionAnnouncementStatus(
                      row.id,
                      'Published',
                      actorMeta
                    );
                    showToast({
                      title: `${row.code} published`,
                      tone: 'success',
                    });
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-bis-accent px-2 py-1 text-xs font-medium text-bis-accent-contrast hover:bg-bis-accent-hover"
                >
                  <Send className="h-3 w-3" />
                  <span>Publish</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => openEditModal(row)}
                aria-label={`Edit ${row.code}`}
                className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {row.status !== 'Archived' && (
                <button
                  type="button"
                  onClick={() => setArchiveTarget(row)}
                  aria-label={`Archive ${row.code}`}
                  className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-danger hover:bg-bis-danger-soft"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Announcements & Public Bulletins"
        subtitle="Draft, schedule, publish, and archive official barangay advisories and supporting attachments."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Create Announcement
            </AppButton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </div>

      <SectionCard
        title="Advisory & Bulletin Manager"
        subtitle="Click any announcement to inspect full text and attached documents."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search title, code, office..."
              aria-label="Search announcements"
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bis-border bg-bis-surface-subtle px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {(['All', 'Published', 'Scheduled', 'Draft', 'Archived'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusTab === tab
                      ? 'border border-bis-border bg-bis-surface text-bis-text shadow-[var(--bis-shadow-sm)]'
                      : 'text-bis-muted hover:text-bis-text'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
          <span className="text-xs text-bis-muted">
            {filtered.length} bulletins
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={paginated}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setPreviewItem(r)}
          emptyTitle="No announcements match this filter"
          emptyDescription="Create a new announcement or switch status tabs."
          footer={
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="announcements"
            />
          }
        />
      </SectionCard>

      {/* Preview Modal */}
      <AppModal
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title ?? ''}
        eyebrow={
          previewItem
            ? `${previewItem.code} • ${previewItem.category}`
            : undefined
        }
        badge={
          previewItem && (
            <StatusBadge
              label={previewItem.status}
              tone={STATUS_TONE[previewItem.status]}
            />
          )
        }
        maxWidth="sm"
        footer={
          <AppButton variant="outline" onClick={() => setPreviewItem(null)}>
            Close
          </AppButton>
        }
      >
        {previewItem && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-bis-muted">
              <span>{previewItem.authorOffice}</span>
              <span>•</span>
              <span className="font-mono">{previewItem.publishedDate}</span>
              {previewItem.expiresAt && (
                <>
                  <span>•</span>
                  <span>Expires {previewItem.expiresAt}</span>
                </>
              )}
            </div>
            <p className="rounded-lg border border-bis-border bg-bis-surface-subtle p-3 text-xs font-medium text-bis-text">
              {previewItem.summary}
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-bis-text">
              {previewItem.content}
            </p>

            {previewItem.attachments.length > 0 && (
              <div className="space-y-1.5 border-t border-bis-border pt-3">
                <p className="text-xs font-semibold text-bis-text">
                  Supporting Attachments
                </p>
                {previewItem.attachments.map((att) => (
                  <div
                    key={att.name}
                    className="flex items-center justify-between rounded-lg border border-bis-border bg-bis-surface-subtle px-3 py-2 text-xs"
                  >
                    <span className="inline-flex items-center gap-1.5 font-medium text-bis-text">
                      <Paperclip className="h-3.5 w-3.5 text-bis-muted" />
                      {att.name}
                    </span>
                    <span className="font-mono text-[11px] text-bis-muted">
                      {att.type} • {att.sizeLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </AppModal>

      {/* Create / Edit Announcement Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Announcement' : 'Create Barangay Announcement'}
        eyebrow="Announcements"
        maxWidth="md"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-ann-form" variant="primary">
              {editingId ? 'Save Changes' : 'Save Announcement'}
            </AppButton>
          </>
        }
      >
        <form id="bis-ann-form" onSubmit={handleSave} className="space-y-4">
          <FormField label="Headline / Title" required error={errors.title}>
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
                onChange={(e) =>
                  setCategory(e.target.value as AnnouncementCategory)
                }
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
            <FormField label="Priority">
              <SelectInput
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as AnnouncementRecord['priority'])
                }
                options={[
                  { value: 'Standard', label: 'Standard' },
                  { value: 'Priority', label: 'Priority' },
                  { value: 'Featured', label: 'Featured' },
                  { value: 'Urgent', label: 'Urgent' },
                ]}
              />
            </FormField>
            <FormField label="Status">
              <SelectInput
                value={status}
                onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
                options={[
                  { value: 'Published', label: 'Published' },
                  { value: 'Scheduled', label: 'Scheduled' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Archived', label: 'Archived' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Issuing Office">
              <TextInput
                value={authorOffice}
                onChange={(e) => setAuthorOffice(e.target.value)}
              />
            </FormField>
            <FormField label="Publication Date">
              <TextInput
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
              />
            </FormField>
            <FormField label="Expires At (Optional)">
              <TextInput
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Summary" required error={errors.summary}>
            <TextInput
              value={summary}
              hasError={Boolean(errors.summary)}
              onChange={(e) => setSummary(e.target.value)}
            />
          </FormField>

          <FormField label="Full Content" required error={errors.content}>
            <TextAreaInput
              rows={4}
              value={content}
              hasError={Boolean(errors.content)}
              onChange={(e) => setContent(e.target.value)}
            />
          </FormField>

          <div>
            <p className="mb-1.5 text-xs font-medium text-bis-text">
              Supporting Attachments (Metadata)
            </p>
            <div className="flex gap-2">
              <TextInput
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="e.g., Barangay-Resolution-2026-14.pdf"
              />
              <AppButton
                type="button"
                variant="outline"
                onClick={() => {
                  if (!attachmentName.trim()) return;
                  setAttachments((prev) => [
                    ...prev,
                    {
                      name: attachmentName.trim(),
                      sizeLabel: '240 KB',
                      type: 'PDF',
                    },
                  ]);
                  setAttachmentName('');
                }}
              >
                Attach
              </AppButton>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {attachments.map((att) => (
                  <span
                    key={att.name}
                    className="inline-flex items-center gap-1.5 rounded-md border border-bis-border bg-bis-surface-subtle px-2 py-1 text-xs"
                  >
                    <span>{att.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((x) => x.name !== att.name)
                        )
                      }
                      className="text-bis-danger hover:underline"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <CheckboxField
            id="ann-portal-sync"
            label="Show on Public Community Portal"
            description="Display this bulletin on the citizen-facing landing page when published."
            checked={showOnPublicPortal}
            onChange={setShowOnPublicPortal}
          />
        </form>
      </AppModal>

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive Announcement"
        description={
          archiveTarget
            ? `Archive "${archiveTarget.title}" (${archiveTarget.code})? It will be hidden from the public portal.`
            : ''
        }
        confirmLabel="Archive"
        tone="warning"
        onConfirm={() => {
          if (!archiveTarget) return;
          transitionAnnouncementStatus(archiveTarget.id, 'Archived', actorMeta);
          showToast({
            title: `${archiveTarget.code} archived`,
            tone: 'accent',
          });
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
