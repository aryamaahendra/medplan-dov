import { Deferred, Head, router } from '@inertiajs/react';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';

import { GlobalDashboardControls } from '@/pages/need/needs/components/dashboard/global-dashboard-controls';
import { VariantCAnalytical } from '@/pages/need/needs/components/dashboard/variant-c-analytical';
import type {
  NeedsDashboardPayload,
  DashboardGroupOption,
} from '@/types/needs-dashboard';

interface WorkspaceDashboardProps {
  dashboardPayload?: NeedsDashboardPayload;
}

export default function WorkspaceDashboard({
  dashboardPayload,
}: WorkspaceDashboardProps) {
  const { hasRole } = usePermission();
  const [compareGroupId, setCompareGroupId] = useState<number | null>(null);

  const handleGroupSelect = (group: DashboardGroupOption) => {
    router.visit(
      `/dashboard/workspace?need_group_id=${group.id}${compareGroupId ? `&compare_group_id=${compareGroupId}` : ''}`,
      {
        preserveState: true,
      },
    );
  };

  const handleCompareGroupChange = (groupId: number | null) => {
    setCompareGroupId(groupId);
    const currentGroupId = dashboardPayload?.currentGroup?.id;
    router.visit(
      `/dashboard/workspace?${currentGroupId ? `need_group_id=${currentGroupId}` : ''}${groupId ? `&compare_group_id=${groupId}` : ''}`,
      { preserveState: true },
    );
  };

  return (
    <>
      <Head title="Workspace Dashboard" />
      <div className="flex flex-col gap-6 p-6">
        <Deferred
          data="dashboardPayload"
          fallback={
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
          }
        >
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
                  onGroupSelect={handleGroupSelect}
                  compareGroupId={compareGroupId}
                  onCompareGroupChange={handleCompareGroupChange}
                />

                <VariantCAnalytical
                  payload={dashboardPayload}
                  defaultTab={
                    hasRole('unit-head') || hasRole('staff')
                      ? 'unit'
                      : 'ringkasan'
                  }
                  compareGroupId={compareGroupId}
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
