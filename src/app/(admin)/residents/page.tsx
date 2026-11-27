import { Suspense } from 'react';
import { ResidentsModule } from '@/components/modules/residents/ResidentsModule';
import { TableSkeleton } from '@/components/ui';

export default function ResidentsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <ResidentsModule />
    </Suspense>
  );
}
