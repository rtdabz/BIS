import type { BisDatabaseState } from '@/types/bis';
import {
  SEED_ANNOUNCEMENTS,
  SEED_AUDIT_LOGS,
  SEED_FINANCIAL_TRANSACTIONS,
  SEED_INVENTORY_ITEMS,
  SEED_INVENTORY_MOVEMENTS,
  SEED_PROJECTS,
  SEED_SETTINGS,
  SEED_USERS,
} from './bisSeedAdmin';
import {
  SEED_HOUSEHOLDS,
  SEED_RESIDENTS,
  SEED_SECTORAL_RECORDS,
} from './bisSeedResidents';
import {
  SEED_APPOINTMENTS,
  SEED_BLOTTER_RECORDS,
  SEED_CERTIFICATES,
  SEED_COMPLAINTS,
} from './bisSeedTransactions';

/**
 * Unified relational demonstration dataset for the Barangay Information System (BIS).
 * All dashboard metrics, charts, badges, and module views derive from this source.
 */
export const INITIAL_BIS_DATABASE: BisDatabaseState = {
  residents: SEED_RESIDENTS,
  households: SEED_HOUSEHOLDS,
  sectoralRecords: SEED_SECTORAL_RECORDS,
  certificates: SEED_CERTIFICATES,
  complaints: SEED_COMPLAINTS,
  blotterRecords: SEED_BLOTTER_RECORDS,
  appointments: SEED_APPOINTMENTS,
  financialTransactions: SEED_FINANCIAL_TRANSACTIONS,
  inventoryItems: SEED_INVENTORY_ITEMS,
  inventoryMovements: SEED_INVENTORY_MOVEMENTS,
  projects: SEED_PROJECTS,
  announcements: SEED_ANNOUNCEMENTS,
  users: SEED_USERS,
  auditLogs: SEED_AUDIT_LOGS,
  settings: SEED_SETTINGS,
};
