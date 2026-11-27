import { Suspense } from 'react';
import { LoginView } from '@/components/auth/LoginView';
import { TableSkeleton } from '@/components/ui';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bis-bg p-6 flex items-center justify-center">
          <div className="w-full max-w-md">
            <TableSkeleton rows={4} />
          </div>
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
