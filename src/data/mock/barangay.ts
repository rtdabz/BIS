import type { BarangayProfile, NotificationItem, StaffUser } from '@/types/dashboard';

export const BARANGAY_PROFILE: BarangayProfile = {
  systemName: 'Barangay Information System',
  shortName: 'BIS',
  barangayName: process.env.NEXT_PUBLIC_BARANGAY_NAME ?? 'Barangay Cebole',
  municipalityOrCity:
    process.env.NEXT_PUBLIC_BARANGAY_LOCATION ?? 'Quezon, Bukidnon',
  provinceOrRegion: 'Bukidnon • Northern Mindanao (Region X)',
  barangayCode: 'PSGC — Pending Sync',
  punongBarangay: 'Hon. Roberto M. Magbanua',
  fiscalPeriod: 'FY 2026 • Q4',
};

export const CURRENT_STAFF_USER: StaffUser = {
  id: 'usr-sec-001',
  fullName: 'Maria Elena Santos',
  initials: 'MS',
  role: 'Barangay Secretary',
  department: 'Office of the Sangguniang Barangay',
  email: 'm.santos@cebole-quezon.gov.ph',
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: '6 Certificate Requests Ready for Review',
    message:
      'Urgent Barangay Clearances and Indigency Certificates submitted at Window 1 await verification.',
    timeAgo: '8 mins ago',
    category: 'Certificate',
    tone: 'warning',
    read: false,
    href: '/certificates',
  },
  {
    id: 'notif-002',
    title: 'Lupon Mediation Scheduled at 2:00 PM',
    message:
      'Case #BLT-2026-019 (Purok 3 boundary dispute) is queued at Session Hall B.',
    timeAgo: '32 mins ago',
    category: 'Blotter',
    tone: 'danger',
    read: false,
    href: '/blotter',
  },
  {
    id: 'notif-003',
    title: 'Senior Citizen Masterlist Synced',
    message:
      '14 newly approved OSCA registrations from Purok 2 and Purok 5 were added to Sectoral Records.',
    timeAgo: '2 hours ago',
    category: 'Sectoral',
    tone: 'success',
    read: false,
    href: '/sectoral-records',
  },
  {
    id: 'notif-004',
    title: 'Barangay ID Card Stock Low',
    message:
      'Blank PVC ID card stock dropped below 120 units. Reorder request drafted in Inventory.',
    timeAgo: '5 hours ago',
    category: 'Inventory',
    tone: 'warning',
    read: true,
    href: '/inventory',
  },
  {
    id: 'notif-005',
    title: 'DILG Monthly Accomplishment Report',
    message:
      'November 2026 operations summary is ready for export before the Nov 30 deadline.',
    timeAgo: 'Yesterday',
    category: 'System',
    tone: 'accent',
    read: true,
    href: '/reports',
  },
];
