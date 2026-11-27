'use client';

import Skeleton from '@mui/material/Skeleton';

export function StatCardSkeleton() {
  return (
    <div className="rounded-[10px] border border-bis-border bg-bis-surface p-4 shadow-[var(--bis-shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height={18} />
          <Skeleton variant="text" width="45%" height={34} />
        </div>
        <Skeleton variant="rounded" width={36} height={36} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Skeleton variant="rounded" width={54} height={20} />
        <Skeleton variant="text" width="55%" height={16} />
      </div>
    </div>
  );
}

export function ChartCardSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="rounded-[10px] border border-bis-border bg-bis-surface p-5 shadow-[var(--bis-shadow-sm)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton variant="text" width={180} height={22} />
          <Skeleton variant="text" width={240} height={16} />
        </div>
        <Skeleton variant="rounded" width={96} height={30} />
      </div>
      <Skeleton variant="rounded" width="100%" height={height} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-[10px] border border-bis-border bg-bis-surface p-5 shadow-[var(--bis-shadow-sm)]">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton variant="text" width={200} height={22} />
        <Skeleton variant="rounded" width={120} height={28} />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, idx) => (
          <Skeleton key={idx} variant="rounded" width="100%" height={40} />
        ))}
      </div>
    </div>
  );
}

export function FeedSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="rounded-[10px] border border-bis-border bg-bis-surface p-5 shadow-[var(--bis-shadow-sm)] space-y-3">
      <Skeleton variant="text" width={160} height={22} />
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="flex items-start gap-3 py-1">
          <Skeleton variant="circular" width={28} height={28} />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" width="80%" height={18} />
            <Skeleton variant="text" width="55%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}
