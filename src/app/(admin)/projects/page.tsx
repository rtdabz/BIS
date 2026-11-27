import { Suspense } from 'react';
import { ProjectsModule } from '@/components/modules/projects/ProjectsModule';
import { TableSkeleton } from '@/components/ui';

export default function ProjectsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <ProjectsModule />
    </Suspense>
  );
}
