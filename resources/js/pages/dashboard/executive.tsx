import { Deferred, Head, router } from '@inertiajs/react';

import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton';
import { GlobalDashboardControls } from '@/features/dashboard/components/global-dashboard-controls';
import { VariantAExecutive } from '@/features/dashboard/components/variant-a-executive';
import { useExecutiveDashboard } from '@/features/dashboard/hooks/use-executive-dashboard';
import { DirectorReviewDialog } from '@/features/need/director-review';
import { cn } from '@/lib/utils';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

interface ExecutiveDashboardProps {
  dashboardPayload?: NeedsDashboardPayload;
}

export default function ExecutiveDashboard({
  dashboardPayload,
}: ExecutiveDashboardProps) {
  const { state, handlers } = useExecutiveDashboard(dashboardPayload);

  return (
    <>
      <Head title="Executive Dashboard" />
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
                  variant="executive"
                  onGroupSelect={handlers.handleGroupSelect}
                  compareGroupId={state.compareGroupId}
                  onCompareGroupChange={handlers.handleCompareGroupChange}
                />

                <VariantAExecutive
                  payload={dashboardPayload}
                  onOpenDirectorReview={(needId) => {
                    router.visit(`/needs/${needId}`);
                  }}
                />
              </div>
            );
          }}
        </Deferred>
      </div>

      {state.reviewingNeed && (
        <DirectorReviewDialog
          need={state.reviewingNeed}
          open={!!state.reviewingNeed}
          onOpenChange={(open) => !open && handlers.setReviewingNeed(null)}
        />
      )}
    </>
  );
}

ExecutiveDashboard.layout = {
  breadcrumbs: [
    {
      title: 'Executive Dashboard',
      href: '/dashboard/executive',
    },
  ],
};
