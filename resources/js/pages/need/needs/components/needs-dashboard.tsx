import { Deferred } from '@inertiajs/react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NeedsStats } from './needs-stats';
import { UnitStatCard } from './unit-stat-card';

interface NeedsDashboardProps {
  stats?: {
    total_needs: number;
    total_budget: number;
    priority_needs: number;
    avg_completeness: number;
    approved_by_director: number;
    prev_group: { id: number; name: string } | null;
    prev_total_needs: number | null;
    prev_total_budget: number | null;
    prev_priority_needs: number | null;
    prev_avg_completeness: number | null;
    prev_approved_by_director: number | null;
  };
  statusDistribution: Record<string, number>;
  needsByUnit: {
    unit_id: number | null;
    name: string;
    parents: string[];
    count: number;
    total_budget: number;
    priority_count: number;
    approved_count: number;
  }[];
  needsByType: { name: string; count: number }[];
}

export function NeedsDashboard({ stats, needsByUnit }: NeedsDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <Deferred
        data={['stats', 'statusDistribution', 'needsByUnit', 'needsByType']}
        fallback={
          <div className="flex flex-col gap-6">
            <NeedsStats />
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        }
      >
        {({ reloading }) => (
          <div className={cn('flex flex-col gap-6', reloading && 'opacity-50')}>
            <NeedsStats stats={stats} />

            <div className="">
              {needsByUnit.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada data usulan per unit.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {needsByUnit.map((unit, i) => (
                    <UnitStatCard
                      key={unit.unit_id ?? i}
                      name={unit.name}
                      parents={unit.parents}
                      count={unit.count}
                      totalBudget={unit.total_budget}
                      priorityCount={unit.priority_count}
                      approvedCount={unit.approved_count}
                      total={
                        stats?.total_needs ??
                        needsByUnit.reduce((a, u) => a + u.count, 0)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Deferred>
    </div>
  );
}
