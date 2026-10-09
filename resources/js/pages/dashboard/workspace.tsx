import { Deferred, Head } from '@inertiajs/react';

import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton';
import { GlobalDashboardControls } from '@/features/dashboard/components/global-dashboard-controls';
import { VariantCAnalytical } from '@/features/dashboard/components/variant-c-analytical';
import { useWorkspaceDashboard } from '@/features/dashboard/hooks/use-workspace-dashboard';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

interface WorkspaceDashboardProps {
  dashboardPayload?: NeedsDashboardPayload;
}

export default function WorkspaceDashboard({
  dashboardPayload,
}: WorkspaceDashboardProps) {
  const { hasRole } = usePermission();
  const { state, handlers } = useWorkspaceDashboard(dashboardPayload);

  return (
    <>
      <Head title="Workspace Dashboard" />
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
                  variant="analytical"
                  onGroupSelect={handlers.handleGroupSelect}
                  compareGroupId={state.compareGroupId}
                  onCompareGroupChange={handlers.handleCompareGroupChange}
                />

                <VariantCAnalytical
                  payload={dashboardPayload}
                  defaultTab={
                    hasRole('unit-head') || hasRole('staff')
                      ? 'unit'
                      : 'ringkasan'
                  }
                  compareGroupId={state.compareGroupId}
                />
              </div>
            );
          }}
        </Deferred>
      </div>
    </>
  );
}

WorkspaceDashboard.layout = {
  breadcrumbs: [
    {
      title: 'Workspace Dashboard',
      href: '/dashboard/workspace',
    },
  ],
};
