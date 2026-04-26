import { Deferred } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCrossGroupCharts } from './dashboard/components/dashboard-cross-group-charts';
import { DashboardDistributionCharts } from './dashboard/components/dashboard-distribution-charts';
import { DashboardGroupsTable } from './dashboard/components/dashboard-groups-table';
import { DashboardHeader } from './dashboard/components/dashboard-header';
import { DashboardLineCharts } from './dashboard/components/dashboard-line-charts';
import { DashboardUnitCharts } from './dashboard/components/dashboard-unit-charts';

interface Group {
  id: number;
  name: string;
  year: number;
}

interface DashboardData {
  id: number;
  name: string;
  year: number;
  total_needs: number;
  total_budget: number;
  priority_needs: number;
  approved_by_director: number;
  avg_completeness: number;
  status_distribution: Record<string, number>;
  needs_by_type: { name: string; count: number }[];
  needs_by_unit: {
    unit_id: number | null;
    name: string;
    parents: string[];
    count: number;
    total_budget: number;
    priority_count: number;
    approved_count: number;
  }[];
}

interface DashboardProps {
  groups: Group[];
  dashboardData?: DashboardData[];
}

export default function Dashboard({ groups, dashboardData }: DashboardProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
    groups.length > 0 ? groups[0].id : null,
  );

  return (
    <>
      <Head title="Dashboard" />
      <div className="flex h-full flex-col gap-6 p-6">
        <DashboardHeader />

        <Deferred
          data="dashboardData"
          fallback={
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))}
              </div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          }
        >
          {({ reloading }) => {
            const data = dashboardData || [];

            if (data.length === 0) {
              return (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-muted-foreground">
                    Belum ada data usulan.
                  </p>
                </div>
              );
            }

            const selectedGroupData = data.find(
              (g) => g.id === selectedGroupId,
            );

            return (
              <div
                className={`flex flex-col gap-6 ${reloading ? 'opacity-50' : ''}`}
              >
                {/* Global Charts across all groups */}
                <DashboardLineCharts data={data} />

                {/* Table summary of all groups */}
                <DashboardGroupsTable data={data} />

                {/* Per group detailed charts */}
                {selectedGroupData && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Detail: {selectedGroupData.name}
                      </h2>
                      <select
                        className="rounded-md border p-2"
                        value={selectedGroupId || ''}
                        onChange={(e) =>
                          setSelectedGroupId(Number(e.target.value))
                        }
                      >
                        {data.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.year})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <DashboardDistributionCharts data={selectedGroupData} />
                    </div>

                    <DashboardUnitCharts data={selectedGroupData} />
                  </div>
                )}

                {/* Cross group advanced charts */}
                <DashboardCrossGroupCharts data={data} />
              </div>
            );
          }}
        </Deferred>
      </div>
    </>
  );
}

Dashboard.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
  ],
};
