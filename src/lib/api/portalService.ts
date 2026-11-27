import { MOCK_PORTAL_OVERVIEW } from '@/data/mock/portal';
import type { PortalOverviewData } from '@/types/portal';
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

/**
 * Public community portal data service.
 * Separated from UI components for clean Laravel REST API integration later.
 */
export const portalService = {
  async getOverview(): Promise<PortalOverviewData> {
    if (USE_MOCK_DATA) {
      return MOCK_PORTAL_OVERVIEW;
    }
    const response = await apiClient.get<PortalOverviewData>(
      API_ENDPOINTS.portal.overview
    );
    return response.data;
  },
};
