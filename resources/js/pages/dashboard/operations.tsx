import { Deferred, Head, router } from '@inertiajs/react';

import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton';
import { GlobalDashboardControls } from '@/features/dashboard/components/global-dashboard-controls';
import { VariantBOperations } from '@/features/dashboard/components/variant-b-operations';
import { useOperationsDashboard } from '@/features/dashboard/hooks/use-operations-dashboard';
import { cn } from '@/lib/utils';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

interface OperationsDashboardProps {
  dashboardPayload?: NeedsDashboardPayload;
}

export default function OperationsDashboard({
  dashboardPayload,
}: OperationsDashboardProps) {
  const { state, handlers } = useOperationsDashboard(dashboardPayload);

  return (
    <>
      <Head title="Operations Dashboard" />
      <div className="flex flex-col gap-6 p-6">
        <Deferred data="dashboardPayload" fallback={<DashboardSkeleton />}>
          {({ reloading }) => {
            if (!dashboardPayload) {
              return (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-muted-foreground">
                    Belum ada data usulan kebutuhan.
                  </p>
                </div>
              );
            }

            return (
              <div
                className={cn(
                  'flex flex-col gap-6',
                  reloading && 'opacity-60 transition-opacity',
                )}
              >
                <GlobalDashboardControls
                  currentGroup={dashboardPayload.currentGroup}
                  availableGroups={dashboardPayload.availableGroups}
                  variant="operations"
                  onGroupSelect={handlers.handleGroupSelect}
                  compareGroupId={state.compareGroupId}
                  onCompareGroupChange={handlers.handleCompareGroupChange}
                />

                <VariantBOperations
                  payload={dashboardPayload}
                  onOpenLockDialog={(needId) => {
                    router.visit(`/needs/${needId}`);
                  }}
                />
              </div>
            );
          }}
        </Deferred>
      </div>
    </>
  );
}

OperationsDashboard.layout = {
  breadcrumbs: [
    {
      title: 'Operations Dashboard',
      href: '/dashboard/operations',
    },
  ],
};
