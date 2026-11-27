import { Suspense } from 'react';
import { SettingsModule } from '@/components/modules/settings/SettingsModule';
import { TableSkeleton } from '@/components/ui';

export default function SettingsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <SettingsModule />
    </Suspense>
  );
}
