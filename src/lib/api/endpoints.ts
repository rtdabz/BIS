/**
 * Laravel REST API endpoint registry.
 * Centralizes backend routes so switching from the centralized mock store
 * to live Laravel REST endpoints requires no UI component refactoring.
 */
export const API_ENDPOINTS = {
  dashboard: {
    overview: '/dashboard/overview',
    registrationTrends: '/dashboard/registration-trends',
    populationDistribution: '/dashboard/population-distribution',
  },
  residents: {
    list: '/residents',
    detail: (id: string | number) => `/residents/${id}`,
    archive: (id: string | number) => `/residents/${id}/archive`,
  },
  households: {
    list: '/households',
    detail: (id: string | number) => `/households/${id}`,
  },
  sectoral: {
    list: '/sectoral-records',
    detail: (id: string | number) => `/sectoral-records/${id}`,
  },
  certificates: {
    list: '/certificates',
    recent: '/certificates/recent',
    detail: (id: string | number) => `/certificates/${id}`,
    transition: (id: string | number) => `/certificates/${id}/status`,
  },
  complaints: {
    list: '/complaints',
    detail: (id: string | number) => `/complaints/${id}`,
  },
  blotter: {
    list: '/blotter-records',
    detail: (id: string | number) => `/blotter-records/${id}`,
  },
  appointments: {
    list: '/appointments',
    detail: (id: string | number) => `/appointments/${id}`,
  },
  financial: {
    list: '/financial-transactions',
    detail: (id: string | number) => `/financial-transactions/${id}`,
  },
  inventory: {
    list: '/inventory-items',
    movements: '/inventory-movements',
    detail: (id: string | number) => `/inventory-items/${id}`,
  },
  projects: {
    list: '/projects',
    detail: (id: string | number) => `/projects/${id}`,
  },
  announcements: {
    list: '/announcements',
    detail: (id: string | number) => `/announcements/${id}`,
  },
  reports: {
    generate: '/reports/generate',
  },
  users: {
    list: '/users',
    detail: (id: string | number) => `/users/${id}`,
  },
  auditLogs: {
    list: '/audit-logs',
  },
  settings: {
    config: '/system/config',
  },
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
  },
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  portal: {
    overview: '/portal/overview',
    announcements: '/portal/announcements',
    events: '/portal/events',
    programs: '/portal/programs',
    services: '/portal/services',
    notices: '/portal/notices',
  },
} as const;
