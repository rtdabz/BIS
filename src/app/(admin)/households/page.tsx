import { Suspense } from 'react';
import { HouseholdsModule } from '@/components/modules/households/HouseholdsModule';
import { TableSkeleton } from '@/components/ui';

export default function HouseholdsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <HouseholdsModule />
    </Suspense>
  );
}
