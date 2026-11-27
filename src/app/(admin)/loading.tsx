import {
  ChartCardSkeleton,
  FeedSkeleton,
  StatCardSkeleton,
  TableSkeleton,
} from '@/components/ui';

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <ChartCardSkeleton height={260} />
        </div>
        <div className="xl:col-span-5">
          <ChartCardSkeleton height={260} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <TableSkeleton rows={5} />
        </div>
        <div className="xl:col-span-4">
          <FeedSkeleton items={4} />
        </div>
      </div>
    </div>
  );
}
