import { Suspense } from 'react';
import { AuditLogsModule } from '@/components/modules/audit-logs/AuditLogsModule';
import { TableSkeleton } from '@/components/ui';

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <AuditLogsModule />
    </Suspense>
  );
}
