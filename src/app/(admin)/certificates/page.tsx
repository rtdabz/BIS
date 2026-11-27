import { Suspense } from 'react';
import { CertificatesModule } from '@/components/modules/certificates/CertificatesModule';
import { TableSkeleton } from '@/components/ui';

export default function CertificatesPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <CertificatesModule />
    </Suspense>
  );
}
