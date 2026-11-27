import type { NavGroupConfig, NavItemConfig } from '@/types/navigation';

export const NAVIGATION_GROUPS: NavGroupConfig[] = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard',
        groupId: 'main',
        groupTitle: 'Main Navigation',
        description:
          'Executive overview of barangay population, transactions, and daily operations.',
        isImplemented: true,
      },
    ],
  },
  {
    id: 'community-records',
    title: 'Community Records',
    items: [
      {
        id: 'residents',
        label: 'Residents',
        href: '/residents',
        icon: 'Users',
        groupId: 'community-records',
        groupTitle: 'Community Records',
        description:
          'Master registry of barangay inhabitants, demographic profiles, and voter status.',
        isImplemented: true,
      },
      {
        id: 'households',
        label: 'Households',
        href: '/households',
        icon: 'Home',
        groupId: 'community-records',
        groupTitle: 'Community Records',
        description:
          'Household tagging across puroks, family heads, and dwelling classifications.',
        isImplemented: true,
      },
      {
        id: 'sectoral-records',
        label: 'Sectoral Records',
        href: '/sectoral-records',
        icon: 'UserCheck',
        groupId: 'community-records',
        groupTitle: 'Community Records',
        description:
          'Senior citizens, PWDs, solo parents, 4Ps beneficiaries, and youth sector registries.',
        isImplemented: true,
      },
    ],
  },
  {
    id: 'transactions',
    title: 'Transactions',
    items: [
      {
        id: 'certificates',
        label: 'Certificates and Clearances',
        href: '/certificates',
        icon: 'FileText',
        groupId: 'transactions',
        groupTitle: 'Transactions',
        description:
          'Issuance and verification of barangay clearances, indigency, residency, and permits.',
        isImplemented: true,
      },
      {
        id: 'complaints',
        label: 'Complaints',
        href: '/complaints',
        icon: 'MessageSquareWarning',
        groupId: 'transactions',
        groupTitle: 'Transactions',
        description:
          'Community grievances, sanitation reports, and front-desk service tickets.',
        isImplemented: true,
      },
      {
        id: 'blotter',
        label: 'Blotter Records',
        href: '/blotter',
        icon: 'ShieldAlert',
        groupId: 'transactions',
        groupTitle: 'Transactions',
        description:
          'Katarungang Pambarangay incident logs, summons, and Lupon mediation schedules.',
        isImplemented: true,
      },
      {
        id: 'appointments',
        label: 'Appointments',
        href: '/appointments',
        icon: 'CalendarClock',
        groupId: 'transactions',
        groupTitle: 'Transactions',
        description:
          'Scheduled resident desk visits, document pickups, and hearing calendars.',
        isImplemented: true,
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    items: [
      {
        id: 'financial',
        label: 'Financial Management',
        href: '/financial',
        icon: 'Wallet',
        groupId: 'administration',
        groupTitle: 'Administration',
        description:
          'Barangay budget tracking, clearance fee collections, and disbursement vouchers.',
        isImplemented: true,
      },
      {
        id: 'inventory',
        label: 'Inventory Management',
        href: '/inventory',
        icon: 'Package',
        groupId: 'administration',
        groupTitle: 'Administration',
        description:
          'Office supplies, disaster response equipment, and barangay property custodian logs.',
        isImplemented: true,
      },
      {
        id: 'projects',
        label: 'Projects and Programs',
        href: '/projects',
        icon: 'FolderKanban',
        groupId: 'administration',
        groupTitle: 'Administration',
        description:
          'Infrastructure projects, health missions, SK programs, and implementation milestones.',
        isImplemented: true,
      },
      {
        id: 'announcements',
        label: 'Announcements',
        href: '/announcements',
        icon: 'Megaphone',
        groupId: 'administration',
        groupTitle: 'Administration',
        description:
          'Public advisories, barangay assembly notices, and emergency bulletins.',
        isImplemented: true,
      },
    ],
  },
  {
    id: 'system-management',
    title: 'System Management',
    items: [
      {
        id: 'reports',
        label: 'Reports and Analytics',
        href: '/reports',
        icon: 'BarChart3',
        groupId: 'system-management',
        groupTitle: 'System Management',
        description:
          'DILG compliance summaries, demographic exports, and transaction analytics.',
        isImplemented: true,
      },
      {
        id: 'users',
        label: 'User Management',
        href: '/users',
        icon: 'UserCog',
        groupId: 'system-management',
        groupTitle: 'System Management',
        description:
          'Barangay officials, staff accounts, and role-based access permissions.',
        isImplemented: true,
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        href: '/audit-logs',
        icon: 'History',
        groupId: 'system-management',
        groupTitle: 'System Management',
        description:
          'Immutable activity trail of record changes, approvals, and document releases.',
        isImplemented: true,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: 'Settings',
        groupId: 'system-management',
        groupTitle: 'System Management',
        description:
          'Barangay profile, official signatories, certificate templates, and API settings.',
        isImplemented: true,
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItemConfig[] = NAVIGATION_GROUPS.flatMap(
  (group) => group.items
);

export function findNavItemByPath(pathname: string): NavItemConfig | undefined {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return ALL_NAV_ITEMS.find((item) => item.href === normalized);
}
