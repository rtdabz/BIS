'use client';

import * as React from 'react';
import type { PortalAnnouncement, PortalOverviewData } from '@/types/portal';
import { PortalMotionProvider } from './motion';
import { AboutSection } from './AboutSection';
import { AnnouncementsSection } from './AnnouncementsSection';
import { CommunityStatsStrip } from './CommunityStatsStrip';
import { ContactSection } from './ContactSection';
import { EventsSection } from './EventsSection';
import { HeroSection } from './HeroSection';
import { ProgramsSection } from './ProgramsSection';
import { PublicFooter } from './PublicFooter';
import { PublicHeader } from './PublicHeader';
import { PublicNoticesSection } from './PublicNoticesSection';
import { ServicesSection } from './ServicesSection';

export interface PublicPortalViewProps {
  data: PortalOverviewData;
}

/**
 * Complete public Barangay Community Information Portal landing page
 * separated from the administrative dashboard layout.
 */
export function PublicPortalView({ data }: PublicPortalViewProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    React.useState<PortalAnnouncement | null>(null);

  const featuredAnnouncement =
    data.announcements.find((item) => item.featured) ?? data.announcements[0];

  return (
    <PortalMotionProvider>
      <div className="min-h-screen flex flex-col bg-bis-bg text-bis-text">
      <PublicHeader
        barangayName={data.barangayName}
        locationLabel={data.locationLabel}
      />

      <main className="flex-1">
        <HeroSection
          barangayName={data.barangayName}
          locationLabel={data.locationLabel}
          title={data.heroTitle}
          subtitle={data.heroSubtitle}
          imageUrl={data.heroImageUrl}
          imageAlt={data.heroImageAlt}
          featuredAnnouncement={featuredAnnouncement}
          onInspectAnnouncement={setSelectedAnnouncement}
        />

        <CommunityStatsStrip
          stats={data.communityStats}
          disclaimer={data.communityStatsDisclaimer}
        />

        <PublicNoticesSection notices={data.notices} />

        <AnnouncementsSection
          announcements={data.announcements}
          selectedAnnouncement={selectedAnnouncement}
          onSelectAnnouncement={setSelectedAnnouncement}
        />

        <EventsSection events={data.events} />

        <ProgramsSection programs={data.programs} />

        <ServicesSection services={data.services} />

        <AboutSection barangayName={data.barangayName} about={data.about} />

        <ContactSection
          barangayName={data.barangayName}
          contact={data.contact}
        />
      </main>

        <PublicFooter data={data} />
      </div>
    </PortalMotionProvider>
  );
}
