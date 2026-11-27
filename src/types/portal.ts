import type { StatusTone } from './dashboard';

export type PortalServiceIconName =
  | 'FileCheck2'
  | 'Home'
  | 'HeartHandshake'
  | 'Building2'
  | 'Award'
  | 'BriefcaseBusiness'
  | 'FileText';

export interface PortalAnnouncement {
  id: string;
  slug: string;
  title: string;
  summary: string;
  fullContent: string;
  category:
    | 'Public Advisory'
    | 'Community News'
    | 'Health Advisory'
    | 'Public Notice'
    | 'Emergency Updates'
    | 'General Announcement';
  publishedDate: string;
  priority?: 'Priority' | 'Urgent' | 'Featured';
  imageUrl: string;
  imageAlt: string;
  authorOffice: string;
  featured?: boolean;
}

export interface PortalEvent {
  id: string;
  title: string;
  dateLabel: string;
  monthShort: string;
  dayNumber: string;
  time: string;
  venue: string;
  description: string;
  details: string;
  category:
    | 'Barangay Assembly'
    | 'Community Clean-Up Drive'
    | 'Sports Festival'
    | 'Medical Mission'
    | 'Youth Development Activities'
    | 'Community Seminar';
  imageUrl: string;
  imageAlt: string;
  featured?: boolean;
  isSampleSchedule: boolean;
}

export interface PortalProgram {
  id: string;
  title: string;
  category:
    | 'Health and Wellness'
    | 'Education Assistance'
    | 'Livelihood Development'
    | 'Youth Development'
    | 'Senior Citizen Support'
    | 'PWD Assistance'
    | 'Environmental Programs'
    | 'Disaster Preparedness';
  description: string;
  details: string;
  targetBeneficiaries: string;
  status: 'Ongoing' | 'Enrollment Open' | 'Scheduled' | 'Active Initiative';
  statusTone: StatusTone;
  imageUrl?: string;
  imageAlt?: string;
  spotlight?: boolean;
  scheduleOrContact: string;
}

export interface PortalService {
  id: string;
  name: string;
  icon: PortalServiceIconName;
  shortDescription: string;
  requirementsPreview: string[];
  fullRequirements: string[];
  officeWindow: string;
  processingEstimate: string;
  feeNote: string;
}

export interface PublicNotice {
  id: string;
  title: string;
  category:
    | 'Emergency Advisory'
    | 'Water Interruption'
    | 'Power Interruption'
    | 'Garbage Collection'
    | 'Office Schedule'
    | 'Public Safety';
  summary: string;
  publishedDate: string;
  status: 'Urgent' | 'Active' | 'Scheduled' | 'Updated';
  tone: StatusTone;
  affectedAreas: string;
}

export interface CommunityStatItem {
  id: string;
  label: string;
  value: string;
  context: string;
}

export interface BarangayOfficialPlaceholder {
  id: string;
  position: string;
  namePlaceholder: string;
  committee: string;
}

export interface PortalOverviewData {
  portalName: string;
  barangayName: string;
  locationLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  communityStatsDisclaimer: string;
  communityStats: CommunityStatItem[];
  announcements: PortalAnnouncement[];
  events: PortalEvent[];
  programs: PortalProgram[];
  services: PortalService[];
  notices: PublicNotice[];
  about: {
    storyImageUrl?: string;
    storyImageAlt?: string;
    backgroundPlaceholder: string;
    missionPlaceholder: string;
    visionPlaceholder: string;
    officials: BarangayOfficialPlaceholder[];
    officeLocationPlaceholder: string;
    officeHoursPlaceholder: string;
  };
  contact: {
    addressPlaceholder: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    officeHours: string;
    landmarksPlaceholder: string;
    socialLinks: {
      label: string;
      handlePlaceholder: string;
      href: string;
    }[];
  };
}
