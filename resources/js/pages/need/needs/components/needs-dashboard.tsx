import { Deferred } from '@inertiajs/react';
import { useState, useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import type {
  DashboardVariant,
  NeedsDashboardPayload,
} from '@/types/needs-dashboard';

import { GlobalDashboardControls } from './dashboard/global-dashboard-controls';
import { VariantAExecutive } from './dashboard/variant-a-executive';
import { VariantBOperations } from './dashboard/variant-b-operations';
import { VariantCAnalytical } from './dashboard/variant-c-analytical';

interface NeedsDashboardProps {
  dashboardPayload?: NeedsDashboardPayload;
  stats?: any;
  statusDistribution?: Record<string, number>;
  needsByUnit?: any[];
  needsByType?: any[];
  onOpenDirectorReview?: (needId: number) => void;
  onOpenLockDialog?: (needId: number, mode: 'lock' | 'unlock') => void;
}

export function NeedsDashboard({
  dashboardPayload,
  onOpenDirectorReview,
  onOpenLockDialog,
}: NeedsDashboardProps) {
  const { hasRole } = usePermission();

  // Role default variant:
  // - Director -> Executive
  // - Planner / SuperAdmin -> Operations
  // - UnitHead / Staff -> Analytical (with My Unit tab default)
  const defaultVariant: DashboardVariant = useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('needs-dashboard-variant');

      if (
        saved === 'executive' ||
        saved === 'operations' ||
        saved === 'analytical'
      ) {
        return saved;
      }
    }

    if (hasRole('director')) {
      return 'executive';
    }

    if (hasRole('planner') || hasRole('super-admin')) {
      return 'operations';
    }

    return 'analytical';
  }, [hasRole]);

  const [currentVariant, setCurrentVariant] =
    useState<DashboardVariant>(defaultVariant);
  const [compareGroupId, setCompareGroupId] = useState<number | null>(null);

  const handleVariantChange = (variant: DashboardVariant) => {
    setCurrentVariant(variant);

    if (typeof window !== 'undefined') {
      localStorage.setItem('needs-dashboard-variant', variant);
    }
  };

  return (
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
          return null;
        }

        return (
          <div
            className={cn(
              'flex flex-col gap-6',
              reloading && 'opacity-60 transition-opacity',
            )}
          >
            {/* Global Controls & Variant Switcher */}
            <GlobalDashboardControls
              currentGroup={dashboardPayload.currentGroup}
              availableGroups={dashboardPayload.availableGroups}
              variant={currentVariant}
              onVariantChange={handleVariantChange}
              compareGroupId={compareGroupId}
              onCompareGroupChange={setCompareGroupId}
            />

            {/* Render Variant According to Selection */}
            {currentVariant === 'executive' && (
              <VariantAExecutive
                payload={dashboardPayload}
                onOpenDirectorReview={onOpenDirectorReview}
              />
            )}

            {currentVariant === 'operations' && (
              <VariantBOperations
                payload={dashboardPayload}
                onOpenLockDialog={onOpenLockDialog}
              />
            )}

            {currentVariant === 'analytical' && (
              <VariantCAnalytical
                payload={dashboardPayload}
                defaultTab={
                  hasRole('unit-head') || hasRole('staff')
                    ? 'myunit'
                    : 'overview'
                }
              />
            )}
          </div>
        );
      }}
    </Deferred>
  );
}
