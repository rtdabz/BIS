export type PurokName =
  | 'Purok 1'
  | 'Purok 2'
  | 'Purok 3'
  | 'Purok 4'
  | 'Purok 5'
  | 'Purok 6'
  | 'Purok 7';

export type SexOption = 'Male' | 'Female';
export type CivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated';

export type SectorCategory =
  | 'Senior Citizen'
  | 'PWD'
  | 'Solo Parent'
  | '4Ps Beneficiary'
  | 'Youth / KK';

export interface ResidentRecord {
  id: string;
  residentCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;
  birthDate: string; // YYYY-MM-DD
  sex: SexOption;
  civilStatus: CivilStatus;
  purok: PurokName;
  addressLine: string;
  householdId?: string;
  contactNumber: string;
  email?: string;
  occupation: string;
  isRegisteredVoter: boolean;
  voterPrecinct?: string;
  residencyStartYear: number;
  sectoralTags: SectorCategory[];
  verificationStatus: 'Verified' | 'Pending ID' | 'For Renewal';
  status: 'Active' | 'Archived';
  archivedReason?: string;
  archivedAt?: string;
  registeredAt: string; // YYYY-MM-DD
  notes?: string;
}

export type DwellingType =
  | 'Owned House'
  | 'Rented Unit'
  | 'Shared Dwelling'
  | 'Informal Structure';

export interface HouseholdRecord {
  id: string;
  householdCode: string;
  purok: PurokName;
  addressLine: string;
  dwellingType: DwellingType;
  waterSource: string;
  toiletFacility: string;
  monthlyIncomeEstimatePhp: number;
  is4PsHousehold: boolean;
  headResidentId: string;
  memberIds: string[];
  memberRoles: Record<string, string>;
  status: 'Active' | 'Archived';
  createdAt: string;
  notes?: string;
}

export type SectoralVerificationStatus =
  | 'Verified'
  | 'Pending Validation'
  | 'For Renewal'
  | 'Inactive';

export interface SectoralRecord {
  id: string;
  recordCode: string;
  residentId: string;
  sector: SectorCategory;
  sectorIdNumber: string;
  classificationDetail: string;
  verificationStatus: SectoralVerificationStatus;
  validUntil?: string;
  assistanceNotes?: string;
  enrolledAt: string;
}

export type CertificateDocumentType =
  | 'Barangay Clearance'
  | 'Certificate of Indigency'
  | 'Certificate of Residency'
  | 'Business Permit Clearance'
  | 'Certificate of Good Moral Character'
  | 'First-Time Jobseeker (RA 11261)'
  | 'Solo Parent Certification';

export type CertificateWorkflowStatus =
  | 'Pending'
  | 'For Signature'
  | 'Approved'
  | 'Released'
  | 'Declined';

export interface CertificateHistoryEntry {
  timestamp: string;
  action: string;
  actor: string;
  note?: string;
}

export interface CertificateRecord {
  id: string;
  trackingCode: string;
  residentId: string;
  residentName: string;
  purok: PurokName;
  documentType: CertificateDocumentType;
  purpose: string;
  businessName?: string;
  orNumber?: string;
  feeAmount: number;
  isFeeExempt: boolean;
  status: CertificateWorkflowStatus;
  requestedAt: string;
  approvedBy?: string;
  releasedAt?: string;
  declineReason?: string;
  remarks?: string;
  validUntil?: string;
  history: CertificateHistoryEntry[];
}

export type ComplaintCategory =
  | 'Sanitation & Waste'
  | 'Noise Disturbance'
  | 'Neighborhood Dispute'
  | 'Public Safety & Streetlights'
  | 'Ordinance Violation'
  | 'Service Feedback';

export type ComplaintStatus =
  | 'Open'
  | 'Under Review'
  | 'Mediation'
  | 'Resolved'
  | 'Escalated to Blotter'
  | 'Dismissed';

export interface ComplaintTimelineEntry {
  timestamp: string;
  status: string;
  actor: string;
  note: string;
}

export interface ComplaintRecord {
  id: string;
  ticketNumber: string;
  complainantResidentId?: string;
  complainantName: string;
  complainantContact: string;
  respondentName: string;
  purok: PurokName;
  category: ComplaintCategory;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  subject: string;
  description: string;
  assignedTo: string;
  status: ComplaintStatus;
  resolutionNotes?: string;
  escalatedBlotterId?: string;
  filedAt: string;
  updatedAt: string;
  timeline: ComplaintTimelineEntry[];
}

export type BlotterIncidentCategory =
  | 'Boundary / Property Dispute'
  | 'Noise & Curfew Ordinance'
  | 'Financial / Debt Conciliation'
  | 'Domestic & Minor Altercations'
  | 'Trespassing / Damage'
  | 'Other Lupon Matter';

export type BlotterStatus =
  | 'Filed'
  | 'Summons Issued'
  | 'Mediation'
  | 'Amicably Settled'
  | 'CFA Issued'
  | 'Dismissed';

export interface BlotterProceedingEntry {
  date: string;
  action: string;
  officer: string;
  notes: string;
}

export interface BlotterRecord {
  id: string;
  caseNumber: string;
  complainantResidentId?: string;
  complainantName: string;
  respondentResidentId?: string;
  respondentName: string;
  purok: PurokName;
  incidentCategory: BlotterIncidentCategory;
  incidentDate: string;
  incidentLocation: string;
  narrative: string;
  presidingOfficer: string;
  nextHearingDate?: string;
  hearingVenue?: string;
  status: BlotterStatus;
  settlementTerms?: string;
  filedAt: string;
  updatedAt: string;
  proceedings: BlotterProceedingEntry[];
}

export type AppointmentServiceType =
  | 'Document Pickup'
  | 'Barangay Clearance Filing'
  | 'Lupon Consultation'
  | 'OSCA / PDAO Validation'
  | 'Punong Barangay Audience'
  | 'Business Permit Inspection';

export type AppointmentStatus =
  | 'Pending'
  | 'Approved'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled';

export interface AppointmentRecord {
  id: string;
  referenceCode: string;
  residentId?: string;
  residentName: string;
  contactNumber: string;
  purok: PurokName;
  serviceType: AppointmentServiceType;
  windowAssigned: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;
  purpose: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export type FinancialEntryType = 'Income' | 'Expense';

export type FinancialCategory =
  | 'Clearance & Permit Fees'
  | 'IRA / NTA Allotment'
  | 'Real Property Tax Share'
  | 'Grants & Subsidies'
  | 'Other Local Revenue'
  | 'Personal Services / Honoraria'
  | 'MOOE & Office Operations'
  | 'Infrastructure & Capital Outlay'
  | 'DRRM & Disaster Relief'
  | 'Health & Social Welfare'
  | 'SK & Youth Fund';

export interface FinancialTransactionRecord {
  id: string;
  referenceNo: string;
  type: FinancialEntryType;
  category: FinancialCategory;
  description: string;
  payeeOrPayer: string;
  amountPhp: number;
  transactionDate: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Check' | 'Bank Transfer' | 'Treasury Deposit';
  orOrVoucherNo: string;
  recordedBy: string;
  status: 'Posted' | 'Pending Verification' | 'Voided';
  voidReason?: string;
  linkedCertificateId?: string;
}

export type InventoryCategory =
  | 'Office Supplies'
  | 'DRRM & Rescue'
  | 'Medical & Health'
  | 'IT & Identification'
  | 'Maintenance & Sanitation';

export interface InventoryItemRecord {
  id: string;
  itemCode: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCostPhp: number;
  storageLocation: string;
  custodian: string;
  condition: 'Good' | 'Fair' | 'Needs Inspection';
  lastUpdated: string;
  notes?: string;
}

export interface InventoryMovementRecord {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment';
  quantity: number;
  previousQty: number;
  newQty: number;
  reference: string;
  actor: string;
  remarks: string;
  timestamp: string;
}

export type ProjectCategory =
  | 'Infrastructure'
  | 'Health & Wellness'
  | 'Livelihood & Skills'
  | 'Disaster Preparedness'
  | 'Youth & Education'
  | 'Environment & Sanitation';

export type ProjectStatus = 'Planned' | 'Ongoing' | 'On Hold' | 'Completed';

export interface ProjectMilestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

export interface BarangayProjectRecord {
  id: string;
  projectCode: string;
  title: string;
  category: ProjectCategory;
  leadCommittee: string;
  startDate: string;
  targetEndDate: string;
  allocatedBudgetPhp: number;
  utilizedBudgetPhp: number;
  progressPercent: number;
  status: ProjectStatus;
  location: string;
  description: string;
  beneficiaryResidentIds: string[];
  beneficiarySummary: string;
  milestones: ProjectMilestone[];
}

export type AnnouncementCategory =
  | 'Public Advisory'
  | 'Health Advisory'
  | 'Emergency Updates'
  | 'Community News'
  | 'Public Notice'
  | 'General Announcement';

export type AnnouncementStatus = 'Published' | 'Draft' | 'Scheduled' | 'Archived';

export interface AnnouncementAttachment {
  name: string;
  sizeLabel: string;
  type: string;
}

export interface AnnouncementRecord {
  id: string;
  code: string;
  title: string;
  category: AnnouncementCategory;
  priority: 'Standard' | 'Priority' | 'Urgent' | 'Featured';
  status: AnnouncementStatus;
  summary: string;
  content: string;
  authorOffice: string;
  publishedDate: string; // YYYY-MM-DD
  expiresAt?: string;
  showOnPublicPortal: boolean;
  attachments: AnnouncementAttachment[];
}

export type StaffRole =
  | 'Punong Barangay'
  | 'Barangay Secretary'
  | 'Barangay Treasurer'
  | 'Records Clerk'
  | 'Lupon Chair'
  | 'SK Chairperson';

export type ModuleKey =
  | 'dashboard'
  | 'residents'
  | 'households'
  | 'sectoral'
  | 'certificates'
  | 'complaints'
  | 'blotter'
  | 'appointments'
  | 'financial'
  | 'inventory'
  | 'projects'
  | 'announcements'
  | 'reports'
  | 'users'
  | 'auditLogs'
  | 'settings';

export type PermissionLevel = 'manage' | 'view' | 'none';

export type ModulePermissionMap = Record<ModuleKey, PermissionLevel>;

export interface StaffAccountRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  initials: string;
  username: string;
  email: string;
  demoPassword: string;
  role: StaffRole;
  department: string;
  contactNumber: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLoginAt: string;
  permissions: ModulePermissionMap;
}

export type AuditActionType =
  | 'Create'
  | 'Update'
  | 'Approve'
  | 'Release'
  | 'Archive'
  | 'Restore'
  | 'Void'
  | 'Stock Move'
  | 'Publish'
  | 'Login'
  | 'Logout'
  | 'Settings';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  module: string;
  action: AuditActionType;
  targetCode: string;
  summary: string;
  details?: string;
}

export interface CertificateFeeConfig {
  feePhp: number;
  turnaround: string;
  exemptEligible: boolean;
}

export interface BarangaySettingsRecord {
  systemName: string;
  shortName: string;
  barangayName: string;
  municipalityOrCity: string;
  provinceOrRegion: string;
  barangayCode: string;
  officeAddress: string;
  contactPhone: string;
  contactEmail: string;
  officeHours: string;
  fiscalPeriod: string;
  signatories: {
    punongBarangay: string;
    barangaySecretary: string;
    barangayTreasurer: string;
    luponChair: string;
  };
  certificateFees: Record<CertificateDocumentType, CertificateFeeConfig>;
  requireBlotterCheckForClearance: boolean;
  enablePublicPortalSync: boolean;
}

export interface BisDatabaseState {
  residents: ResidentRecord[];
  households: HouseholdRecord[];
  sectoralRecords: SectoralRecord[];
  certificates: CertificateRecord[];
  complaints: ComplaintRecord[];
  blotterRecords: BlotterRecord[];
  appointments: AppointmentRecord[];
  financialTransactions: FinancialTransactionRecord[];
  inventoryItems: InventoryItemRecord[];
  inventoryMovements: InventoryMovementRecord[];
  projects: BarangayProjectRecord[];
  announcements: AnnouncementRecord[];
  users: StaffAccountRecord[];
  auditLogs: AuditLogEntry[];
  settings: BarangaySettingsRecord;
}
