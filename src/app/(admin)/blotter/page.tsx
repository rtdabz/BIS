import { Suspense } from 'react';
import { BlotterModule } from '@/components/modules/blotter/BlotterModule';
import { TableSkeleton } from '@/components/ui';

export default function BlotterPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <BlotterModule />
    </Suspense>
  );
}
