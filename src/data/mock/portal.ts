import type { PortalOverviewData } from '@/types/portal';

/**
 * Sample portal content and replaceable placeholder data for the public
 * Barangay Community Information Portal.
 * Separated from UI components for future Laravel REST API integration.
 */
export const MOCK_PORTAL_OVERVIEW: PortalOverviewData = {
  portalName: 'Barangay Information System',
  barangayName: process.env.NEXT_PUBLIC_BARANGAY_NAME ?? 'Barangay Cebole',
  locationLabel:
    process.env.NEXT_PUBLIC_BARANGAY_LOCATION ?? 'Quezon, Bukidnon',
  heroTitle:
    'Community updates, local programs, and public services in one portal.',
  heroSubtitle:
    'Stay informed on barangay advisories, community assemblies, sectoral programs, and walk-in document requirements.',
  heroImageUrl: '/images/portal/hero-barangay-hall.jpg',
  heroImageAlt:
    'Exterior facade and landscaped plaza of the Barangay Hall service center',
  communityStatsDisclaimer:
    'Sample figures shown for portal preview — live counts sync once connected to the barangay registry.',
  communityStats: [
    {
      id: 'portal-stat-residents',
      label: 'Registered Residents',
      value: '14,892',
      context: 'Sample registry count',
    },
    {
      id: 'portal-stat-households',
      label: 'Recorded Households',
      value: '3,640',
      context: 'Sample purok household count',
    },
    {
      id: 'portal-stat-programs',
      label: 'Community Programs',
      value: '8',
      context: 'Active resident support tracks',
    },
    {
      id: 'portal-stat-services',
      label: 'Front-Desk Services',
      value: '6',
      context: 'Walk-in document & clearance tracks',
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      slug: 'q4-barangay-assembly-and-community-consultation',
      title: 'Q4 Barangay Assembly & FY 2027 Budget Consultation',
      summary:
        'Residents and sectoral leaders are invited to review public safety, health, and infrastructure plans.',
      fullContent:
        'Join the Sangguniang Barangay on December 6 at the Multi-Purpose Covered Court to review quarterly financial reports, upcoming neighborhood infrastructure projects, and community safety initiatives. Open forum registration starts at 8:30 AM.',
      category: 'Public Advisory',
      publishedDate: 'Nov 26, 2026',
      priority: 'Featured',
      imageUrl: '/images/portal/announcement-assembly.jpg',
      imageAlt:
        'Residents gathered inside the barangay multi-purpose hall for a community consultation',
      authorOffice: 'Office of the Barangay Secretary',
      featured: true,
    },
    {
      id: 'ann-2',
      slug: 'mobile-health-and-immunization-schedule',
      title: 'Barangay Health Station Weekly Immunization & Check-Up Hours',
      summary:
        'Morning schedules for pediatric immunization, blood pressure screening, and maternal check-ups.',
      fullContent:
        'The Barangay Health Center opens Tuesday and Thursday mornings from 8:00 AM to 11:30 AM for child immunization, prenatal check-ups, and senior citizen blood pressure monitoring.',
      category: 'Health Advisory',
      publishedDate: 'Nov 24, 2026',
      priority: 'Priority',
      imageUrl: '',
      imageAlt: 'Barangay health station schedule',
      authorOffice: 'Barangay Health Center',
    },
    {
      id: 'ann-3',
      slug: 'livelihood-and-digital-skills-orientation',
      title: 'Community Livelihood & Youth Digital Literacy Batch Opening',
      summary:
        'Pre-registration is now open for basic spreadsheet, resume writing, and small-business workshops.',
      fullContent:
        'In coordination with the SK Council and Livelihood Desk, residents aged 18–35 and micro-entrepreneurs may pre-register at Window 2 with a valid ID and proof of residency.',
      category: 'Community News',
      publishedDate: 'Nov 22, 2026',
      imageUrl: '',
      imageAlt: 'Community livelihood and digital literacy update',
      authorOffice: 'Committee on Livelihood & Youth',
    },
    {
      id: 'ann-4',
      slug: 'drrmc-rainy-season-preparedness-checklist',
      title: 'Monsoon Preparedness & Household Emergency Hotline Reminder',
      summary:
        'Clear roof gutters, prepare emergency go-bags, and check your designated purok evacuation center.',
      fullContent:
        'Residents in low-lying alleys are advised to keep 72-hour emergency kits ready and save the 24/7 Barangay DRRM Operations Desk hotline during heavy rainfall advisories.',
      category: 'Emergency Updates',
      publishedDate: 'Nov 20, 2026',
      priority: 'Urgent',
      imageUrl: '',
      imageAlt: 'Emergency preparedness bulletin',
      authorOffice: 'Barangay DRRM Committee',
    },
    {
      id: 'ann-5',
      slug: 'year-end-business-clearance-renewal-reminder',
      title: 'Early Guidelines for Year-End Business Clearance Renewals',
      summary:
        'Checklist for store owners and micro-enterprises preparing annual barangay clearance documents.',
      fullContent:
        'Prepare your previous year clearance, lease contract or land title, and updated DTI/SEC copy before visiting Window 3 to avoid January renewal queues.',
      category: 'Public Notice',
      publishedDate: 'Nov 18, 2026',
      imageUrl: '',
      imageAlt: 'Barangay business clearance desk notice',
      authorOffice: 'Clearance & Permits Desk',
    },
    {
      id: 'ann-6',
      slug: 'osca-senior-citizen-record-updating',
      title: 'Quarterly Updating of Senior Citizen & PWD Masterlists',
      summary:
        'Walk-in validation schedule for new senior citizen IDs and annual sectoral directory verification.',
      fullContent:
        'Senior citizens and persons with disabilities may validate household records every Wednesday at the Sectoral Affairs Window to keep OSCA and PDAO referrals up to date.',
      category: 'General Announcement',
      publishedDate: 'Nov 15, 2026',
      imageUrl: '',
      imageAlt: 'Sectoral updating announcement',
      authorOffice: 'Sectoral Affairs Desk',
    },
  ],
  events: [
    {
      id: 'evt-1',
      title: 'Semi-Annual Barangay Assembly',
      dateLabel: 'December 6, 2026',
      monthShort: 'DEC',
      dayNumber: '06',
      time: '9:00 AM – 11:30 AM',
      venue: 'Barangay Multi-Purpose Covered Court',
      description:
        'Open community meeting covering financial transparency reports, public safety updates, and resident Q&A.',
      details:
        'Sample calendar entry. Attendance sheets, printed agenda handouts, and seat priority for senior citizens open 30 minutes before program start.',
      category: 'Barangay Assembly',
      imageUrl: '',
      imageAlt: 'Barangay assembly community hall gathering',
      featured: true,
      isSampleSchedule: true,
    },
    {
      id: 'evt-2',
      title: 'Neighborhood Clean-Up & Canal Declogging Drive',
      dateLabel: 'December 12, 2026',
      monthShort: 'DEC',
      dayNumber: '12',
      time: '6:30 AM – 9:30 AM',
      venue: 'Purok 1 to Purok 7 Street Clusters',
      description:
        'Morning cleanup and waste segregation activity led by street sweepers and purok volunteers.',
      details:
        'Volunteers meet at designated purok staging points. Cleaning gloves, brooms, and biodegradable sacks are distributed on site.',
      category: 'Community Clean-Up Drive',
      imageUrl: '',
      imageAlt: 'Community clean-up drive schedule',
      isSampleSchedule: true,
    },
    {
      id: 'evt-3',
      title: 'Community Medical & Dental Check-Up Mission',
      dateLabel: 'December 15, 2026',
      monthShort: 'DEC',
      dayNumber: '15',
      time: '8:00 AM – 2:00 PM',
      venue: 'Barangay Health Center Grounds',
      description:
        'Free basic medical consultations, blood sugar checks, and dental assessments for residents.',
      details:
        'Bring your Barangay ID or Health Center card for priority queuing. Senior citizens and expectant mothers receive early morning slots.',
      category: 'Medical Mission',
      imageUrl: '',
      imageAlt: 'Community medical mission schedule',
      isSampleSchedule: true,
    },
    {
      id: 'evt-4',
      title: 'Youth Digital Literacy & Career Workshop',
      dateLabel: 'December 19, 2026',
      monthShort: 'DEC',
      dayNumber: '19',
      time: '1:00 PM – 4:30 PM',
      venue: 'Barangay Learning & SK Center',
      description:
        'Hands-on session on resume building, First-Time Jobseeker benefits, and office productivity tools.',
      details:
        'Organized by the SK Council for youth aged 15–24. Participants should bring a valid school or barangay ID.',
      category: 'Youth Development Activities',
      imageUrl: '',
      imageAlt: 'Youth workshop learning schedule entry',
      isSampleSchedule: true,
    },
    {
      id: 'evt-5',
      title: 'Inter-Purok Community Sports Festival',
      dateLabel: 'December 21, 2026',
      monthShort: 'DEC',
      dayNumber: '21',
      time: '3:00 PM – 7:00 PM',
      venue: 'Barangay Sports Complex',
      description:
        'Neighborhood basketball and volleyball exhibitions encouraging youth sportsmanship across all puroks.',
      details:
        'Team rosters and match schedules are coordinated through the SK Sports Committee prior to opening day.',
      category: 'Sports Festival',
      imageUrl: '',
      imageAlt: 'Community sports festival schedule',
      isSampleSchedule: true,
    },
    {
      id: 'evt-6',
      title: 'Household Disaster Preparedness & First Aid Seminar',
      dateLabel: 'January 9, 2027',
      monthShort: 'JAN',
      dayNumber: '09',
      time: '9:00 AM – 12:00 NN',
      venue: 'Barangay Session Hall',
      description:
        'Practical training on basic first aid, fire safety, and household earthquake drill procedures.',
      details:
        'Led by certified BDRRMC responders. Open to household representatives, school staff, and purok coordinators.',
      category: 'Community Seminar',
      imageUrl: '',
      imageAlt: 'Community preparedness seminar schedule',
      isSampleSchedule: true,
    },
  ],
  programs: [
    {
      id: 'prog-livelihood',
      title: 'Community Livelihood & Skills Training',
      category: 'Livelihood Development',
      description:
        'Vocational workshops, micro-enterprise mentoring, and digital productivity sessions supporting household income.',
      details:
        'Provides TESDA referral endorsements, starter business orientation, and fee-exempt jobseeker clearance guidance at Window 2.',
      targetBeneficiaries: 'Unemployed adults & micro-entrepreneurs',
      status: 'Enrollment Open',
      statusTone: 'accent',
      imageUrl: '/images/portal/program-livelihood-youth.jpg',
      imageAlt: 'Residents attending a community livelihood and digital training session',
      spotlight: true,
      scheduleOrContact: 'Livelihood Desk • Tue & Thu',
    },
    {
      id: 'prog-disaster',
      title: 'Barangay Disaster Preparedness & Response',
      category: 'Disaster Preparedness',
      description:
        'Purok early warning systems, emergency kit readiness, and community evacuation drills led by BDRRMC volunteers.',
      details:
        'Maintains monsoon flood monitoring, rescue equipment readiness, and 24/7 radio coordination across all seven puroks.',
      targetBeneficiaries: 'All barangay households & responders',
      status: 'Active Initiative',
      statusTone: 'warning',
      imageUrl: '',
      imageAlt: 'Barangay disaster preparedness operations desk',
      spotlight: true,
      scheduleOrContact: 'BDRRMC Operations Post • 24/7 Duty',
    },
    {
      id: 'prog-health',
      title: 'Primary Health & Maternal Wellness Clinic',
      category: 'Health and Wellness',
      description:
        'Weekly maternal check-ups, child immunizations, nutrition tracking, and blood pressure clinics.',
      details:
        'Coordinated by Barangay Health Workers and visiting municipal clinicians at the Barangay Health Center.',
      targetBeneficiaries: 'Infants, mothers & general residents',
      status: 'Ongoing',
      statusTone: 'accent',
      scheduleOrContact: 'Health Center • Mon–Fri, 8:00 AM – 12:00 NN',
    },
    {
      id: 'prog-education',
      title: 'Educational Assistance & Tutorial Hub',
      category: 'Education Assistance',
      description:
        'Scholarship endorsements, school supply drives, and weekend reading sessions for local students.',
      details:
        'Helps indigent learners secure municipal scholarship certifications and free access to study tables.',
      targetBeneficiaries: 'Elementary to college students',
      status: 'Scheduled',
      statusTone: 'warning',
      scheduleOrContact: 'Education Desk • Semestral Intake',
    },
    {
      id: 'prog-youth',
      title: 'SK Youth Leadership & Sports Development',
      category: 'Youth Development',
      description:
        'Youth civic assemblies, digital workshops, and inter-purok sports clinics organized with the SK Council.',
      details:
        'Supports Katipunan ng Kabataan leadership training, mental wellness talks, and safe athletic leagues.',
      targetBeneficiaries: 'Youth ages 15–24 years old',
      status: 'Ongoing',
      statusTone: 'accent',
      scheduleOrContact: 'SK Office • Saturdays, 1:00 PM – 5:00 PM',
    },
    {
      id: 'prog-senior',
      title: 'Senior Citizen Care & OSCA Coordination',
      category: 'Senior Citizen Support',
      description:
        'Priority front-desk lanes, OSCA ID assistance, and quarterly social pension verification.',
      details:
        'Ensures senior citizens receive express assistance for certifications and quarterly medical outreach updates.',
      targetBeneficiaries: 'Registered senior citizens (60+ yrs)',
      status: 'Ongoing',
      statusTone: 'accent',
      scheduleOrContact: 'Senior Affairs Window • Mon–Fri',
    },
    {
      id: 'prog-pwd',
      title: 'PWD Inclusion & PDAO Referral Desk',
      category: 'PWD Assistance',
      description:
        'Assistance for PWD ID renewals, assistive device requests, and priority counter lanes.',
      details:
        'Coordinates directly with the city Persons with Disability Affairs Office for mobility and medical referrals.',
      targetBeneficiaries: 'Persons with Disabilities & caregivers',
      status: 'Ongoing',
      statusTone: 'accent',
      scheduleOrContact: 'Sectoral Desk • Mon–Fri',
    },
    {
      id: 'prog-environment',
      title: 'Zero-Waste Segregation & Urban Greening',
      category: 'Environmental Programs',
      description:
        'Household waste sorting drives, materials recovery pickups, and purok tree-planting activities.',
      details:
        'Promotes scheduled recyclable collection and clean waterways in partnership with local homeowner groups.',
      targetBeneficiaries: 'Households, schools & local shops',
      status: 'Active Initiative',
      statusTone: 'warning',
      scheduleOrContact: 'MRF & Sanitation Desk • Weekly',
    },
  ],
  services: [
    {
      id: 'svc-clearance',
      name: 'Barangay Clearance',
      icon: 'FileCheck2',
      shortDescription:
        'Standard clearance for local employment, NBI or police applications, postal IDs, and general verification.',
      requirementsPreview: [
        'Valid government ID or Barangay ID',
        'Personal appearance at Window 1',
        'Current Community Tax Certificate (Cedula)',
      ],
      fullRequirements: [
        'Original valid government-issued ID showing current barangay address',
        'Personal appearance of the applicant at the Barangay Hall Records Counter',
        'Current-year Community Tax Certificate (Cedula) or official receipt',
        'Note: Walk-in processing only; proceed to Window 1 during office hours.',
      ],
      officeWindow: 'Window 1 — Records Desk',
      processingEstimate: 'Same-day release (15–30 mins)',
      feeNote: 'Standard ordinance fee (free for RA 11261 First-Time Jobseekers)',
    },
    {
      id: 'svc-residency',
      name: 'Certificate of Residency',
      icon: 'Home',
      shortDescription:
        'Official certification confirming your current residential address and duration of stay in the barangay.',
      requirementsPreview: [
        'Valid ID or recent utility billing statement',
        'Purok verification or homeowner attestation',
        'Completed request slip at front desk',
      ],
      fullRequirements: [
        'Valid government, school, or company ID with local address',
        'Recent utility bill, lease contract, or homeowner endorsement for tenants',
        'Minimum 6 months verified residency in the barangay registry',
      ],
      officeWindow: 'Window 1 — Records Desk',
      processingEstimate: 'Same-day release after verification',
      feeNote: 'Standard barangay certification fee per local ordinance',
    },
    {
      id: 'svc-indigency',
      name: 'Certificate of Indigency',
      icon: 'HeartHandshake',
      shortDescription:
        'Fee-exempt certification for residents seeking medical, educational, burial, or DSWD AICS assistance.',
      requirementsPreview: [
        'Valid ID of applicant or representative',
        'Hospital, school, or DSWD referral slip',
        'Brief household record verification',
      ],
      fullRequirements: [
        'Valid ID of requesting resident (or signed authorization if represented)',
        'Supporting hospital bill, medical abstract, school endorsement, or DSWD slip',
        'Verification against Barangay Household & Sectoral Registry',
      ],
      officeWindow: 'Window 2 — Sectoral Desk',
      processingEstimate: 'Priority same-day release (15–20 mins)',
      feeNote: 'Fee-exempt (No charge for indigency certifications)',
    },
    {
      id: 'svc-business',
      name: 'Business Clearance',
      icon: 'Building2',
      shortDescription:
        'Barangay endorsement required prior to city business permit registration or annual store renewal.',
      requirementsPreview: [
        'DTI or SEC registration copy',
        'Lease contract or property ownership proof',
        'Store location sketch & inspection check',
      ],
      fullRequirements: [
        'DTI Business Name Registration (sole proprietorship) or SEC Articles',
        'Contract of Lease or Transfer Certificate of Title (if owned)',
        'Previous year Barangay Business Clearance (for renewals)',
        'On-site safety and sanitation compliance check when required',
      ],
      officeWindow: 'Window 3 — Permits Desk',
      processingEstimate: '1–2 working days (with inspection)',
      feeNote: 'Assessed by business category and capitalization bracket',
    },
    {
      id: 'svc-good-moral',
      name: 'Certificate of Good Moral Character',
      icon: 'Award',
      shortDescription:
        'Community standing attestation for scholarship grants, employment onboarding, and school enrollment.',
      requirementsPreview: [
        'Valid government or school ID',
        'Internal Lupon & blotter record check',
        'Name of requesting school or employer',
      ],
      fullRequirements: [
        'Valid government-issued ID or current school ID',
        'Internal Lupon Tagapamayapa / Blotter record check handled at desk',
        'Official name of requesting school, employer, or government agency',
      ],
      officeWindow: 'Window 1 — Records Desk',
      processingEstimate: 'Same-day release after clearance check',
      feeNote: 'Standard fee (exempt for qualified scholarships & RA 11261)',
    },
    {
      id: 'svc-other-docs',
      name: 'Special Documents & Certifications',
      icon: 'FileText',
      shortDescription:
        'Includes First-Time Jobseeker Certificates (RA 11261), Solo Parent endorsements, and Barangay IDs.',
      requirementsPreview: [
        'Valid ID + oath of undertaking (RA 11261)',
        'Supporting sectoral or incident records',
        'In-person filing at Window 2',
      ],
      fullRequirements: [
        'Valid identification and supporting proof specific to requested certification',
        'For First-Time Jobseeker (RA 11261): Signed Oath of Undertaking at counter',
        'For Solo Parent / OSCA / PDAO referrals: Relevant sectoral validation documents',
      ],
      officeWindow: 'Window 2 — Special Desk',
      processingEstimate: 'Same-day to 1 working day',
      feeNote: 'RA 11261 First-Time Jobseeker documents are strictly free',
    },
  ],
  notices: [
    {
      id: 'notice-1',
      title: 'Monsoon Readiness & 24/7 Emergency Hotline',
      category: 'Emergency Advisory',
      summary:
        'Keep household drainage clear and report rising street water directly to the Barangay DRRM duty desk.',
      publishedDate: 'Nov 27, 2026',
      status: 'Urgent',
      tone: 'danger',
      affectedAreas: 'Low-lying purok alleys',
    },
    {
      id: 'notice-2',
      title: 'Overnight Water Pipeline Maintenance Window',
      category: 'Water Interruption',
      summary:
        'Expect lower water pressure from 10:00 PM to 4:00 AM during scheduled valve servicing. Store drinking water early.',
      publishedDate: 'Nov 25, 2026',
      status: 'Scheduled',
      tone: 'warning',
      affectedAreas: 'Zone A & Zone B (10:00 PM – 4:00 AM)',
    },
    {
      id: 'notice-3',
      title: 'Morning Power Line Clearing & Tree Trimming',
      category: 'Power Interruption',
      summary:
        'Brief feeder shutdown along Main Avenue for preventative branch clearing before heavy weather.',
      publishedDate: 'Nov 24, 2026',
      status: 'Scheduled',
      tone: 'warning',
      affectedAreas: 'Main Avenue Feeder Corridor',
    },
    {
      id: 'notice-4',
      title: 'Weekly Curbside Waste Segregation Schedule',
      category: 'Garbage Collection',
      summary:
        'Biodegradable waste picked up Mon/Wed/Fri (6:00 AM); recyclables Tue/Thu/Sat. Place sealed bins outside by 5:30 AM.',
      publishedDate: 'Nov 20, 2026',
      status: 'Active',
      tone: 'accent',
      affectedAreas: 'All Puroks (1 to 7)',
    },
    {
      id: 'notice-5',
      title: 'Barangay Hall Counter & Releasing Hours',
      category: 'Office Schedule',
      summary:
        'Document filing and releases run Monday to Friday, 8:00 AM – 5:00 PM (Window 1 stays open through noon).',
      publishedDate: 'Nov 18, 2026',
      status: 'Updated',
      tone: 'neutral',
      affectedAreas: 'Barangay Hall Front Desk',
    },
    {
      id: 'notice-6',
      title: 'Nightly Barangay Tanod Foot Patrol & Streetlight Reporting',
      category: 'Public Safety',
      summary:
        'Neighborhood foot patrols begin at 10:00 PM nightly. Report busted streetlamps directly to the duty outpost.',
      publishedDate: 'Nov 16, 2026',
      status: 'Active',
      tone: 'accent',
      affectedAreas: 'All Residential Streets',
    },
  ],
  about: {
    backgroundPlaceholder:
      'Committed to transparent local governance, Barangay Cebole serves households across seven puroks with orderly civil records, neighborhood safety patrols, and inclusive health and livelihood support.',
    missionPlaceholder:
      'Deliver transparent, courteous, and timely front-desk services, proactive neighborhood safety, and accessible community welfare programs.',
    visionPlaceholder:
      'A safe, resilient, and well-informed barangay community empowered by accurate digital public records and active resident participation.',
    officials: [
      {
        id: 'off-1',
        position: 'Punong Barangay',
        namePlaceholder: '[Punong Barangay Name — Placeholder]',
        committee: 'Executive & Overall Barangay Administration',
      },
      {
        id: 'off-2',
        position: 'Barangay Kagawad',
        namePlaceholder: '[Kagawad Name — Placeholder]',
        committee: 'Health, Sanitation & Environmental Care',
      },
      {
        id: 'off-3',
        position: 'Barangay Kagawad',
        namePlaceholder: '[Kagawad Name — Placeholder]',
        committee: 'Peace, Order & Public Safety',
      },
      {
        id: 'off-4',
        position: 'Barangay Kagawad',
        namePlaceholder: '[Kagawad Name — Placeholder]',
        committee: 'Education, Livelihood & Social Services',
      },
      {
        id: 'off-5',
        position: 'Barangay Secretary',
        namePlaceholder: '[Secretary Name — Placeholder]',
        committee: 'Records Secretariat & Clearances',
      },
      {
        id: 'off-6',
        position: 'Barangay Treasurer',
        namePlaceholder: '[Treasurer Name — Placeholder]',
        committee: 'Treasury, Collections & Budget',
      },
      {
        id: 'off-7',
        position: 'SK Chairperson',
        namePlaceholder: '[SK Chairperson Name — Placeholder]',
        committee: 'Sangguniang Kabataan & Youth Programs',
      },
    ],
    officeLocationPlaceholder:
      '[Barangay Hall Street Address, Barangay Cebole, Quezon, Bukidnon — Placeholder]',
    officeHoursPlaceholder:
      'Monday – Friday, 8:00 AM – 5:00 PM • Saturday Duty Desk: 8:00 AM – 12:00 NN',
  },
  contact: {
    addressPlaceholder:
      '[Barangay Hall Street Address, Barangay Cebole, Quezon, Bukidnon — Placeholder]',
    phonePlaceholder: '(02) 8000-0000 / 0900-000-0000 (Placeholder)',
    emailPlaceholder: 'office@barangay-portal.example.gov.ph (Placeholder)',
    officeHours:
      'Mon–Fri, 8:00 AM – 5:00 PM (Walk-In Desk) • 24/7 Emergency Outpost',
    landmarksPlaceholder:
      '[Adjacent to Barangay Covered Court and Public Elementary School — Placeholder Landmark]',
    socialLinks: [
      {
        label: 'Official Facebook Page',
        handlePlaceholder: '@BarangayCeboleOfficial',
        href: '#contact',
      },
      {
        label: 'Community Bulletin Feed',
        handlePlaceholder: 'Public Advisory Stream',
        href: '#announcements',
      },
    ],
  },
};
