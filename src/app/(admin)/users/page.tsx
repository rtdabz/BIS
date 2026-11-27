import { Suspense } from 'react';
import { UsersModule } from '@/components/modules/users/UsersModule';
import { TableSkeleton } from '@/components/ui';

export default function UsersPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <UsersModule />
    </Suspense>
  );
}
