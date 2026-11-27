import {
  Accessibility,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FileClock,
  FileText,
  FolderKanban,
  HeartHandshake,
  History,
  Home,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Package,
  Scale,
  Settings,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { StatIconName } from '@/types/dashboard';
import type { NavIconName } from '@/types/navigation';

const NAV_ICON_MAP: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  Users,
  Home,
  UserCheck,
  FileText,
  MessageSquareWarning,
  ShieldAlert,
  CalendarClock,
  Wallet,
  Package,
  FolderKanban,
  Megaphone,
  BarChart3,
  UserCog,
  History,
  Settings,
};

const STAT_ICON_MAP: Record<StatIconName, LucideIcon> = {
  Users,
  Home,
  HeartHandshake,
  Accessibility,
  FileClock,
  ShieldAlert,
  FileText,
  FileCheck2,
  CheckCircle2,
  BarChart3,
  UserCheck,
  Scale,
  Wallet,
  Package,
  FolderKanban,
  Megaphone,
  CalendarClock,
  MessageSquareWarning,
  UserCog,
  History,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
};

export function NavIcon({
  name,
  className = 'h-4 w-4 shrink-0',
}: {
  name: NavIconName;
  className?: string;
}) {
  const Icon = NAV_ICON_MAP[name];
  return <Icon className={className} strokeWidth={1.85} aria-hidden="true" />;
}

export function StatIcon({
  name,
  className = 'h-4.5 w-4.5 shrink-0',
}: {
  name: StatIconName;
  className?: string;
}) {
  const Icon = STAT_ICON_MAP[name];
  return <Icon className={className} strokeWidth={1.85} aria-hidden="true" />;
}
