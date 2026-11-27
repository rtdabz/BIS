import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import AdminLoading from '../loading';

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <DashboardOverview />
    </Suspense>
  );
}
