import { Suspense } from 'react';
import { SectoralRecordsModule } from '@/components/modules/sectoral/SectoralRecordsModule';
import { TableSkeleton } from '@/components/ui';

export default function SectoralRecordsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <SectoralRecordsModule />
    </Suspense>
  );
}
