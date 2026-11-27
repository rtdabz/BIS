import { Suspense } from 'react';
import { InventoryModule } from '@/components/modules/inventory/InventoryModule';
import { TableSkeleton } from '@/components/ui';

export default function InventoryPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <InventoryModule />
    </Suspense>
  );
}
