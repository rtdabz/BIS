export type NavIconName =
  | 'LayoutDashboard'
  | 'Users'
  | 'Home'
  | 'UserCheck'
  | 'FileText'
  | 'MessageSquareWarning'
  | 'ShieldAlert'
  | 'CalendarClock'
  | 'Wallet'
  | 'Package'
  | 'FolderKanban'
  | 'Megaphone'
  | 'BarChart3'
  | 'UserCog'
  | 'History'
  | 'Settings';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: NavIconName;
  groupId: string;
  groupTitle: string;
  description: string;
  badge?: string | number;
  isImplemented?: boolean;
}

export interface NavGroupConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}
