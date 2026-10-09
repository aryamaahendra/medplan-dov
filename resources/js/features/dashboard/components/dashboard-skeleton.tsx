import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-12 w-full animate-pulse rounded-xl bg-muted/30" />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
