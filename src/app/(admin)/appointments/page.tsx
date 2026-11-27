import { Suspense } from 'react';
import { AppointmentsModule } from '@/components/modules/appointments/AppointmentsModule';
import { TableSkeleton } from '@/components/ui';

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <AppointmentsModule />
    </Suspense>
  );
}
