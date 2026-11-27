import { Suspense } from 'react';
import { ComplaintsModule } from '@/components/modules/complaints/ComplaintsModule';
import { TableSkeleton } from '@/components/ui';

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <ComplaintsModule />
    </Suspense>
  );
}
