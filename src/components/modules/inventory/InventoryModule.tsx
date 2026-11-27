'use client';

import * as React from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  Eye,
  PackagePlus,
  Pencil,
} from 'lucide-react';
import {
  AppButton,
  AppModal,
  DataTable,
  DetailField,
  FilterSelect,
  FormField,
  PageHeader,
  PaginationBar,
  RecordDrawer,
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
import { formatPhp } from '@/lib/store/bisSelectors';
import type {
  InventoryCategory,
  InventoryItemRecord,
  InventoryMovementRecord,
} from '@/types/bis';
import type { StatMetric } from '@/types/dashboard';

const CATEGORIES: InventoryCategory[] = [
  'Office Supplies',
  'DRRM & Rescue',
  'Medical & Health',
  'IT & Identification',
  'Maintenance & Sanitation',
];

export function InventoryModule() {
  const { db, createInventoryItem, updateInventoryItem, recordStockMovement } =
    useBisStore();
  const { canManage, actorMeta } = useAuth();
  const { showToast } = useToast();
  const allowManage = canManage('inventory');

  const [activeTab, setActiveTab] = React.useState<'items' | 'movements'>('items');
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState<InventoryCategory>('Office Supplies');
  const [unit, setUnit] = React.useState('pcs');
  const [quantityOnHand, setQuantityOnHand] = React.useState('10');
  const [reorderLevel, setReorderLevel] = React.useState('5');
  const [unitCostPhp, setUnitCostPhp] = React.useState('100');
  const [storageLocation, setStorageLocation] = React.useState('');
  const [custodian, setCustodian] = React.useState('');
  const [condition, setCondition] =
    React.useState<InventoryItemRecord['condition']>('Good');
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Stock Movement Modal
  const [moveTarget, setMoveTarget] = React.useState<InventoryItemRecord | null>(
    null
  );
  const [moveType, setMoveType] =
    React.useState<InventoryMovementRecord['type']>('Stock In');
  const [moveQty, setMoveQty] = React.useState('10');
  const [moveRef, setMoveRef] = React.useState('');
  const [moveRemarks, setMoveRemarks] = React.useState('');

  const lowStockItems = React.useMemo(
    () =>
      db.inventoryItems.filter((i) => i.quantityOnHand <= i.reorderLevel),
    [db.inventoryItems]
  );

  const totalValue = React.useMemo(
    () =>
      db.inventoryItems.reduce(
        (sum, i) => sum + i.quantityOnHand * i.unitCostPhp,
        0
      ),
    [db.inventoryItems]
  );

  const stats: StatMetric[] = [
    {
      id: 'inv-skus',
      label: 'Registered Stock Items',
      value: db.inventoryItems.length,
      formattedValue: String(db.inventoryItems.length),
      icon: 'Package',
      changeLabel: `${CATEGORIES.length} categories`,
      changeContext: 'barangay custodian registry',
      trend: 'neutral',
      tone: 'accent',
      href: '/inventory',
    },
    {
      id: 'inv-low',
      label: 'Low-Stock Alerts',
      value: lowStockItems.length,
      formattedValue: String(lowStockItems.length),
      icon: 'AlertTriangle',
      changeLabel: lowStockItems.length > 0 ? 'Reorder needed' : 'Healthy',
      changeContext: 'at or below threshold',
      trend: 'neutral',
      tone: lowStockItems.length > 0 ? 'warning' : 'success',
      href: '/inventory',
    },
    {
      id: 'inv-value',
      label: 'Estimated Asset Value',
      value: totalValue,
      formattedValue: formatPhp(totalValue),
      icon: 'Wallet',
      changeLabel: 'On hand',
      changeContext: 'supplies & DRRM assets',
      trend: 'up',
      tone: 'accent',
      href: '/inventory',
    },
    {
      id: 'inv-moves',
      label: 'Logged Stock Movements',
      value: db.inventoryMovements.length,
      formattedValue: String(db.inventoryMovements.length),
      icon: 'History',
      changeLabel: 'Tracked',
      changeContext: 'receipts, issuances & audits',
      trend: 'up',
      tone: 'success',
      href: '/inventory',
    },
  ];

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.inventoryItems.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }
      if (lowStockOnly && item.quantityOnHand > item.reorderLevel) {
        return false;
      }
      if (!q) return true;
      return (
        item.itemCode.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.storageLocation.toLowerCase().includes(q) ||
        item.custodian.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, db.inventoryItems, lowStockOnly, search]);

  const filteredMovements = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.inventoryMovements.filter((m) => {
      if (!q) return true;
      return (
        m.itemName.toLowerCase().includes(q) ||
        m.reference.toLowerCase().includes(q) ||
        m.actor.toLowerCase().includes(q) ||
        m.remarks.toLowerCase().includes(q)
      );
    });
  }, [db.inventoryMovements, search]);

  const safeItemsPage = Math.min(page, Math.max(1, Math.ceil(filteredItems.length / pageSize)));
  const paginatedItems = React.useMemo(() => {
    const start = (safeItemsPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, safeItemsPage, pageSize]);

  const safeMovementsPage = Math.min(page, Math.max(1, Math.ceil(filteredMovements.length / pageSize)));
  const paginatedMovements = React.useMemo(() => {
    const start = (safeMovementsPage - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, safeMovementsPage, pageSize]);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setCategory('Office Supplies');
    setUnit('pcs');
    setQuantityOnHand('20');
    setReorderLevel('5');
    setUnitCostPhp('150');
    setStorageLocation('Records Room');
    setCustodian(actorMeta.name);
    setCondition('Good');
    setNotes('');
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (item: InventoryItemRecord) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setUnit(item.unit);
    setQuantityOnHand(String(item.quantityOnHand));
    setReorderLevel(String(item.reorderLevel));
    setUnitCostPhp(String(item.unitCostPhp));
    setStorageLocation(item.storageLocation);
    setCustodian(item.custodian);
    setCondition(item.condition);
    setNotes(item.notes ?? '');
    setErrors({});
    setFormOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Item name is required.';
    if (!storageLocation.trim()) errs.storageLocation = 'Location is required.';
    if (!custodian.trim()) errs.custodian = 'Custodian is required.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      unit: unit.trim() || 'pcs',
      quantityOnHand: Math.max(0, Number(quantityOnHand) || 0),
      reorderLevel: Math.max(0, Number(reorderLevel) || 0),
      unitCostPhp: Math.max(0, Number(unitCostPhp) || 0),
      storageLocation: storageLocation.trim(),
      custodian: custodian.trim(),
      condition,
      notes: notes.trim() || undefined,
    };

    if (editingId) {
      updateInventoryItem(editingId, payload, actorMeta);
      showToast({
        title: 'Inventory item updated',
        message: payload.name,
        tone: 'success',
      });
    } else {
      const created = createInventoryItem(payload, actorMeta);
      showToast({
        title: 'Inventory item added',
        message: `${created.itemCode} — ${created.name}`,
        tone: 'success',
      });
    }
    setFormOpen(false);
  };

  const handleOpenMovement = (
    item: InventoryItemRecord,
    defaultType: InventoryMovementRecord['type'] = 'Stock In'
  ) => {
    setMoveTarget(item);
    setMoveType(defaultType);
    setMoveQty(defaultType === 'Adjustment' ? String(item.quantityOnHand) : '10');
    setMoveRef(
      defaultType === 'Stock In'
        ? 'PO-2026-1127'
        : defaultType === 'Stock Out'
          ? 'ISS-2026-1127'
          : 'ADJ-2026-1127'
    );
    setMoveRemarks('');
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveTarget) return;
    const qty = Math.max(0, Number(moveQty) || 0);
    if (qty <= 0 && moveType !== 'Adjustment') return;
    recordStockMovement(
      moveTarget.id,
      moveType,
      qty,
      moveRef.trim() || 'MANUAL',
      moveRemarks.trim() || `${moveType} logged`,
      actorMeta
    );
    showToast({
      title: `Stock movement recorded`,
      message: `${moveType} (${qty} ${moveTarget.unit}) on ${moveTarget.name}`,
      tone: 'success',
    });
    setMoveTarget(null);
  };

  const selectedItem = selectedItemId
    ? db.inventoryItems.find((i) => i.id === selectedItemId) ?? null
    : null;
  const itemMovements = selectedItem
    ? db.inventoryMovements.filter((m) => m.itemId === selectedItem.id)
    : [];

  const itemColumns: DataTableColumn<InventoryItemRecord>[] = [
    {
      key: 'itemCode',
      header: 'Item Code',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-bis-accent dark:text-[#93B9E6]">
          {row.itemCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Item & Storage',
      render: (row) => (
        <div className="min-w-[190px]">
          <p className="font-medium text-bis-text">{row.name}</p>
          <p className="text-[11px] text-bis-muted">
            {row.category} • {row.storageLocation}
          </p>
        </div>
      ),
    },
    {
      key: 'quantityOnHand',
      header: 'On Hand / Threshold',
      render: (row) => {
        const isLow = row.quantityOnHand <= row.reorderLevel;
        return (
          <div className="min-w-[130px]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-bis-text">
                {row.quantityOnHand} {row.unit}
              </span>
              {isLow && <StatusBadge label="Low Stock" tone="warning" />}
            </div>
            <p className="text-[11px] text-bis-muted">
              Reorder at {row.reorderLevel} {row.unit}
            </p>
          </div>
        );
      },
    },
    {
      key: 'custodian',
      header: 'Custodian & Condition',
      render: (row) => (
        <div>
          <p className="text-xs text-bis-text">{row.custodian}</p>
          <p className="text-[11px] text-bis-muted">
            {row.condition} • {formatPhp(row.unitCostPhp)}/{row.unit}
          </p>
        </div>
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
          {allowManage && (
            <>
              <button
                type="button"
                onClick={() => handleOpenMovement(row, 'Stock In')}
                className="inline-flex items-center gap-1 rounded-md border border-bis-border bg-bis-surface px-2 py-1 text-xs font-medium text-bis-accent hover:bg-bis-accent-soft dark:text-[#93B9E6]"
              >
                <ArrowDownUp className="h-3 w-3" />
                <span>Move Stock</span>
              </button>
              <button
                type="button"
                onClick={() => openEditModal(row)}
                aria-label={`Edit ${row.itemCode}`}
                className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setSelectedItemId(row.id)}
            aria-label={`Inspect ${row.itemCode}`}
            className="inline-flex items-center justify-center rounded-md border border-bis-border bg-bis-surface p-1.5 text-bis-muted hover:text-bis-text"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const movementColumns: DataTableColumn<InventoryMovementRecord>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      className: 'whitespace-nowrap font-mono text-xs text-bis-muted',
      render: (row) => row.timestamp,
    },
    {
      key: 'itemName',
      header: 'Inventory Item',
      render: (row) => (
        <div>
          <p className="font-medium text-bis-text">{row.itemName}</p>
          <p className="font-mono text-[11px] text-bis-muted">
            Ref: {row.reference}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Movement',
      render: (row) => (
        <StatusBadge
          label={`${row.type} (${row.quantity})`}
          tone={
            row.type === 'Stock In'
              ? 'accent'
              : row.type === 'Stock Out'
                ? 'warning'
                : 'neutral'
          }
        />
      ),
    },
    {
      key: 'delta',
      header: 'Qty Change',
      className: 'whitespace-nowrap font-mono text-xs',
      render: (row) => `${row.previousQty} → ${row.newQty}`,
    },
    {
      key: 'remarks',
      header: 'Actor & Remarks',
      render: (row) => (
        <div>
          <p className="text-xs text-bis-text">{row.remarks}</p>
          <p className="text-[11px] text-bis-muted">By {row.actor}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Inventory & Property Custodian"
        subtitle="Track office supplies, DRRM rescue equipment, medical stocks, and stock-in/out movements."
        actions={
          allowManage && (
            <AppButton
              variant="primary"
              startIcon={<PackagePlus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Register Item
            </AppButton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((m) => (
          <StatCard key={m.id} metric={m} />
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-bis-warning/40 bg-bis-warning-soft px-4 py-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-bis-warning" />
            <p className="text-bis-text">
              <strong>{lowStockItems.length} items</strong> are at or below
              reorder threshold ({lowStockItems.map((i) => i.name).join(', ')}).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('items');
              setLowStockOnly((prev) => !prev);
            }}
            className="font-semibold text-bis-accent hover:underline dark:text-[#93B9E6]"
          >
            {lowStockOnly ? 'Show All Items' : 'Filter Low Stock Only'}
          </button>
        </div>
      )}

      <SectionCard
        title={
          activeTab === 'items'
            ? 'Barangay Inventory Directory'
            : 'Stock Movement Audit Trail'
        }
        subtitle="Inspect item quantities, custodians, and chronological stock receipts/issuances."
        noPadding
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search item, code, custodian..."
              aria-label="Search inventory"
              containerClassName="w-52 sm:w-64"
            />
            {activeTab === 'items' && (
              <FilterSelect
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'All', label: 'All Categories' },
                  ...CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
            )}
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bis-border bg-bis-surface-subtle px-5 py-2.5">
          <div className="inline-flex rounded-lg border border-bis-border bg-bis-surface p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === 'items'
                  ? 'bg-bis-accent text-bis-accent-contrast'
                  : 'text-bis-muted hover:text-bis-text'
              }`}
            >
              Inventory Items ({db.inventoryItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('movements')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === 'movements'
                  ? 'bg-bis-accent text-bis-accent-contrast'
                  : 'text-bis-muted hover:text-bis-text'
              }`}
            >
              Stock Movements ({db.inventoryMovements.length})
            </button>
          </div>
          {activeTab === 'items' && (
            <label className="inline-flex items-center gap-1.5 text-xs text-bis-muted cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="accent-[var(--bis-accent)]"
              />
              <span>Low stock only</span>
            </label>
          )}
        </div>

        {activeTab === 'items' ? (
          <DataTable
            columns={itemColumns}
            rows={paginatedItems}
            getRowKey={(r) => r.id}
            onRowClick={(r) => setSelectedItemId(r.id)}
            emptyTitle="No matching inventory items"
            emptyDescription="Adjust filters or register a new supply/equipment item."
            footer={
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalItems={filteredItems.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="items"
              />
            }
          />
        ) : (
          <DataTable
            columns={movementColumns}
            rows={paginatedMovements}
            getRowKey={(r) => r.id}
            emptyTitle="No stock movements recorded"
            emptyDescription="Log a Stock In or Stock Out entry on any inventory item."
            footer={
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalItems={filteredMovements.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="movements"
              />
            }
          />
        )}
      </SectionCard>

      {/* Item Movement Drawer */}
      <RecordDrawer
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItemId(null)}
        eyebrow={selectedItem?.itemCode}
        title={selectedItem?.name ?? ''}
        subtitle={
          selectedItem
            ? `${selectedItem.category} • ${selectedItem.storageLocation}`
            : undefined
        }
        footer={
          selectedItem && (
            <>
              <AppButton
                variant="outline"
                onClick={() => setSelectedItemId(null)}
              >
                Close
              </AppButton>
              {allowManage && (
                <AppButton
                  variant="primary"
                  startIcon={<ArrowDownUp className="h-3.5 w-3.5" />}
                  onClick={() => handleOpenMovement(selectedItem, 'Stock In')}
                >
                  Record Stock Movement
                </AppButton>
              )}
            </>
          )
        }
      >
        {selectedItem && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-2.5">
              <DetailField
                label="Quantity On Hand"
                value={`${selectedItem.quantityOnHand} ${selectedItem.unit}`}
                mono
              />
              <DetailField
                label="Reorder Threshold"
                value={`${selectedItem.reorderLevel} ${selectedItem.unit}`}
                mono
              />
              <DetailField
                label="Unit Cost"
                value={formatPhp(selectedItem.unitCostPhp)}
                mono
              />
              <DetailField label="Custodian" value={selectedItem.custodian} />
            </dl>

            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-bis-muted">
                Item Movement History ({itemMovements.length})
              </h3>
              {itemMovements.length === 0 ? (
                <p className="text-xs text-bis-muted">
                  No stock movements logged for this item yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {itemMovements.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-bis-border bg-bis-surface-subtle/60 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge
                          label={`${m.type} (${m.quantity})`}
                          tone={m.type === 'Stock In' ? 'accent' : 'warning'}
                        />
                        <span className="font-mono text-[10.5px] text-bis-muted">
                          {m.timestamp}
                        </span>
                      </div>
                      <p className="mt-1.5 font-medium text-bis-text">
                        Qty: {m.previousQty} → {m.newQty} ({m.reference})
                      </p>
                      <p className="text-bis-muted">
                        {m.remarks} • By {m.actor}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </RecordDrawer>

      {/* Register / Edit Item Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Inventory Item' : 'Register Inventory Item'}
        eyebrow="Inventory Management"
        maxWidth="sm"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-inv-form" variant="primary">
              {editingId ? 'Save Changes' : 'Register Item'}
            </AppButton>
          </>
        }
      >
        <form id="bis-inv-form" onSubmit={handleSaveItem} className="space-y-4">
          <FormField label="Item Name" required error={errors.name}>
            <TextInput
              value={name}
              hasError={Boolean(errors.name)}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Blank PVC ID Cards"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Category">
              <SelectInput
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
            <FormField label="Unit of Measure">
              <TextInput
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="pcs / boxes / kits"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Opening Qty">
              <TextInput
                type="number"
                min={0}
                disabled={Boolean(editingId)}
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(e.target.value)}
              />
            </FormField>
            <FormField label="Reorder Threshold">
              <TextInput
                type="number"
                min={0}
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
              />
            </FormField>
            <FormField label="Unit Cost (₱)">
              <TextInput
                type="number"
                min={0}
                value={unitCostPhp}
                onChange={(e) => setUnitCostPhp(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField
              label="Storage Location"
              required
              error={errors.storageLocation}
            >
              <TextInput
                value={storageLocation}
                hasError={Boolean(errors.storageLocation)}
                onChange={(e) => setStorageLocation(e.target.value)}
              />
            </FormField>
            <FormField label="Custodian" required error={errors.custodian}>
              <TextInput
                value={custodian}
                hasError={Boolean(errors.custodian)}
                onChange={(e) => setCustodian(e.target.value)}
              />
            </FormField>
            <FormField label="Condition">
              <SelectInput
                value={condition}
                onChange={(e) =>
                  setCondition(
                    e.target.value as InventoryItemRecord['condition']
                  )
                }
                options={[
                  { value: 'Good', label: 'Good' },
                  { value: 'Fair', label: 'Fair' },
                  { value: 'Needs Inspection', label: 'Needs Inspection' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <TextAreaInput
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>
        </form>
      </AppModal>

      {/* Stock Movement Modal */}
      <AppModal
        open={Boolean(moveTarget)}
        onClose={() => setMoveTarget(null)}
        title="Record Stock Movement"
        eyebrow={moveTarget?.itemCode}
        subtitle={
          moveTarget
            ? `${moveTarget.name} • Current: ${moveTarget.quantityOnHand} ${moveTarget.unit}`
            : undefined
        }
        maxWidth="xs"
        footer={
          <>
            <AppButton variant="outline" onClick={() => setMoveTarget(null)}>
              Cancel
            </AppButton>
            <AppButton type="submit" form="bis-move-form" variant="primary">
              Apply Movement
            </AppButton>
          </>
        }
      >
        <form
          id="bis-move-form"
          onSubmit={handleSaveMovement}
          className="space-y-4"
        >
          <FormField label="Movement Type">
            <SelectInput
              value={moveType}
              onChange={(e) =>
                setMoveType(e.target.value as InventoryMovementRecord['type'])
              }
              options={[
                { value: 'Stock In', label: 'Stock In (Receive / Restock)' },
                { value: 'Stock Out', label: 'Stock Out (Issue / Consume)' },
                { value: 'Adjustment', label: 'Physical Count Adjustment (Set Exact Qty)' },
              ]}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label={
                moveType === 'Adjustment'
                  ? `New Exact Qty (${moveTarget?.unit ?? 'units'})`
                  : `Quantity (${moveTarget?.unit ?? 'units'})`
              }
            >
              <TextInput
                type="number"
                min={moveType === 'Adjustment' ? 0 : 1}
                value={moveQty}
                onChange={(e) => setMoveQty(e.target.value)}
              />
            </FormField>
            <FormField label="Reference #">
              <TextInput
                value={moveRef}
                onChange={(e) => setMoveRef(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Remarks / Purpose">
            <TextAreaInput
              rows={2}
              value={moveRemarks}
              onChange={(e) => setMoveRemarks(e.target.value)}
              placeholder="e.g., Issued to Window 1 or DRRM delivery"
            />
          </FormField>
        </form>
      </AppModal>
    </div>
  );
}
