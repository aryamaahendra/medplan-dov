import { Deferred, Head, router } from '@inertiajs/react';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { GlobalDashboardControls } from '@/pages/need/needs/components/dashboard/global-dashboard-controls';
import { VariantAExecutive } from '@/pages/need/needs/components/dashboard/variant-a-executive';
import { NeedDirectorReviewDialog } from '@/pages/need/needs/components/need-director-review-dialog';
import type { Need } from '@/types';
import type {
  NeedsDashboardPayload,
  DashboardGroupOption,
} from '@/types/needs-dashboard';

interface ExecutiveDashboardProps {
  dashboardPayload?: NeedsDashboardPayload;
}

export default function ExecutiveDashboard({
  dashboardPayload,
}: ExecutiveDashboardProps) {
  const [compareGroupId, setCompareGroupId] = useState<number | null>(null);
  const [reviewingNeed, setReviewingNeed] = useState<Need | null>(null);

  const handleGroupSelect = (group: DashboardGroupOption) => {
    router.visit(
      `/dashboard/executive?need_group_id=${group.id}${compareGroupId ? `&compare_group_id=${compareGroupId}` : ''}`,
      {
        preserveState: true,
      },
    );
  };

  const handleCompareGroupChange = (groupId: number | null) => {
    setCompareGroupId(groupId);
    const currentGroupId = dashboardPayload?.currentGroup?.id;
    router.visit(
      `/dashboard/executive?${currentGroupId ? `need_group_id=${currentGroupId}` : ''}${groupId ? `&compare_group_id=${groupId}` : ''}`,
      { preserveState: true },
    );
  };

  return (
    <>
      <Head title="Executive Dashboard" />
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
                  variant="executive"
                  onGroupSelect={handleGroupSelect}
                  compareGroupId={compareGroupId}
                  onCompareGroupChange={handleCompareGroupChange}
                />

                <VariantAExecutive
                  payload={dashboardPayload}
                  onOpenDirectorReview={(needId) => {
                    // Navigate to detail page for review
                    router.visit(`/needs/${needId}`);
                  }}
                />
              </div>
            );
          }}
        </Deferred>
      </div>

      {reviewingNeed && (
        <NeedDirectorReviewDialog
          need={reviewingNeed}
          open={!!reviewingNeed}
          onOpenChange={(open) => !open && setReviewingNeed(null)}
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
