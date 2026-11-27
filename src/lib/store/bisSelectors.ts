import { PUROK_LIST } from '@/data/mock/bisSeedResidents';
import type {
  BisDatabaseState,
  BlotterRecord,
  CertificateRecord,
  ResidentRecord,
} from '@/types/bis';
import type {
  ActivityCategory,
  ActivityFeedItem,
  BarangayProfile,
  CertificateRequestRecord,
  DashboardOverviewData,
  DemographicSlice,
  NotificationItem,
  PendingTransactionItem,
  PeriodStatisticRow,
  RegisteredResidentRecord,
  StaffUser,
} from '@/types/dashboard';

export const DEMO_REFERENCE_DATE = '2026-11-27';

export function formatResidentFullName(r: ResidentRecord): string {
  const middleInitial = r.middleName ? `${r.middleName.charAt(0)}.` : '';
  return [r.firstName, middleInitial, r.lastName, r.suffix]
    .filter(Boolean)
    .join(' ');
}

/**
 * Deterministic age computation relative to DEMO_REFERENCE_DATE for SSR/hydration safety.
 */
export function computeResidentAge(
  birthDate: string,
  referenceDate = DEMO_REFERENCE_DATE
): number {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ry, rm, rd] = referenceDate.split('-').map(Number);
  if (!by || !bm || !bd || !ry || !rm || !rd) return 0;
  let age = ry - by;
  if (rm < bm || (rm === bm && rd < bd)) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function formatPhp(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function isActiveBlotter(record: BlotterRecord): boolean {
  return (
    record.status === 'Filed' ||
    record.status === 'Summons Issued' ||
    record.status === 'Mediation'
  );
}

export function getActiveBlotterMatchesForResident(
  db: BisDatabaseState,
  resident: ResidentRecord
): BlotterRecord[] {
  const full = `${resident.firstName} ${resident.lastName}`.toLowerCase();
  const shortFull = formatResidentFullName(resident).toLowerCase();
  return db.blotterRecords.filter((blt) => {
    if (!isActiveBlotter(blt)) return false;
    if (blt.respondentResidentId && blt.respondentResidentId === resident.id) {
      return true;
    }
    const respLower = blt.respondentName.toLowerCase();
    return respLower.includes(full) || respLower.includes(shortFull);
  });
}

function mapCertificateBucket(requestedAt: string): 'today' | '7d' | '30d' {
  const datePart = requestedAt.slice(0, 10);
  if (datePart === DEMO_REFERENCE_DATE) return 'today';
  if (datePart >= '2026-11-20') return '7d';
  return '30d';
}

function formatShortDate(isoDateTime: string): string {
  const datePart = isoDateTime.slice(0, 10);
  const timePart = isoDateTime.slice(11, 16);
  if (datePart === DEMO_REFERENCE_DATE) {
    return timePart ? `Today, ${timePart}` : 'Today';
  }
  if (datePart === '2026-11-26') {
    return timePart ? `Yesterday, ${timePart}` : 'Yesterday';
  }
  const parsed = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDateTime;
  const label = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return timePart ? `${label} • ${timePart}` : label;
}

function mapAuditToActivityCategory(moduleName: string): ActivityCategory {
  const m = moduleName.toLowerCase();
  if (m.includes('cert')) return 'certificate';
  if (m.includes('resident') || m.includes('household') || m.includes('sectoral')) {
    return 'resident';
  }
  if (m.includes('blotter') || m.includes('complaint')) return 'blotter';
  if (m.includes('announce')) return 'announcement';
  return 'system';
}

function moduleToHref(moduleName: string): string {
  const m = moduleName.toLowerCase();
  if (m.includes('cert')) return '/certificates';
  if (m.includes('resident')) return '/residents';
  if (m.includes('household')) return '/households';
  if (m.includes('sectoral')) return '/sectoral-records';
  if (m.includes('complaint')) return '/complaints';
  if (m.includes('blotter')) return '/blotter';
  if (m.includes('appoint')) return '/appointments';
  if (m.includes('financ')) return '/financial';
  if (m.includes('invent')) return '/inventory';
  if (m.includes('project')) return '/projects';
  if (m.includes('announce')) return '/announcements';
  if (m.includes('user')) return '/users';
  if (m.includes('setting')) return '/settings';
  return '/audit-logs';
}

export function deriveBarangayProfile(db: BisDatabaseState): BarangayProfile {
  return {
    systemName: db.settings.systemName,
    shortName: db.settings.shortName,
    barangayName: db.settings.barangayName,
    municipalityOrCity: db.settings.municipalityOrCity,
    provinceOrRegion: db.settings.provinceOrRegion,
    barangayCode: db.settings.barangayCode,
    punongBarangay: db.settings.signatories.punongBarangay,
    fiscalPeriod: db.settings.fiscalPeriod,
  };
}

export function deriveSidebarBadges(db: BisDatabaseState): Record<string, number | undefined> {
  const pendingCerts = db.certificates.filter(
    (c) => c.status === 'Pending' || c.status === 'For Signature'
  ).length;
  const activeBlotter = db.blotterRecords.filter(isActiveBlotter).length;
  const openComplaints = db.complaints.filter(
    (c) => c.status === 'Open' || c.status === 'Under Review' || c.status === 'Mediation'
  ).length;
  const lowStockCount = db.inventoryItems.filter(
    (i) => i.quantityOnHand <= i.reorderLevel
  ).length;

  return {
    certificates: pendingCerts > 0 ? pendingCerts : undefined,
    blotter: activeBlotter > 0 ? activeBlotter : undefined,
    complaints: openComplaints > 0 ? openComplaints : undefined,
    inventory: lowStockCount > 0 ? lowStockCount : undefined,
  };
}

export function deriveNotifications(db: BisDatabaseState): NotificationItem[] {
  const items: NotificationItem[] = [];

  const pendingCerts = db.certificates.filter(
    (c) => c.status === 'Pending' || c.status === 'For Signature'
  );
  if (pendingCerts.length > 0) {
    items.push({
      id: 'notif-certs',
      title: `${pendingCerts.length} Certificate Request${pendingCerts.length > 1 ? 's' : ''} Pending Action`,
      message: `${pendingCerts[0].residentName} (${pendingCerts[0].documentType}) and ${Math.max(0, pendingCerts.length - 1)} others await review or signature.`,
      timeAgo: 'Live queue',
      category: 'Certificate',
      tone: 'warning',
      read: false,
      href: '/certificates',
    });
  }

  const activeBlotters = db.blotterRecords.filter(isActiveBlotter);
  if (activeBlotters.length > 0) {
    const first = activeBlotters[0];
    items.push({
      id: 'notif-blotter',
      title: `${activeBlotters.length} Active Lupon Blotter Case${activeBlotters.length > 1 ? 's' : ''}`,
      message: `${first.caseNumber} (${first.incidentCategory}) — ${first.nextHearingDate ? `Hearing ${first.nextHearingDate}` : first.status}.`,
      timeAgo: 'Lupon docket',
      category: 'Blotter',
      tone: 'danger',
      read: false,
      href: '/blotter',
    });
  }

  const pendingSectoral = db.sectoralRecords.filter(
    (s) =>
      s.verificationStatus === 'Pending Validation' ||
      s.verificationStatus === 'For Renewal'
  );
  if (pendingSectoral.length > 0) {
    items.push({
      id: 'notif-sectoral',
      title: `${pendingSectoral.length} Sectoral ID${pendingSectoral.length > 1 ? 's' : ''} Need Validation / Renewal`,
      message: 'OSCA, PDAO, Solo Parent, and 4Ps entries flagged for desk review.',
      timeAgo: 'Registry check',
      category: 'Sectoral',
      tone: 'accent',
      read: false,
      href: '/sectoral-records',
    });
  }

  const lowStock = db.inventoryItems.filter(
    (i) => i.quantityOnHand <= i.reorderLevel
  );
  if (lowStock.length > 0) {
    items.push({
      id: 'notif-inventory',
      title: `${lowStock.length} Inventory Item${lowStock.length > 1 ? 's' : ''} Low on Stock`,
      message: `${lowStock[0].name} is at ${lowStock[0].quantityOnHand} ${lowStock[0].unit} (reorder threshold: ${lowStock[0].reorderLevel}).`,
      timeAgo: 'Custodian alert',
      category: 'Inventory',
      tone: 'warning',
      read: true,
      href: '/inventory',
    });
  }

  const pendingAppointments = db.appointments.filter((a) => a.status === 'Pending');
  items.push({
    id: 'notif-appointments',
    title: `${pendingAppointments.length} Pending Desk Appointment${pendingAppointments.length === 1 ? '' : 's'}`,
    message: 'Check scheduled window allocations and walk-in pickups in Appointments.',
    timeAgo: 'Desk schedule',
    category: 'System',
    tone: 'accent',
    read: true,
    href: '/appointments',
  });

  return items;
}

export function deriveDashboardOverview(db: BisDatabaseState): DashboardOverviewData {
  const activeResidents = db.residents.filter((r) => r.status === 'Active');
  const activeHouseholds = db.households.filter((h) => h.status === 'Active');
  const totalPop = activeResidents.length;

  const seniorCount = activeResidents.filter(
    (r) => r.sectoralTags.includes('Senior Citizen') || computeResidentAge(r.birthDate) >= 60
  ).length;
  const pwdCount = activeResidents.filter((r) => r.sectoralTags.includes('PWD')).length;
  const soloParentCount = activeResidents.filter((r) =>
    r.sectoralTags.includes('Solo Parent')
  ).length;
  const fourPsCount = activeResidents.filter((r) =>
    r.sectoralTags.includes('4Ps Beneficiary')
  ).length;
  const voterCount = activeResidents.filter((r) => r.isRegisteredVoter).length;

  const pendingCerts = db.certificates.filter(
    (c) => c.status === 'Pending' || c.status === 'For Signature'
  );
  const approvedCerts = db.certificates.filter((c) => c.status === 'Approved');
  const releasedCerts = db.certificates.filter((c) => c.status === 'Released');
  const activeBlotters = db.blotterRecords.filter(isActiveBlotter);

  const avgHouseholdSize =
    activeHouseholds.length > 0
      ? (totalPop / activeHouseholds.length).toFixed(2)
      : '0';

  const toPercent = (count: number) =>
    totalPop > 0 ? Number(((count / totalPop) * 100).toFixed(1)) : 0;

  // Age groups
  const ageBuckets = { youth: 0, youngAdult: 0, adult: 0, senior: 0 };
  const ageGenderMap = {
    '0–17 yrs': { male: 0, female: 0 },
    '18–35 yrs': { male: 0, female: 0 },
    '36–59 yrs': { male: 0, female: 0 },
    '60+ yrs': { male: 0, female: 0 },
  };

  activeResidents.forEach((r) => {
    const age = computeResidentAge(r.birthDate);
    let key: keyof typeof ageGenderMap = '36–59 yrs';
    if (age <= 17) {
      ageBuckets.youth += 1;
      key = '0–17 yrs';
    } else if (age <= 35) {
      ageBuckets.youngAdult += 1;
      key = '18–35 yrs';
    } else if (age <= 59) {
      ageBuckets.adult += 1;
      key = '36–59 yrs';
    } else {
      ageBuckets.senior += 1;
      key = '60+ yrs';
    }
    if (r.sex === 'Male') {
      ageGenderMap[key].male += 1;
    } else {
      ageGenderMap[key].female += 1;
    }
  });

  const populationByAge: DemographicSlice[] = [
    {
      id: 'age-youth',
      label: 'Youth & Minors (0–17 yrs)',
      count: ageBuckets.youth,
      percentage: toPercent(ageBuckets.youth),
      colorToken: 'var(--bis-chart-tertiary)',
    },
    {
      id: 'age-young-adult',
      label: 'Young Adults (18–35 yrs)',
      count: ageBuckets.youngAdult,
      percentage: toPercent(ageBuckets.youngAdult),
      colorToken: 'var(--bis-chart-primary)',
    },
    {
      id: 'age-adult',
      label: 'Middle Adults (36–59 yrs)',
      count: ageBuckets.adult,
      percentage: toPercent(ageBuckets.adult),
      colorToken: 'var(--bis-chart-secondary)',
    },
    {
      id: 'age-senior',
      label: 'Senior Citizens (60+ yrs)',
      count: ageBuckets.senior,
      percentage: toPercent(ageBuckets.senior),
      colorToken: 'var(--bis-chart-quaternary)',
    },
  ];

  const femaleCount = activeResidents.filter((r) => r.sex === 'Female').length;
  const maleCount = activeResidents.filter((r) => r.sex === 'Male').length;
  const genderSplit: DemographicSlice[] = [
    {
      id: 'gender-female',
      label: 'Female Residents',
      count: femaleCount,
      percentage: toPercent(femaleCount),
      colorToken: 'var(--bis-chart-primary)',
    },
    {
      id: 'gender-male',
      label: 'Male Residents',
      count: maleCount,
      percentage: toPercent(maleCount),
      colorToken: 'var(--bis-chart-secondary)',
    },
  ];

  const populationBySector: DemographicSlice[] = [
    {
      id: 'sector-voters',
      label: 'Registered Voters',
      count: voterCount,
      percentage: toPercent(voterCount),
      colorToken: 'var(--bis-chart-primary)',
    },
    {
      id: 'sector-seniors',
      label: 'Senior Citizens (OSCA)',
      count: seniorCount,
      percentage: toPercent(seniorCount),
      colorToken: 'var(--bis-chart-secondary)',
    },
    {
      id: 'sector-4ps',
      label: '4Ps Beneficiaries',
      count: fourPsCount,
      percentage: toPercent(fourPsCount),
      colorToken: 'var(--bis-chart-tertiary)',
    },
    {
      id: 'sector-solo',
      label: 'Solo Parents',
      count: soloParentCount,
      percentage: toPercent(soloParentCount),
      colorToken: 'var(--bis-chart-quaternary)',
    },
    {
      id: 'sector-pwd',
      label: 'PWD Residents',
      count: pwdCount,
      percentage: toPercent(pwdCount),
      colorToken: 'var(--bis-border-strong)',
    },
  ];

  const purokBreakdown = PUROK_LIST.map((purok) => {
    const pRes = activeResidents.filter((r) => r.purok === purok);
    const pHH = activeHouseholds.filter((h) => h.purok === purok);
    return {
      purok,
      residents: pRes.length,
      households: pHH.length,
      seniors: pRes.filter(
        (r) => r.sectoralTags.includes('Senior Citizen') || computeResidentAge(r.birthDate) >= 60
      ).length,
      pwd: pRes.filter((r) => r.sectoralTags.includes('PWD')).length,
    };
  });

  // Monthly registration & certificate trends derived from registeredAt / requestedAt dates (Jun-Nov 2026)
  const months = [
    { code: '2026-06', label: 'Jun' },
    { code: '2026-07', label: 'Jul' },
    { code: '2026-08', label: 'Aug' },
    { code: '2026-09', label: 'Sep' },
    { code: '2026-10', label: 'Oct' },
    { code: '2026-11', label: 'Nov' },
  ];

  const registrationTrends = months.map((m) => {
    const resCount = activeResidents.filter((r) => r.registeredAt.startsWith(m.code)).length;
    const hhCount = activeHouseholds.filter((h) => h.createdAt.startsWith(m.code)).length;
    const certCount = db.certificates.filter((c) => c.requestedAt.startsWith(m.code)).length;
    const auditCount = db.auditLogs.filter((a) => a.timestamp.startsWith(m.code)).length;
    return {
      month: m.label,
      residents: resCount,
      households: hhCount,
      certificates: certCount,
      updates: auditCount,
    };
  });

  const transactionTrends = months.map((m) => {
    const monthCerts = db.certificates.filter((c) => c.requestedAt.startsWith(m.code));
    const monthBlotters = db.blotterRecords.filter((b) => b.filedAt.startsWith(m.code));
    return {
      period: m.label,
      requested: monthCerts.length,
      approved: monthCerts.filter((c) => c.status === 'Approved' || c.status === 'Released').length,
      released: monthCerts.filter((c) => c.status === 'Released').length,
      blotter: monthBlotters.length,
    };
  });

  // Document breakdown
  const docCountMap = new Map<string, number>();
  db.certificates.forEach((c) => {
    docCountMap.set(c.documentType, (docCountMap.get(c.documentType) ?? 0) + 1);
  });
  const totalCerts = Math.max(1, db.certificates.length);
  const documentBreakdown = Array.from(docCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      count,
      sharePercent: Number(((count / totalCerts) * 100).toFixed(1)),
      avgTurnaround:
        db.settings.certificateFees[type as CertificateRecord['documentType']]
          ?.turnaround ?? 'Same day',
    }));

  // Blotter category breakdown
  const blotterCatMap = new Map<
    string,
    { total: number; settled: number; active: number }
  >();
  db.blotterRecords.forEach((b) => {
    const cur = blotterCatMap.get(b.incidentCategory) ?? {
      total: 0,
      settled: 0,
      active: 0,
    };
    cur.total += 1;
    if (isActiveBlotter(b)) {
      cur.active += 1;
    } else {
      cur.settled += 1;
    }
    blotterCatMap.set(b.incidentCategory, cur);
  });
  const blotterIncidentSummary = Array.from(blotterCatMap.entries()).map(
    ([category, val]) => ({
      category,
      ...val,
    })
  );

  const recentResidents: RegisteredResidentRecord[] = [...activeResidents]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      residentCode: r.residentCode,
      fullName: formatResidentFullName(r),
      age: computeResidentAge(r.birthDate),
      sex: r.sex,
      purok: r.purok,
      sectorTag:
        r.sectoralTags[0] ?? (r.isRegisteredVoter ? 'Registered Voter' : 'General Resident'),
      registeredAt: formatShortDate(r.registeredAt),
      verificationStatus: r.verificationStatus,
    }));

  const recentCertificateRequests: CertificateRequestRecord[] = [...db.certificates]
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      trackingCode: c.trackingCode,
      residentName: c.residentName,
      purok: c.purok,
      documentType: c.documentType,
      purpose: c.purpose,
      requestedAt: formatShortDate(c.requestedAt),
      dateBucket: mapCertificateBucket(c.requestedAt),
      fee: c.isFeeExempt || c.feeAmount === 0 ? 'Exempt' : formatPhp(c.feeAmount),
      status: c.status,
    }));

  const recentActivities: ActivityFeedItem[] = db.auditLogs.slice(0, 6).map((log) => ({
    id: log.id,
    title: `${log.module}: ${log.targetCode}`,
    description: log.summary,
    actor: log.actorName,
    actorRole: log.actorRole,
    timestamp: formatShortDate(log.timestamp),
    category: mapAuditToActivityCategory(log.module),
    href: moduleToHref(log.module),
  }));

  const pendingTransactions: PendingTransactionItem[] = [
    ...pendingCerts.slice(0, 2).map((c) => ({
      id: `pending-${c.id}`,
      referenceNo: c.trackingCode,
      title: `${c.documentType} — ${c.status}`,
      requester: `${c.residentName} (${c.purok})`,
      module: 'Certificates',
      dueLabel: formatShortDate(c.requestedAt),
      priority: (c.status === 'Pending' ? 'Urgent' : 'Due Today') as PendingTransactionItem['priority'],
      statusTone: (c.status === 'Pending' ? 'danger' : 'warning') as PendingTransactionItem['statusTone'],
      href: '/certificates',
    })),
    ...activeBlotters.slice(0, 1).map((b) => ({
      id: `pending-${b.id}`,
      referenceNo: b.caseNumber,
      title: `${b.incidentCategory} (${b.status})`,
      requester: `${b.complainantName} vs ${b.respondentName}`,
      module: 'Blotter Records',
      dueLabel: b.nextHearingDate
        ? `Hearing: ${b.nextHearingDate}`
        : `Filed ${b.filedAt}`,
      priority: 'Due Today' as const,
      statusTone: 'warning' as const,
      href: '/blotter',
    })),
    ...db.appointments
      .filter((a) => a.status === 'Pending' || a.status === 'Approved')
      .slice(0, 1)
      .map((a) => ({
        id: `pending-${a.id}`,
        referenceNo: a.referenceCode,
        title: `${a.serviceType}`,
        requester: `${a.residentName} (${a.purok})`,
        module: 'Appointments',
        dueLabel: `${a.appointmentDate} • ${a.timeSlot}`,
        priority: 'Scheduled' as const,
        statusTone: 'accent' as const,
        href: '/appointments',
      })),
  ];

  const monthlySeries: PeriodStatisticRow[] = months.map((m) => {
    const res = activeResidents.filter((r) => r.registeredAt.startsWith(m.code)).length;
    const hh = activeHouseholds.filter((h) => h.createdAt.startsWith(m.code)).length;
    const certs = db.certificates.filter((c) => c.requestedAt.startsWith(m.code)).length;
    const monthBlotters = db.blotterRecords.filter((b) => b.filedAt.startsWith(m.code));
    const settled = monthBlotters.filter((b) => !isActiveBlotter(b)).length;
    const rate =
      monthBlotters.length > 0
        ? `${((settled / monthBlotters.length) * 100).toFixed(1)}%`
        : '100.0%';
    const fees = db.financialTransactions
      .filter(
        (f) =>
          f.status !== 'Voided' &&
          f.type === 'Income' &&
          f.category === 'Clearance & Permit Fees' &&
          f.transactionDate.startsWith(m.code)
      )
      .reduce((acc, cur) => acc + cur.amountPhp, 0);

    return {
      period: `${m.label} 2026`,
      residentsRegistered: res,
      householdsAdded: hh,
      certificatesIssued: certs,
      blotterSettledRate: rate,
      collectionsPhp: formatPhp(fees),
    };
  });

  const totalBlotters = db.blotterRecords.length;
  const settledBlotters = db.blotterRecords.filter((b) => !isActiveBlotter(b)).length;
  const overallSettlementRate =
    totalBlotters > 0
      ? `${((settledBlotters / totalBlotters) * 100).toFixed(1)}%`
      : '100%';

  const totalCollections2026 = db.financialTransactions
    .filter(
      (f) =>
        f.status !== 'Voided' &&
        f.type === 'Income' &&
        f.category === 'Clearance & Permit Fees'
    )
    .reduce((sum, f) => sum + f.amountPhp, 0);

  const yearlySeries: PeriodStatisticRow[] = [
    {
      period: '2026 (Active Seed)',
      residentsRegistered: activeResidents.length,
      householdsAdded: activeHouseholds.length,
      certificatesIssued: db.certificates.length,
      blotterSettledRate: overallSettlementRate,
      collectionsPhp: formatPhp(totalCollections2026),
    },
  ];

  const stats: DashboardOverviewData['stats'] = [
    {
      id: 'stat-residents',
      label: 'Total Active Residents',
      value: totalPop,
      formattedValue: totalPop.toLocaleString(),
      icon: 'Users',
      changeLabel: `${voterCount} voters`,
      changeContext: `${toPercent(voterCount)}% registered voters`,
      trend: 'up',
      tone: 'success',
      href: '/residents',
    },
    {
      id: 'stat-households',
      label: 'Active Households',
      value: activeHouseholds.length,
      formattedValue: activeHouseholds.length.toLocaleString(),
      icon: 'Home',
      changeLabel: `${avgHouseholdSize} avg`,
      changeContext: 'tagged across 7 puroks',
      trend: 'up',
      tone: 'success',
      href: '/households',
    },
    {
      id: 'stat-seniors',
      label: 'Senior Citizens',
      value: seniorCount,
      formattedValue: seniorCount.toLocaleString(),
      icon: 'HeartHandshake',
      changeLabel: `${toPercent(seniorCount)}%`,
      changeContext: 'of active residents (60+)',
      trend: 'neutral',
      tone: 'accent',
      href: '/sectoral-records',
    },
    {
      id: 'stat-pwd',
      label: 'PWD Residents',
      value: pwdCount,
      formattedValue: pwdCount.toLocaleString(),
      icon: 'Accessibility',
      changeLabel: `${toPercent(pwdCount)}%`,
      changeContext: 'registered in PDAO track',
      trend: 'neutral',
      tone: 'accent',
      href: '/sectoral-records',
    },
    {
      id: 'stat-pending-docs',
      label: 'Pending Document Requests',
      value: pendingCerts.length,
      formattedValue: pendingCerts.length.toLocaleString(),
      icon: 'FileClock',
      changeLabel: `${approvedCerts.length} ready`,
      changeContext: 'awaiting approval/sign-off',
      trend: pendingCerts.length > 0 ? 'up' : 'neutral',
      tone: pendingCerts.length > 0 ? 'warning' : 'accent',
      href: '/certificates',
    },
    {
      id: 'stat-blotter',
      label: 'Active Blotter Cases',
      value: activeBlotters.length,
      formattedValue: activeBlotters.length.toLocaleString(),
      icon: 'ShieldAlert',
      changeLabel: overallSettlementRate,
      changeContext: 'Lupon settlement rate',
      trend: 'neutral',
      tone: activeBlotters.length > 0 ? 'danger' : 'accent',
      href: '/blotter',
    },
  ];

  return {
    lastSyncedLabel: `Derived from live session dataset • ${totalPop} residents`,
    stats,
    registrationTrends,
    populationByAge,
    populationBySector,
    recentCertificateRequests,
    recentActivities,
    pendingTransactions,
    quickActions: [
      {
        id: 'register-resident',
        label: 'Register Resident',
        description: 'Enroll a new resident into the master barangay registry.',
        targetHref: '/residents?action=new',
        shortcut: 'R',
      },
      {
        id: 'add-household',
        label: 'Add Household',
        description: 'Create a household unit and assign purok members.',
        targetHref: '/households?action=new',
        shortcut: 'H',
      },
      {
        id: 'issue-certificate',
        label: 'Issue Certificate',
        description: 'Process Barangay Clearance, Indigency, or Residency.',
        targetHref: '/certificates?action=new',
        shortcut: 'C',
      },
      {
        id: 'record-incident',
        label: 'Record Blotter Case',
        description: 'Log an incident entry or schedule Lupon conciliation.',
        targetHref: '/blotter?action=new',
        shortcut: 'B',
      },
    ],
    residentsTab: {
      stats: stats.slice(0, 4),
      genderSplit,
      ageByGender: Object.entries(ageGenderMap).map(([ageGroup, counts]) => ({
        ageGroup,
        male: counts.male,
        female: counts.female,
        total: counts.male + counts.female,
      })),
      purokBreakdown,
      recentResidents,
    },
    transactionsTab: {
      stats: [
        {
          id: 'tx-pending-requests',
          label: 'Pending Requests',
          value: pendingCerts.length,
          formattedValue: pendingCerts.length.toLocaleString(),
          icon: 'FileClock',
          changeLabel: `${db.certificates.filter((c) => c.status === 'For Signature').length} signature`,
          changeContext: 'awaiting review & sign-off',
          trend: 'up',
          tone: 'warning',
          href: '/certificates',
        },
        {
          id: 'tx-approved-requests',
          label: 'Approved Requests',
          value: approvedCerts.length,
          formattedValue: approvedCerts.length.toLocaleString(),
          icon: 'CheckCircle2',
          changeLabel: 'Ready',
          changeContext: 'for printing & release',
          trend: 'up',
          tone: 'accent',
          href: '/certificates',
        },
        {
          id: 'tx-released-certs',
          label: 'Released Documents',
          value: releasedCerts.length,
          formattedValue: releasedCerts.length.toLocaleString(),
          icon: 'FileCheck2',
          changeLabel: `${Math.round((releasedCerts.length / totalCerts) * 100)}%`,
          changeContext: 'of logged certificate requests',
          trend: 'up',
          tone: 'success',
          href: '/certificates',
        },
      ],
      trends: transactionTrends,
      documentBreakdown,
      recentTransactions: recentCertificateRequests,
    },
    reportsTab: {
      stats: [
        stats[0],
        stats[1],
        {
          id: 'rep-certificates',
          label: 'Total Certificate Requests',
          value: db.certificates.length,
          formattedValue: db.certificates.length.toLocaleString(),
          icon: 'FileCheck2',
          changeLabel: `${releasedCerts.length} released`,
          changeContext: `${pendingCerts.length} pending`,
          trend: 'up',
          tone: 'success',
          href: '/certificates',
        },
        {
          id: 'rep-blotter',
          label: 'Blotter & Incident Cases',
          value: totalBlotters,
          formattedValue: totalBlotters.toLocaleString(),
          icon: 'Scale',
          changeLabel: overallSettlementRate,
          changeContext: `${settledBlotters} resolved • ${activeBlotters.length} active`,
          trend: 'up',
          tone: 'accent',
          href: '/blotter',
        },
      ],
      purokDemographics: purokBreakdown,
      certificateIssuanceSummary: documentBreakdown,
      blotterIncidentSummary,
      incidentTrends: transactionTrends,
      monthlySeries,
      yearlySeries,
    },
  };
}

export function mapStaffAccountToHeaderUser(
  account: BisDatabaseState['users'][number]
): StaffUser {
  return {
    id: account.id,
    fullName: account.fullName,
    initials: account.initials,
    role: account.role,
    department: account.department,
    email: account.email,
  };
}
