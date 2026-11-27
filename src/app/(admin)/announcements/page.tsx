import { Suspense } from 'react';
import { AnnouncementsModule } from '@/components/modules/announcements/AnnouncementsModule';
import { TableSkeleton } from '@/components/ui';

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <AnnouncementsModule />
    </Suspense>
  );
}
