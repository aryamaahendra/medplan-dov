import { Deferred, Head } from '@inertiajs/react';

import { DashboardContent } from '@/features/dashboard/components/dashboard-content';
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

interface DashboardIndexProps {
  dashboardPayload?: NeedsDashboardPayload;
}

export default function DashboardIndex({
  dashboardPayload,
}: DashboardIndexProps) {
  return (
    <>
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6 p-6">
        <Deferred data="dashboardPayload" fallback={<DashboardSkeleton />}>
          {({ reloading }) => {
            if (!dashboardPayload) {
              return (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">
                    Belum ada data usulan kebutuhan atau siklus belum dipilih.
                  </p>
                </div>
              );
            }

            return (
              <DashboardContent
                payload={dashboardPayload}
                reloading={reloading}
              />
            );
          }}
        </Deferred>
      </div>
    </>
  );
}

DashboardIndex.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
  ],
};
