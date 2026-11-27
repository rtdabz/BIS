export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

export type StatIconName =
  | 'Users'
  | 'Home'
  | 'HeartHandshake'
  | 'Accessibility'
  | 'FileClock'
  | 'ShieldAlert'
  | 'FileText'
  | 'FileCheck2'
  | 'CheckCircle2'
  | 'BarChart3'
  | 'UserCheck'
  | 'Scale'
  | 'Wallet'
  | 'Package'
  | 'FolderKanban'
  | 'Megaphone'
  | 'CalendarClock'
  | 'MessageSquareWarning'
  | 'UserCog'
  | 'History'
  | 'AlertTriangle'
  | 'TrendingUp'
  | 'TrendingDown';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type DashboardTabId =
  | 'overview'
  | 'residents'
  | 'transactions'
  | 'reports';

export type DateRangePreset = '30d' | '3m' | '6m' | 'ytd';

export interface StatMetric {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  icon: StatIconName;
  changeLabel: string;
  changeContext: string;
  trend: TrendDirection;
  tone: StatusTone;
  href: string;
}

export interface RegistrationTrendPoint {
  month: string;
  residents: number;
  households: number;
  certificates: number;
  updates: number;
}

export interface DemographicSlice {
  id: string;
  label: string;
  count: number;
  percentage: number;
  colorToken: string;
}

export interface AgeGenderPoint {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}

export interface PurokStatPoint {
  purok: string;
  residents: number;
  households: number;
  seniors: number;
  pwd: number;
}

export interface RegisteredResidentRecord {
  id: string;
  residentCode: string;
  fullName: string;
  age: number;
  sex: 'Male' | 'Female';
  purok: string;
  sectorTag: string;
  registeredAt: string;
  verificationStatus: 'Verified' | 'Pending ID' | 'For Renewal';
}

export type CertificateRequestStatus =
  | 'Pending'
  | 'For Signature'
  | 'Approved'
  | 'Released'
  | 'Declined';

export interface CertificateRequestRecord {
  id: string;
  trackingCode: string;
  residentName: string;
  purok: string;
  documentType: string;
  purpose: string;
  requestedAt: string;
  dateBucket: 'today' | '7d' | '30d';
  fee: string;
  status: CertificateRequestStatus;
}

export interface TransactionTrendPoint {
  period: string;
  requested: number;
  approved: number;
  released: number;
  blotter: number;
}

export interface DocumentCategorySummary {
  type: string;
  count: number;
  sharePercent: number;
  avgTurnaround: string;
}

export interface BlotterCategorySummary {
  category: string;
  total: number;
  settled: number;
  active: number;
}

export interface PeriodStatisticRow {
  period: string;
  residentsRegistered: number;
  householdsAdded: number;
  certificatesIssued: number;
  blotterSettledRate: string;
  collectionsPhp: string;
}

export type ActivityCategory =
  | 'certificate'
  | 'resident'
  | 'blotter'
  | 'announcement'
  | 'system';

export interface ActivityFeedItem {
  id: string;
  title: string;
  description: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  category: ActivityCategory;
  href?: string;
}

export type TransactionPriority = 'Urgent' | 'Due Today' | 'Scheduled';

export interface PendingTransactionItem {
  id: string;
  referenceNo: string;
  title: string;
  requester: string;
  module: string;
  dueLabel: string;
  priority: TransactionPriority;
  statusTone: StatusTone;
  href: string;
}

export type QuickActionId =
  | 'register-resident'
  | 'add-household'
  | 'issue-certificate'
  | 'record-incident';

export interface QuickActionItem {
  id: QuickActionId;
  label: string;
  description: string;
  targetHref: string;
  shortcut: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  category: 'Certificate' | 'Blotter' | 'Sectoral' | 'Inventory' | 'System';
  tone: StatusTone;
  read: boolean;
  href: string;
}

export interface BarangayProfile {
  systemName: string;
  shortName: string;
  barangayName: string;
  municipalityOrCity: string;
  provinceOrRegion: string;
  barangayCode: string;
  punongBarangay: string;
  fiscalPeriod: string;
}

export interface StaffUser {
  id: string;
  fullName: string;
  initials: string;
  role: string;
  department: string;
  email: string;
}

export interface ResidentsTabData {
  stats: StatMetric[];
  genderSplit: DemographicSlice[];
  ageByGender: AgeGenderPoint[];
  purokBreakdown: PurokStatPoint[];
  recentResidents: RegisteredResidentRecord[];
}

export interface TransactionsTabData {
  stats: StatMetric[];
  trends: TransactionTrendPoint[];
  documentBreakdown: DocumentCategorySummary[];
  recentTransactions: CertificateRequestRecord[];
}

export interface ReportsAnalyticsTabData {
  stats: StatMetric[];
  purokDemographics: PurokStatPoint[];
  certificateIssuanceSummary: DocumentCategorySummary[];
  blotterIncidentSummary: BlotterCategorySummary[];
  incidentTrends?: TransactionTrendPoint[];
  monthlySeries: PeriodStatisticRow[];
  yearlySeries: PeriodStatisticRow[];
}

export interface DashboardOverviewData {
  stats: StatMetric[];
  registrationTrends: RegistrationTrendPoint[];
  populationByAge: DemographicSlice[];
  populationBySector: DemographicSlice[];
  recentCertificateRequests: CertificateRequestRecord[];
  recentActivities: ActivityFeedItem[];
  pendingTransactions: PendingTransactionItem[];
  quickActions: QuickActionItem[];
  residentsTab: ResidentsTabData;
  transactionsTab: TransactionsTabData;
  reportsTab: ReportsAnalyticsTabData;
  lastSyncedLabel: string;
}
