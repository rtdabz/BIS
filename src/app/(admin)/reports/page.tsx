import { Suspense } from 'react';
import { ReportsModule } from '@/components/modules/reports/ReportsModule';
import { TableSkeleton } from '@/components/ui';

export default function ReportsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <ReportsModule />
    </Suspense>
  );
}
