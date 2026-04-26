import { Deferred } from '@inertiajs/react';

import { DistributionChart } from '@/components/dashboard/distribution-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NeedsStats } from './needs-stats';

interface NeedsDashboardProps {
  stats?: {
    total_needs: number;
    total_budget: number;
    priority_needs: number;
    avg_completeness: number;
  };
  statusDistribution: Record<string, number>;
  needsByUnit: { name: string; count: number }[];
  needsByType: { name: string; count: number }[];
}

export function NeedsDashboard({
  stats,
  statusDistribution,
  needsByUnit,
  needsByType,
}: NeedsDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <Deferred
        data={['stats', 'statusDistribution', 'needsByUnit', 'needsByType']}
        fallback={
          <div className="flex flex-col gap-6">
            <NeedsStats />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        }
      >
        {({ reloading }) => (
          <div className={cn('flex flex-col gap-6', reloading && 'opacity-50')}>
            <NeedsStats stats={stats} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <DistributionChart
                title="Distribusi Status"
                data={statusDistribution}
                color="bg-blue-500"
              />
              <DistributionChart
                title="Top 10 Unit Pengusul"
                data={needsByUnit}
                color="bg-indigo-500"
              />
              <DistributionChart
                title="Berdasarkan Tipe"
                data={needsByType}
                color="bg-purple-500"
              />
            </div>
          </div>
        )}
      </Deferred>
    </div>
  );
}
