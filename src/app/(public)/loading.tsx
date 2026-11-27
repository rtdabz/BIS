'use client';

import Skeleton from '@mui/material/Skeleton';

export default function PublicPortalLoading() {
  return (
    <div className="min-h-screen bg-bis-bg">
      <div className="h-16 border-b border-bis-border bg-bis-surface px-6 flex items-center justify-between">
        <Skeleton variant="rounded" width={200} height={32} />
        <Skeleton variant="rounded" width={140} height={32} />
      </div>
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton variant="rounded" width={220} height={24} />
            <Skeleton variant="text" width="90%" height={48} />
            <Skeleton variant="text" width="75%" height={24} />
            <div className="flex gap-3 pt-2">
              <Skeleton variant="rounded" width={180} height={42} />
              <Skeleton variant="rounded" width={180} height={42} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <Skeleton variant="rounded" width="100%" height={260} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width="100%" height={92} />
          ))}
        </div>
      </div>
    </div>
  );
}
