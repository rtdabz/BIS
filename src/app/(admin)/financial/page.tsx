import { Suspense } from 'react';
import { FinancialModule } from '@/components/modules/financial/FinancialModule';
import { TableSkeleton } from '@/components/ui';

export default function FinancialPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <FinancialModule />
    </Suspense>
  );
}
