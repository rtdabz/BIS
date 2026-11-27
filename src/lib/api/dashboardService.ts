import {
  BARANGAY_PROFILE,
  CURRENT_STAFF_USER,
  INITIAL_NOTIFICATIONS,
} from '@/data/mock/barangay';
import { MOCK_DASHBOARD_OVERVIEW } from '@/data/mock/dashboard';
import type {
  BarangayProfile,
  DashboardOverviewData,
  NotificationItem,
  StaffUser,
} from '@/types/dashboard';
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

/**
 * Service boundary separating UI components from data transport.
 * Returns typed mock data while NEXT_PUBLIC_USE_MOCK_DATA is enabled,
 * and delegates directly to Laravel REST endpoints once connected.
 */
export const dashboardService = {
  async getOverview(): Promise<DashboardOverviewData> {
    if (USE_MOCK_DATA) {
      return MOCK_DASHBOARD_OVERVIEW;
    }
    const response = await apiClient.get<DashboardOverviewData>(
      API_ENDPOINTS.dashboard.overview
    );
    return response.data;
  },

  async getBarangayProfile(): Promise<BarangayProfile> {
    return BARANGAY_PROFILE;
  },

  async getCurrentUser(): Promise<StaffUser> {
    return CURRENT_STAFF_USER;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    if (USE_MOCK_DATA) {
      return INITIAL_NOTIFICATIONS;
    }
    const response = await apiClient.get<NotificationItem[]>(
      API_ENDPOINTS.notifications.list
    );
    return response.data;
  },
};
