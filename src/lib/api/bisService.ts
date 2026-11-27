import { INITIAL_BIS_DATABASE } from '@/data/mock/bisSeed';
import type { BisDatabaseState } from '@/types/bis';
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

/**
 * Service boundary prepared for future Laravel REST API integration.
 * Returns centralized demonstration datasets while NEXT_PUBLIC_USE_MOCK_DATA is enabled.
 */
export const bisService = {
  isMockMode(): boolean {
    return USE_MOCK_DATA;
  },

  async fetchInitialSnapshot(): Promise<BisDatabaseState> {
    if (USE_MOCK_DATA) {
      return INITIAL_BIS_DATABASE;
    }

    const [
      residents,
      households,
      sectoralRecords,
      certificates,
      complaints,
      blotterRecords,
      appointments,
      financialTransactions,
      inventoryItems,
      inventoryMovements,
      projects,
      announcements,
      users,
      auditLogs,
      settings,
    ] = await Promise.all([
      apiClient.get<BisDatabaseState['residents']>(API_ENDPOINTS.residents.list),
      apiClient.get<BisDatabaseState['households']>(API_ENDPOINTS.households.list),
      apiClient.get<BisDatabaseState['sectoralRecords']>(API_ENDPOINTS.sectoral.list),
      apiClient.get<BisDatabaseState['certificates']>(API_ENDPOINTS.certificates.list),
      apiClient.get<BisDatabaseState['complaints']>(API_ENDPOINTS.complaints.list),
      apiClient.get<BisDatabaseState['blotterRecords']>(API_ENDPOINTS.blotter.list),
      apiClient.get<BisDatabaseState['appointments']>(API_ENDPOINTS.appointments.list),
      apiClient.get<BisDatabaseState['financialTransactions']>(API_ENDPOINTS.financial.list),
      apiClient.get<BisDatabaseState['inventoryItems']>(API_ENDPOINTS.inventory.list),
      apiClient.get<BisDatabaseState['inventoryMovements']>(API_ENDPOINTS.inventory.movements),
      apiClient.get<BisDatabaseState['projects']>(API_ENDPOINTS.projects.list),
      apiClient.get<BisDatabaseState['announcements']>(API_ENDPOINTS.announcements.list),
      apiClient.get<BisDatabaseState['users']>(API_ENDPOINTS.users.list),
      apiClient.get<BisDatabaseState['auditLogs']>(API_ENDPOINTS.auditLogs.list),
      apiClient.get<BisDatabaseState['settings']>(API_ENDPOINTS.settings.config),
    ]);

    return {
      residents: residents.data,
      households: households.data,
      sectoralRecords: sectoralRecords.data,
      certificates: certificates.data,
      complaints: complaints.data,
      blotterRecords: blotterRecords.data,
      appointments: appointments.data,
      financialTransactions: financialTransactions.data,
      inventoryItems: inventoryItems.data,
      inventoryMovements: inventoryMovements.data,
      projects: projects.data,
      announcements: announcements.data,
      users: users.data,
      auditLogs: auditLogs.data,
      settings: settings.data,
    };
  },
};
