import { Deferred } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from './dashboard/components/dashboard-header';
import { DashboardLineCharts } from './dashboard/components/dashboard-line-charts';

interface DashboardData {
  id: number;
  name: string;
  year: number;
  total_needs: number;
  total_budget: number;
  priority_needs: number;
  approved_by_director: number;
  avg_completeness: number;
}

interface DashboardProps {
  dashboardData?: DashboardData[];
}

export default function Dashboard({ dashboardData }: DashboardProps) {
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
            if (!dashboardData || dashboardData.length === 0) {
              return (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-muted-foreground">
                    Belum ada data usulan.
                  </p>
                </div>
              );
            }

            const data = dashboardData;

            return (
              <div
                className={`flex flex-col gap-6 ${reloading ? 'opacity-50' : ''}`}
              >
                {/* Global Charts across all groups */}
                <DashboardLineCharts data={data} />
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
