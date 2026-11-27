'use client';

import * as React from 'react';
import { INITIAL_BIS_DATABASE } from '@/data/mock/bisSeed';
import { useIsMounted } from '@/hooks/useIsMounted';
import type {
  AnnouncementRecord,
  AnnouncementStatus,
  AppointmentRecord,
  AppointmentStatus,
  AuditActionType,
  AuditLogEntry,
  BarangayProjectRecord,
  BarangaySettingsRecord,
  BisDatabaseState,
  BlotterRecord,
  BlotterStatus,
  CertificateRecord,
  CertificateWorkflowStatus,
  ComplaintRecord,
  ComplaintStatus,
  FinancialTransactionRecord,
  HouseholdRecord,
  InventoryItemRecord,
  InventoryMovementRecord,
  ResidentRecord,
  SectoralRecord,
  StaffAccountRecord,
} from '@/types/bis';
import { formatResidentFullName } from './bisSelectors';

const STORAGE_KEY = 'bis-demo-db-v1';
const DB_CHANGE_EVENT = 'bis-demo-db-change';

let cachedRaw: string | null = null;
let cachedSnapshot: BisDatabaseState = INITIAL_BIS_DATABASE;

function readStoreSnapshot(): BisDatabaseState {
  if (typeof window === 'undefined') return INITIAL_BIS_DATABASE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedSnapshot = INITIAL_BIS_DATABASE;
      return cachedSnapshot;
    }
    if (raw === cachedRaw) {
      return cachedSnapshot;
    }
    const parsed = JSON.parse(raw) as Partial<BisDatabaseState>;
    if (parsed && Array.isArray(parsed.residents) && parsed.settings) {
      cachedRaw = raw;
      cachedSnapshot = { ...INITIAL_BIS_DATABASE, ...parsed };
      return cachedSnapshot;
    }
  } catch {
    // Ignore storage/parse errors and return cached/default state
  }
  return cachedSnapshot;
}

function writeStoreSnapshot(next: BisDatabaseState) {
  cachedSnapshot = next;
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(next);
    cachedRaw = serialized;
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore quota errors
  }
  window.dispatchEvent(new Event(DB_CHANGE_EVENT));
}

function subscribeStore(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(DB_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(DB_CHANGE_EVENT, onChange);
  };
}

function getServerStoreSnapshot(): BisDatabaseState {
  return INITIAL_BIS_DATABASE;
}

export interface ActorMeta {
  id: string;
  name: string;
  role: string;
}

const DEFAULT_ACTOR: ActorMeta = {
  id: 'usr-sec-001',
  name: 'Maria Elena Santos',
  role: 'Barangay Secretary',
};

function currentDemoTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function currentDemoDate(): string {
  return currentDemoTimestamp().slice(0, 10);
}

function makeUid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;
}

function buildAuditEntry(
  actor: ActorMeta,
  module: string,
  action: AuditActionType,
  targetCode: string,
  summary: string,
  details?: string
): AuditLogEntry {
  return {
    id: makeUid('aud'),
    timestamp: currentDemoTimestamp(),
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    module,
    action,
    targetCode,
    summary,
    details,
  };
}

export interface BisStoreContextValue {
  db: BisDatabaseState;
  hydrated: boolean;
  addResident: (
    payload: Omit<ResidentRecord, 'id' | 'residentCode' | 'registeredAt' | 'status'>,
    actor?: ActorMeta
  ) => ResidentRecord;
  updateResident: (
    id: string,
    patch: Partial<ResidentRecord>,
    actor?: ActorMeta
  ) => void;
  archiveResident: (id: string, reason: string, actor?: ActorMeta) => void;
  restoreResident: (id: string, actor?: ActorMeta) => void;
  addHousehold: (
    payload: Omit<HouseholdRecord, 'id' | 'householdCode' | 'createdAt' | 'status'>,
    actor?: ActorMeta
  ) => HouseholdRecord;
  updateHousehold: (
    id: string,
    patch: Partial<HouseholdRecord>,
    actor?: ActorMeta
  ) => void;
  assignHouseholdMembers: (
    householdId: string,
    headResidentId: string,
    memberIds: string[],
    memberRoles: Record<string, string>,
    actor?: ActorMeta
  ) => void;
  archiveHousehold: (id: string, actor?: ActorMeta) => void;
  addSectoralRecord: (
    payload: Omit<SectoralRecord, 'id' | 'recordCode' | 'enrolledAt'>,
    actor?: ActorMeta
  ) => SectoralRecord;
  updateSectoralRecord: (
    id: string,
    patch: Partial<SectoralRecord>,
    actor?: ActorMeta
  ) => void;
  removeSectoralRecord: (id: string, actor?: ActorMeta) => void;
  createCertificate: (
    payload: Omit<
      CertificateRecord,
      'id' | 'trackingCode' | 'requestedAt' | 'status' | 'history'
    >,
    actor?: ActorMeta
  ) => CertificateRecord;
  transitionCertificate: (
    id: string,
    nextStatus: CertificateWorkflowStatus,
    note?: string,
    actor?: ActorMeta
  ) => void;
  createComplaint: (
    payload: Omit<
      ComplaintRecord,
      'id' | 'ticketNumber' | 'filedAt' | 'updatedAt' | 'status' | 'timeline'
    >,
    actor?: ActorMeta
  ) => ComplaintRecord;
  updateComplaintStatus: (
    id: string,
    nextStatus: ComplaintStatus,
    note: string,
    actor?: ActorMeta
  ) => void;
  escalateComplaintToBlotter: (
    complaintId: string,
    incidentCategory: BlotterRecord['incidentCategory'],
    incidentLocation: string,
    actor?: ActorMeta
  ) => BlotterRecord | null;
  createBlotter: (
    payload: Omit<
      BlotterRecord,
      'id' | 'caseNumber' | 'filedAt' | 'updatedAt' | 'proceedings'
    >,
    actor?: ActorMeta
  ) => BlotterRecord;
  updateBlotter: (
    id: string,
    patch: Partial<BlotterRecord>,
    proceedingNote?: { action: string; notes: string },
    actor?: ActorMeta
  ) => void;
  transitionBlotterStatus: (
    id: string,
    nextStatus: BlotterStatus,
    notes: string,
    settlementTerms?: string,
    actor?: ActorMeta
  ) => void;
  createAppointment: (
    payload: Omit<AppointmentRecord, 'id' | 'referenceCode' | 'createdAt'>,
    actor?: ActorMeta
  ) => AppointmentRecord;
  updateAppointment: (
    id: string,
    patch: Partial<AppointmentRecord>,
    actor?: ActorMeta
  ) => void;
  transitionAppointmentStatus: (
    id: string,
    nextStatus: AppointmentStatus,
    notes?: string,
    actor?: ActorMeta
  ) => void;
  createFinancialTransaction: (
    payload: Omit<FinancialTransactionRecord, 'id' | 'referenceNo'>,
    actor?: ActorMeta
  ) => FinancialTransactionRecord;
  updateFinancialTransaction: (
    id: string,
    patch: Partial<FinancialTransactionRecord>,
    actor?: ActorMeta
  ) => void;
  voidFinancialTransaction: (id: string, reason: string, actor?: ActorMeta) => void;
  createInventoryItem: (
    payload: Omit<InventoryItemRecord, 'id' | 'itemCode' | 'lastUpdated'>,
    actor?: ActorMeta
  ) => InventoryItemRecord;
  updateInventoryItem: (
    id: string,
    patch: Partial<InventoryItemRecord>,
    actor?: ActorMeta
  ) => void;
  recordStockMovement: (
    itemId: string,
    type: InventoryMovementRecord['type'],
    quantity: number,
    reference: string,
    remarks: string,
    actor?: ActorMeta
  ) => void;
  createProject: (
    payload: Omit<BarangayProjectRecord, 'id' | 'projectCode'>,
    actor?: ActorMeta
  ) => BarangayProjectRecord;
  updateProject: (
    id: string,
    patch: Partial<BarangayProjectRecord>,
    actor?: ActorMeta
  ) => void;
  createAnnouncement: (
    payload: Omit<AnnouncementRecord, 'id' | 'code'>,
    actor?: ActorMeta
  ) => AnnouncementRecord;
  updateAnnouncement: (
    id: string,
    patch: Partial<AnnouncementRecord>,
    actor?: ActorMeta
  ) => void;
  transitionAnnouncementStatus: (
    id: string,
    status: AnnouncementStatus,
    actor?: ActorMeta
  ) => void;
  createUser: (
    payload: Omit<StaffAccountRecord, 'id' | 'employeeCode' | 'lastLoginAt'>,
    actor?: ActorMeta
  ) => StaffAccountRecord;
  updateUser: (
    id: string,
    patch: Partial<StaffAccountRecord>,
    actor?: ActorMeta
  ) => void;
  updateSettings: (
    patch: Partial<BarangaySettingsRecord>,
    actor?: ActorMeta
  ) => void;
  logEvent: (
    module: string,
    action: AuditActionType,
    targetCode: string,
    summary: string,
    details?: string,
    actor?: ActorMeta
  ) => void;
  resetDemoDatabase: (actor?: ActorMeta) => void;
}

const BisStoreContext = React.createContext<BisStoreContextValue | null>(null);

export function BisStoreProvider({ children }: { children: React.ReactNode }) {
  const db = React.useSyncExternalStore(
    subscribeStore,
    readStoreSnapshot,
    getServerStoreSnapshot
  );
  const hydrated = useIsMounted();

  const updateDb = React.useCallback(
    (updater: (prev: BisDatabaseState) => BisDatabaseState) => {
      const current = readStoreSnapshot();
      const next = updater(current);
      if (next !== current) {
        writeStoreSnapshot(next);
      }
    },
    []
  );

  const addResident = React.useCallback<BisStoreContextValue['addResident']>(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = current.residents.length + 1;
      const residentCode = `RES-2026-${String(nextNum).padStart(4, '0')}`;
      const created: ResidentRecord = {
        ...payload,
        id: makeUid('res'),
        residentCode,
        status: 'Active',
        registeredAt: currentDemoDate(),
      };
      const fullName = formatResidentFullName(created);
      updateDb((prev) => {
        const nextHouseholds = created.householdId
          ? prev.households.map((hh) =>
              hh.id === created.householdId && !hh.memberIds.includes(created.id)
                ? {
                    ...hh,
                    memberIds: [...hh.memberIds, created.id],
                    memberRoles: { ...hh.memberRoles, [created.id]: 'Member' },
                  }
                : hh
            )
          : prev.households;

        return {
          ...prev,
          residents: [created, ...prev.residents],
          households: nextHouseholds,
          auditLogs: [
            buildAuditEntry(
              actor,
              'Residents',
              'Create',
              residentCode,
              `Registered resident ${fullName} (${created.purok})`
            ),
            ...prev.auditLogs,
          ],
        };
      });
      return created;
    },
    [updateDb]
  );

  const updateResident = React.useCallback<BisStoreContextValue['updateResident']>(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.residents.find((r) => r.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        const fullName = formatResidentFullName(updated);

        let nextHouseholds = prev.households;
        if (patch.householdId !== undefined && patch.householdId !== existing.householdId) {
          nextHouseholds = prev.households.map((hh) => {
            if (hh.id === existing.householdId) {
              const memberIds = hh.memberIds.filter((m) => m !== id);
              const restRoles = { ...hh.memberRoles };
              delete restRoles[id];
              return { ...hh, memberIds, memberRoles: restRoles };
            }
            if (hh.id === patch.householdId && !hh.memberIds.includes(id)) {
              return {
                ...hh,
                memberIds: [...hh.memberIds, id],
                memberRoles: { ...hh.memberRoles, [id]: 'Member' },
              };
            }
            return hh;
          });
        }

        return {
          ...prev,
          residents: prev.residents.map((r) => (r.id === id ? updated : r)),
          households: nextHouseholds,
          auditLogs: [
            buildAuditEntry(
              actor,
              'Residents',
              'Update',
              existing.residentCode,
              `Updated profile for ${fullName}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const archiveResident = React.useCallback<BisStoreContextValue['archiveResident']>(
    (id, reason, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.residents.find((r) => r.id === id);
        if (!existing) return prev;
        return {
          ...prev,
          residents: prev.residents.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'Archived',
                  archivedReason: reason,
                  archivedAt: currentDemoDate(),
                }
              : r
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Residents',
              'Archive',
              existing.residentCode,
              `Archived resident ${formatResidentFullName(existing)}`,
              reason
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const restoreResident = React.useCallback<BisStoreContextValue['restoreResident']>(
    (id, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.residents.find((r) => r.id === id);
        if (!existing) return prev;
        return {
          ...prev,
          residents: prev.residents.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'Active',
                  archivedReason: undefined,
                  archivedAt: undefined,
                }
              : r
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Residents',
              'Restore',
              existing.residentCode,
              `Restored resident ${formatResidentFullName(existing)} to Active registry`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const addHousehold = React.useCallback<BisStoreContextValue['addHousehold']>(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = 1001 + current.households.length;
      const householdCode = `HH-2026-${nextNum}`;
      const created: HouseholdRecord = {
        ...payload,
        id: makeUid('hh'),
        householdCode,
        status: 'Active',
        createdAt: currentDemoDate(),
      };
      updateDb((prev) => ({
        ...prev,
        households: [created, ...prev.households],
        residents: prev.residents.map((r) =>
          created.memberIds.includes(r.id) ? { ...r, householdId: created.id } : r
        ),
        auditLogs: [
          buildAuditEntry(
            actor,
            'Households',
            'Create',
            householdCode,
            `Created household ${householdCode} in ${created.purok} (${created.memberIds.length} members)`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateHousehold = React.useCallback<BisStoreContextValue['updateHousehold']>(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.households.find((h) => h.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        return {
          ...prev,
          households: prev.households.map((h) => (h.id === id ? updated : h)),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Households',
              'Update',
              existing.householdCode,
              `Updated household ${existing.householdCode} details`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const assignHouseholdMembers = React.useCallback<
    BisStoreContextValue['assignHouseholdMembers']
  >(
    (householdId, headResidentId, memberIds, memberRoles, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.households.find((h) => h.id === householdId);
        if (!existing) return prev;
        const ensuredMembers = memberIds.includes(headResidentId)
          ? memberIds
          : [headResidentId, ...memberIds];

        return {
          ...prev,
          households: prev.households.map((h) =>
            h.id === householdId
              ? {
                  ...h,
                  headResidentId,
                  memberIds: ensuredMembers,
                  memberRoles: { ...memberRoles, [headResidentId]: 'Head' },
                }
              : {
                  ...h,
                  memberIds: h.memberIds.filter((m) => !ensuredMembers.includes(m)),
                }
          ),
          residents: prev.residents.map((r) => {
            if (ensuredMembers.includes(r.id)) {
              return { ...r, householdId };
            }
            if (r.householdId === householdId) {
              return { ...r, householdId: undefined };
            }
            return r;
          }),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Households',
              'Update',
              existing.householdCode,
              `Updated household members & head designation for ${existing.householdCode}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const archiveHousehold = React.useCallback<BisStoreContextValue['archiveHousehold']>(
    (id, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.households.find((h) => h.id === id);
        if (!existing) return prev;
        return {
          ...prev,
          households: prev.households.map((h) =>
            h.id === id
              ? { ...h, status: h.status === 'Active' ? 'Archived' : 'Active' }
              : h
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Households',
              existing.status === 'Active' ? 'Archive' : 'Restore',
              existing.householdCode,
              `${existing.status === 'Active' ? 'Archived' : 'Restored'} household ${existing.householdCode}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const addSectoralRecord = React.useCallback<
    BisStoreContextValue['addSectoralRecord']
  >(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = current.sectoralRecords.length + 1;
      const recordCode = `SEC-2026-${String(nextNum).padStart(3, '0')}`;
      const created: SectoralRecord = {
        ...payload,
        id: makeUid('sec'),
        recordCode,
        enrolledAt: currentDemoDate(),
      };
      updateDb((prev) => ({
        ...prev,
        sectoralRecords: [created, ...prev.sectoralRecords],
        residents: prev.residents.map((r) =>
          r.id === created.residentId && !r.sectoralTags.includes(created.sector)
            ? { ...r, sectoralTags: [...r.sectoralTags, created.sector] }
            : r
        ),
        auditLogs: [
          buildAuditEntry(
            actor,
            'Sectoral Records',
            'Create',
            recordCode,
            `Enrolled resident in ${created.sector} (${created.sectorIdNumber})`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateSectoralRecord = React.useCallback<
    BisStoreContextValue['updateSectoralRecord']
  >(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.sectoralRecords.find((s) => s.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        return {
          ...prev,
          sectoralRecords: prev.sectoralRecords.map((s) =>
            s.id === id ? updated : s
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Sectoral Records',
              'Update',
              existing.recordCode,
              `Updated ${existing.sector} status (${updated.verificationStatus})`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const removeSectoralRecord = React.useCallback<
    BisStoreContextValue['removeSectoralRecord']
  >(
    (id, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.sectoralRecords.find((s) => s.id === id);
        if (!existing) return prev;
        const remaining = prev.sectoralRecords.filter((s) => s.id !== id);
        const stillHasSector = remaining.some(
          (s) =>
            s.residentId === existing.residentId && s.sector === existing.sector
        );
        return {
          ...prev,
          sectoralRecords: remaining,
          residents: stillHasSector
            ? prev.residents
            : prev.residents.map((r) =>
                r.id === existing.residentId
                  ? {
                      ...r,
                      sectoralTags: r.sectoralTags.filter(
                        (t) => t !== existing.sector
                      ),
                    }
                  : r
              ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Sectoral Records',
              'Archive',
              existing.recordCode,
              `Removed ${existing.sector} record ${existing.recordCode}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createCertificate = React.useCallback<
    BisStoreContextValue['createCertificate']
  >(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = 419 + current.certificates.length;
      const trackingCode = `REQ-2026-${String(nextNum).padStart(4, '0')}`;
      const ts = currentDemoTimestamp();
      const created: CertificateRecord = {
        ...payload,
        id: makeUid('cert'),
        trackingCode,
        requestedAt: ts,
        status: 'Pending',
        history: [
          {
            timestamp: ts,
            action: 'Request Filed',
            actor: actor.name,
            note: payload.remarks,
          },
        ],
      };
      updateDb((prev) => ({
        ...prev,
        certificates: [created, ...prev.certificates],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Certificates',
            'Create',
            trackingCode,
            `Filed ${created.documentType} request for ${created.residentName}`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const transitionCertificate = React.useCallback<
    BisStoreContextValue['transitionCertificate']
  >(
    (id, nextStatus, note, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.certificates.find((c) => c.id === id);
        if (!existing) return prev;
        const ts = currentDemoTimestamp();
        const dateStr = ts.slice(0, 10);
        const nextOr =
          nextStatus === 'Released' && !existing.isFeeExempt && existing.feeAmount > 0
            ? existing.orNumber ?? `OR-2026-${8820 + prev.financialTransactions.length}`
            : existing.orNumber;

        const updated: CertificateRecord = {
          ...existing,
          status: nextStatus,
          orNumber: nextOr,
          approvedBy:
            nextStatus === 'Approved' || nextStatus === 'Released'
              ? existing.approvedBy ?? prev.settings.signatories.punongBarangay
              : existing.approvedBy,
          releasedAt: nextStatus === 'Released' ? ts : existing.releasedAt,
          declineReason:
            nextStatus === 'Declined'
              ? note ?? existing.declineReason
              : existing.declineReason,
          history: [
            ...existing.history,
            {
              timestamp: ts,
              action: `Moved to ${nextStatus}`,
              actor: actor.name,
              note,
            },
          ],
        };

        const shouldPostIncome =
          nextStatus === 'Released' &&
          !existing.isFeeExempt &&
          existing.feeAmount > 0 &&
          !prev.financialTransactions.some((f) => f.linkedCertificateId === id);

        const newFinancial = shouldPostIncome
          ? [
              {
                id: makeUid('fin'),
                referenceNo: `FIN-2026-${String(323 + prev.financialTransactions.length).padStart(4, '0')}`,
                type: 'Income' as const,
                category: 'Clearance & Permit Fees' as const,
                description: `${existing.documentType} Fee — ${existing.trackingCode}`,
                payeeOrPayer: existing.residentName,
                amountPhp: existing.feeAmount,
                transactionDate: dateStr,
                paymentMethod: 'Cash' as const,
                orOrVoucherNo: nextOr ?? existing.trackingCode,
                recordedBy: actor.name,
                status: 'Posted' as const,
                linkedCertificateId: id,
              },
              ...prev.financialTransactions,
            ]
          : prev.financialTransactions;

        const auditAction: AuditActionType =
          nextStatus === 'Approved'
            ? 'Approve'
            : nextStatus === 'Released'
              ? 'Release'
              : 'Update';

        return {
          ...prev,
          certificates: prev.certificates.map((c) => (c.id === id ? updated : c)),
          financialTransactions: newFinancial,
          auditLogs: [
            buildAuditEntry(
              actor,
              'Certificates',
              auditAction,
              existing.trackingCode,
              `${existing.trackingCode} (${existing.residentName}) marked ${nextStatus}`,
              note
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createComplaint = React.useCallback<BisStoreContextValue['createComplaint']>(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = 119 + current.complaints.length;
      const ticketNumber = `CMP-2026-${String(nextNum).padStart(4, '0')}`;
      const ts = currentDemoTimestamp();
      const created: ComplaintRecord = {
        ...payload,
        id: makeUid('cmp'),
        ticketNumber,
        status: 'Open',
        filedAt: ts,
        updatedAt: ts,
        timeline: [
          {
            timestamp: ts,
            status: 'Open',
            actor: actor.name,
            note: 'Complaint logged at front desk.',
          },
        ],
      };
      updateDb((prev) => ({
        ...prev,
        complaints: [created, ...prev.complaints],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Complaints',
            'Create',
            ticketNumber,
            `Logged complaint ${ticketNumber}: ${created.subject}`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateComplaintStatus = React.useCallback<
    BisStoreContextValue['updateComplaintStatus']
  >(
    (id, nextStatus, note, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.complaints.find((c) => c.id === id);
        if (!existing) return prev;
        const ts = currentDemoTimestamp();
        const updated: ComplaintRecord = {
          ...existing,
          status: nextStatus,
          updatedAt: ts,
          resolutionNotes:
            nextStatus === 'Resolved' || nextStatus === 'Dismissed'
              ? note || existing.resolutionNotes
              : existing.resolutionNotes,
          timeline: [
            ...existing.timeline,
            { timestamp: ts, status: nextStatus, actor: actor.name, note },
          ],
        };
        return {
          ...prev,
          complaints: prev.complaints.map((c) => (c.id === id ? updated : c)),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Complaints',
              'Update',
              existing.ticketNumber,
              `Complaint ${existing.ticketNumber} moved to ${nextStatus}`,
              note
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const escalateComplaintToBlotter = React.useCallback<
    BisStoreContextValue['escalateComplaintToBlotter']
  >(
    (complaintId, incidentCategory, incidentLocation, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const complaint = current.complaints.find((c) => c.id === complaintId);
      if (!complaint) return null;

      const nextNum = 20 + current.blotterRecords.length;
      const caseNumber = `BLT-2026-${String(nextNum).padStart(3, '0')}`;
      const today = currentDemoDate();
      const ts = currentDemoTimestamp();

      const newBlotter: BlotterRecord = {
        id: makeUid('blt'),
        caseNumber,
        complainantResidentId: complaint.complainantResidentId,
        complainantName: complaint.complainantName,
        respondentName: complaint.respondentName,
        purok: complaint.purok,
        incidentCategory,
        incidentDate: complaint.filedAt.slice(0, 10),
        incidentLocation,
        narrative: `${complaint.subject}. ${complaint.description}`,
        presidingOfficer: current.settings.signatories.luponChair,
        hearingVenue: 'Session Hall B',
        status: 'Filed',
        filedAt: today,
        updatedAt: today,
        proceedings: [
          {
            date: today,
            action: 'Escalated from Front-Desk Complaint',
            officer: actor.name,
            notes: `Escalated from ${complaint.ticketNumber}`,
          },
        ],
      };

      updateDb((prev) => ({
        ...prev,
        blotterRecords: [newBlotter, ...prev.blotterRecords],
        complaints: prev.complaints.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                status: 'Escalated to Blotter',
                escalatedBlotterId: newBlotter.id,
                resolutionNotes: `Escalated to Blotter Case ${caseNumber}`,
                updatedAt: ts,
                timeline: [
                  ...c.timeline,
                  {
                    timestamp: ts,
                    status: 'Escalated to Blotter',
                    actor: actor.name,
                    note: `Created Lupon case ${caseNumber}`,
                  },
                ],
              }
            : c
        ),
        auditLogs: [
          buildAuditEntry(
            actor,
            'Blotter',
            'Create',
            caseNumber,
            `Escalated complaint ${complaint.ticketNumber} to Blotter Case ${caseNumber}`
          ),
          ...prev.auditLogs,
        ],
      }));

      return newBlotter;
    },
    [updateDb]
  );

  const createBlotter = React.useCallback<BisStoreContextValue['createBlotter']>(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = 20 + current.blotterRecords.length;
      const caseNumber = `BLT-2026-${String(nextNum).padStart(3, '0')}`;
      const today = currentDemoDate();
      const created: BlotterRecord = {
        ...payload,
        id: makeUid('blt'),
        caseNumber,
        filedAt: today,
        updatedAt: today,
        proceedings: [
          {
            date: today,
            action: 'Blotter Case Registered',
            officer: actor.name,
            notes: `Assigned to ${payload.presidingOfficer}`,
          },
        ],
      };
      updateDb((prev) => ({
        ...prev,
        blotterRecords: [created, ...prev.blotterRecords],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Blotter',
            'Create',
            caseNumber,
            `Registered blotter case ${caseNumber}: ${created.complainantName} vs ${created.respondentName}`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateBlotter = React.useCallback<BisStoreContextValue['updateBlotter']>(
    (id, patch, proceedingNote, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.blotterRecords.find((b) => b.id === id);
        if (!existing) return prev;
        const today = currentDemoDate();
        const updated: BlotterRecord = {
          ...existing,
          ...patch,
          updatedAt: today,
          proceedings: proceedingNote
            ? [
                ...existing.proceedings,
                {
                  date: today,
                  action: proceedingNote.action,
                  officer: actor.name,
                  notes: proceedingNote.notes,
                },
              ]
            : existing.proceedings,
        };
        return {
          ...prev,
          blotterRecords: prev.blotterRecords.map((b) =>
            b.id === id ? updated : b
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Blotter',
              'Update',
              existing.caseNumber,
              `Updated blotter docket ${existing.caseNumber}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const transitionBlotterStatus = React.useCallback<
    BisStoreContextValue['transitionBlotterStatus']
  >(
    (id, nextStatus, notes, settlementTerms, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.blotterRecords.find((b) => b.id === id);
        if (!existing) return prev;
        const today = currentDemoDate();
        const updated: BlotterRecord = {
          ...existing,
          status: nextStatus,
          settlementTerms: settlementTerms ?? existing.settlementTerms,
          updatedAt: today,
          proceedings: [
            ...existing.proceedings,
            {
              date: today,
              action: `Status changed to ${nextStatus}`,
              officer: actor.name,
              notes,
            },
          ],
        };
        return {
          ...prev,
          blotterRecords: prev.blotterRecords.map((b) =>
            b.id === id ? updated : b
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Blotter',
              'Update',
              existing.caseNumber,
              `Blotter case ${existing.caseNumber} transitioned to ${nextStatus}`,
              notes
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createAppointment = React.useCallback<
    BisStoreContextValue['createAppointment']
  >(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = 100 + current.appointments.length;
      const referenceCode = `APT-2026-${String(nextNum).padStart(3, '0')}`;
      const created: AppointmentRecord = {
        ...payload,
        id: makeUid('apt'),
        referenceCode,
        createdAt: currentDemoDate(),
      };
      updateDb((prev) => ({
        ...prev,
        appointments: [created, ...prev.appointments],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Appointments',
            'Create',
            referenceCode,
            `Scheduled ${created.serviceType} for ${created.residentName} (${created.appointmentDate} ${created.timeSlot})`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateAppointment = React.useCallback<
    BisStoreContextValue['updateAppointment']
  >(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.appointments.find((a) => a.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        return {
          ...prev,
          appointments: prev.appointments.map((a) => (a.id === id ? updated : a)),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Appointments',
              'Update',
              existing.referenceCode,
              `Updated appointment ${existing.referenceCode} (${updated.appointmentDate} ${updated.timeSlot})`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const transitionAppointmentStatus = React.useCallback<
    BisStoreContextValue['transitionAppointmentStatus']
  >(
    (id, nextStatus, notes, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.appointments.find((a) => a.id === id);
        if (!existing) return prev;
        const updated: AppointmentRecord = {
          ...existing,
          status: nextStatus,
          notes: notes ?? existing.notes,
        };
        return {
          ...prev,
          appointments: prev.appointments.map((a) => (a.id === id ? updated : a)),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Appointments',
              nextStatus === 'Approved' ? 'Approve' : 'Update',
              existing.referenceCode,
              `Appointment ${existing.referenceCode} marked ${nextStatus}`,
              notes
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createFinancialTransaction = React.useCallback<
    BisStoreContextValue['createFinancialTransaction']
  >(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = 323 + current.financialTransactions.length;
      const referenceNo = `FIN-2026-${String(nextNum).padStart(4, '0')}`;
      const created: FinancialTransactionRecord = {
        ...payload,
        id: makeUid('fin'),
        referenceNo,
      };
      updateDb((prev) => ({
        ...prev,
        financialTransactions: [created, ...prev.financialTransactions],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Financial',
            'Create',
            referenceNo,
            `Recorded ${created.type}: ${created.description} (₱${created.amountPhp.toLocaleString()})`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateFinancialTransaction = React.useCallback<
    BisStoreContextValue['updateFinancialTransaction']
  >(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.financialTransactions.find((f) => f.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        return {
          ...prev,
          financialTransactions: prev.financialTransactions.map((f) =>
            f.id === id ? updated : f
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Financial',
              'Update',
              existing.referenceNo,
              `Updated financial entry ${existing.referenceNo}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const voidFinancialTransaction = React.useCallback<
    BisStoreContextValue['voidFinancialTransaction']
  >(
    (id, reason, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.financialTransactions.find((f) => f.id === id);
        if (!existing) return prev;
        return {
          ...prev,
          financialTransactions: prev.financialTransactions.map((f) =>
            f.id === id ? { ...f, status: 'Voided', voidReason: reason } : f
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Financial',
              'Void',
              existing.referenceNo,
              `Voided financial entry ${existing.referenceNo}`,
              reason
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createInventoryItem = React.useCallback<
    BisStoreContextValue['createInventoryItem']
  >(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = current.inventoryItems.length + 1;
      const itemCode = `INV-${String(nextNum).padStart(3, '0')}`;
      const today = currentDemoDate();
      const created: InventoryItemRecord = {
        ...payload,
        id: makeUid('inv'),
        itemCode,
        lastUpdated: today,
      };
      const initialMovement: InventoryMovementRecord = {
        id: makeUid('mov'),
        itemId: created.id,
        itemName: created.name,
        type: 'Stock In',
        quantity: created.quantityOnHand,
        previousQty: 0,
        newQty: created.quantityOnHand,
        reference: itemCode,
        actor: actor.name,
        remarks: 'Initial item registration',
        timestamp: currentDemoTimestamp(),
      };
      updateDb((prev) => ({
        ...prev,
        inventoryItems: [created, ...prev.inventoryItems],
        inventoryMovements: [initialMovement, ...prev.inventoryMovements],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Inventory',
            'Create',
            itemCode,
            `Registered inventory item ${created.name} (${created.quantityOnHand} ${created.unit})`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateInventoryItem = React.useCallback<
    BisStoreContextValue['updateInventoryItem']
  >(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.inventoryItems.find((i) => i.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch, lastUpdated: currentDemoDate() };
        return {
          ...prev,
          inventoryItems: prev.inventoryItems.map((i) =>
            i.id === id ? updated : i
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Inventory',
              'Update',
              existing.itemCode,
              `Updated item details for ${updated.name}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const recordStockMovement = React.useCallback<
    BisStoreContextValue['recordStockMovement']
  >(
    (itemId, type, quantity, reference, remarks, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.inventoryItems.find((i) => i.id === itemId);
        if (!existing) return prev;
        const prevQty = existing.quantityOnHand;
        const newQty =
          type === 'Stock In'
            ? prevQty + quantity
            : type === 'Stock Out'
              ? Math.max(0, prevQty - quantity)
              : quantity;

        const movement: InventoryMovementRecord = {
          id: makeUid('mov'),
          itemId,
          itemName: existing.name,
          type,
          quantity,
          previousQty: prevQty,
          newQty,
          reference,
          actor: actor.name,
          remarks,
          timestamp: currentDemoTimestamp(),
        };

        return {
          ...prev,
          inventoryItems: prev.inventoryItems.map((i) =>
            i.id === itemId
              ? { ...i, quantityOnHand: newQty, lastUpdated: currentDemoDate() }
              : i
          ),
          inventoryMovements: [movement, ...prev.inventoryMovements],
          auditLogs: [
            buildAuditEntry(
              actor,
              'Inventory',
              'Stock Move',
              existing.itemCode,
              `${type} (${quantity} ${existing.unit}) on ${existing.name} → ${newQty} ${existing.unit}`,
              remarks
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createProject = React.useCallback<BisStoreContextValue['createProject']>(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = current.projects.length + 1;
      const projectCode = `PRJ-2026-${String(nextNum).padStart(2, '0')}`;
      const created: BarangayProjectRecord = {
        ...payload,
        id: makeUid('prj'),
        projectCode,
      };
      updateDb((prev) => ({
        ...prev,
        projects: [created, ...prev.projects],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Projects',
            'Create',
            projectCode,
            `Created barangay project/program ${created.title}`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateProject = React.useCallback<BisStoreContextValue['updateProject']>(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.projects.find((p) => p.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        return {
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? updated : p)),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Projects',
              'Update',
              existing.projectCode,
              `Updated project ${updated.title} (${updated.progressPercent}% • ${updated.status})`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createAnnouncement = React.useCallback<
    BisStoreContextValue['createAnnouncement']
  >(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = current.announcements.length + 1;
      const code = `ANN-2026-${String(nextNum).padStart(3, '0')}`;
      const created: AnnouncementRecord = {
        ...payload,
        id: makeUid('ann'),
        code,
      };
      updateDb((prev) => ({
        ...prev,
        announcements: [created, ...prev.announcements],
        auditLogs: [
          buildAuditEntry(
            actor,
            'Announcements',
            created.status === 'Published' ? 'Publish' : 'Create',
            code,
            `${created.status === 'Published' ? 'Published' : 'Drafted'} announcement: ${created.title}`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateAnnouncement = React.useCallback<
    BisStoreContextValue['updateAnnouncement']
  >(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.announcements.find((a) => a.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        return {
          ...prev,
          announcements: prev.announcements.map((a) =>
            a.id === id ? updated : a
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Announcements',
              'Update',
              existing.code,
              `Updated announcement ${updated.title}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const transitionAnnouncementStatus = React.useCallback<
    BisStoreContextValue['transitionAnnouncementStatus']
  >(
    (id, status, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.announcements.find((a) => a.id === id);
        if (!existing) return prev;
        return {
          ...prev,
          announcements: prev.announcements.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  showOnPublicPortal:
                    status === 'Published'
                      ? true
                      : status === 'Archived'
                        ? false
                        : a.showOnPublicPortal,
                  publishedDate:
                    status === 'Published' ? currentDemoDate() : a.publishedDate,
                }
              : a
          ),
          auditLogs: [
            buildAuditEntry(
              actor,
              'Announcements',
              status === 'Published'
                ? 'Publish'
                : status === 'Archived'
                  ? 'Archive'
                  : 'Update',
              existing.code,
              `Announcement ${existing.code} status set to ${status}`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const createUser = React.useCallback<BisStoreContextValue['createUser']>(
    (payload, actor = DEFAULT_ACTOR) => {
      const current = readStoreSnapshot();
      const nextNum = current.users.length + 1;
      const employeeCode = `STF-2026-${String(nextNum).padStart(3, '0')}`;
      const created: StaffAccountRecord = {
        ...payload,
        id: makeUid('usr'),
        employeeCode,
        lastLoginAt: 'Never',
      };
      updateDb((prev) => ({
        ...prev,
        users: [created, ...prev.users],
        auditLogs: [
          buildAuditEntry(
            actor,
            'User Management',
            'Create',
            employeeCode,
            `Created staff account for ${created.fullName} (${created.role})`
          ),
          ...prev.auditLogs,
        ],
      }));
      return created;
    },
    [updateDb]
  );

  const updateUser = React.useCallback<BisStoreContextValue['updateUser']>(
    (id, patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => {
        const existing = prev.users.find((u) => u.id === id);
        if (!existing) return prev;
        const updated = { ...existing, ...patch };
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === id ? updated : u)),
          auditLogs: [
            buildAuditEntry(
              actor,
              'User Management',
              'Update',
              existing.employeeCode,
              `Updated account ${updated.fullName} (${updated.role} • ${updated.status})`
            ),
            ...prev.auditLogs,
          ],
        };
      });
    },
    [updateDb]
  );

  const updateSettings = React.useCallback<BisStoreContextValue['updateSettings']>(
    (patch, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...patch,
          signatories: patch.signatories
            ? { ...prev.settings.signatories, ...patch.signatories }
            : prev.settings.signatories,
          certificateFees: patch.certificateFees
            ? { ...prev.settings.certificateFees, ...patch.certificateFees }
            : prev.settings.certificateFees,
        },
        auditLogs: [
          buildAuditEntry(
            actor,
            'Settings',
            'Settings',
            'SYS-CONFIG',
            'Updated Barangay profile, signatories, or certificate configuration'
          ),
          ...prev.auditLogs,
        ],
      }));
    },
    [updateDb]
  );

  const logEvent = React.useCallback<BisStoreContextValue['logEvent']>(
    (module, action, targetCode, summary, details, actor = DEFAULT_ACTOR) => {
      updateDb((prev) => ({
        ...prev,
        auditLogs: [
          buildAuditEntry(actor, module, action, targetCode, summary, details),
          ...prev.auditLogs,
        ],
      }));
    },
    [updateDb]
  );

  const resetDemoDatabase = React.useCallback<
    BisStoreContextValue['resetDemoDatabase']
  >((actor = DEFAULT_ACTOR) => {
    const next: BisDatabaseState = {
      ...INITIAL_BIS_DATABASE,
      auditLogs: [
        buildAuditEntry(
          actor,
          'Settings',
          'Restore',
          'DEMO-RESET',
          'Reset demonstration dataset to factory seed state'
        ),
        ...INITIAL_BIS_DATABASE.auditLogs,
      ],
    };
    writeStoreSnapshot(next);
  }, []);

  const value = React.useMemo<BisStoreContextValue>(
    () => ({
      db,
      hydrated,
      addResident,
      updateResident,
      archiveResident,
      restoreResident,
      addHousehold,
      updateHousehold,
      assignHouseholdMembers,
      archiveHousehold,
      addSectoralRecord,
      updateSectoralRecord,
      removeSectoralRecord,
      createCertificate,
      transitionCertificate,
      createComplaint,
      updateComplaintStatus,
      escalateComplaintToBlotter,
      createBlotter,
      updateBlotter,
      transitionBlotterStatus,
      createAppointment,
      updateAppointment,
      transitionAppointmentStatus,
      createFinancialTransaction,
      updateFinancialTransaction,
      voidFinancialTransaction,
      createInventoryItem,
      updateInventoryItem,
      recordStockMovement,
      createProject,
      updateProject,
      createAnnouncement,
      updateAnnouncement,
      transitionAnnouncementStatus,
      createUser,
      updateUser,
      updateSettings,
      logEvent,
      resetDemoDatabase,
    }),
    [
      db,
      hydrated,
      addResident,
      updateResident,
      archiveResident,
      restoreResident,
      addHousehold,
      updateHousehold,
      assignHouseholdMembers,
      archiveHousehold,
      addSectoralRecord,
      updateSectoralRecord,
      removeSectoralRecord,
      createCertificate,
      transitionCertificate,
      createComplaint,
      updateComplaintStatus,
      escalateComplaintToBlotter,
      createBlotter,
      updateBlotter,
      transitionBlotterStatus,
      createAppointment,
      updateAppointment,
      transitionAppointmentStatus,
      createFinancialTransaction,
      updateFinancialTransaction,
      voidFinancialTransaction,
      createInventoryItem,
      updateInventoryItem,
      recordStockMovement,
      createProject,
      updateProject,
      createAnnouncement,
      updateAnnouncement,
      transitionAnnouncementStatus,
      createUser,
      updateUser,
      updateSettings,
      logEvent,
      resetDemoDatabase,
    ]
  );

  return (
    <BisStoreContext.Provider value={value}>{children}</BisStoreContext.Provider>
  );
}

export function useBisStore(): BisStoreContextValue {
  const ctx = React.useContext(BisStoreContext);
  if (!ctx) {
    throw new Error('useBisStore must be used within a BisStoreProvider');
  }
  return ctx;
}
