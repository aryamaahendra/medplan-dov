import {
  RiPieChartLine,
  RiMoneyDollarCircleLine,
  RiTargetLine,
  RiGitCommitLine,
  RiBuildingLine,
  RiFilterOffLine,
} from '@remixicon/react';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

import { AnalyticalSliceBar } from './analytical/analytical-slice-bar';
import { INITIAL_SLICE_STATE } from './analytical/analytical-types';
import type {
  AnalyticalTabKey,
  SlicedMetrics,
  SliceState,
} from './analytical/analytical-types';
import { TabAlur } from './analytical/tab-alur';
import { TabAnggaran } from './analytical/tab-anggaran';
import { TabKeselarasan } from './analytical/tab-keselarasan';
import { TabRingkasan } from './analytical/tab-ringkasan';
import { TabUnit } from './analytical/tab-unit';

interface VariantCProps {
  payload: NeedsDashboardPayload;
  defaultTab?: AnalyticalTabKey;
  compareGroupId?: number | null;
}

export function VariantCAnalytical({
  payload,
  defaultTab,
  compareGroupId,
}: VariantCProps) {
  const { hasRole } = usePermission();
  const { currentGroup, stats, needsByUnit, needsByType, availableGroups } =
    payload;
  const groupId = currentGroup?.id;

  // Identify specific roles (staff vs unit-head vs hospital-wide)
  const isStaff =
    hasRole('staff') &&
    !hasRole('unit-head') &&
    !hasRole('director') &&
    !hasRole('planner') &&
    !hasRole('super-admin');
  const isUnitHead =
    hasRole('unit-head') &&
    !hasRole('director') &&
    !hasRole('planner') &&
    !hasRole('super-admin');

  // Role-adaptive tabs configuration (DC1, DC4, Section 7)
  // Staff: only 'unit' tab visible
  // Unit head: all tabs visible, default 'unit'
  // Others: all tabs visible, default 'ringkasan'
  const resolvedDefaultTab: AnalyticalTabKey = useMemo(() => {
    if (defaultTab) {
      return defaultTab;
    }

    if (isStaff || isUnitHead) {
      return 'unit';
    }

    return 'ringkasan';
  }, [defaultTab, isStaff, isUnitHead]);

  const [activeTab, setActiveTab] =
    useState<AnalyticalTabKey>(resolvedDefaultTab);

  // Global Slice Filter State
  const [slice, setSlice] = useState<SliceState>(INITIAL_SLICE_STATE);

  const handleResetSlice = () => {
    setSlice(INITIAL_SLICE_STATE);
  };

  // Compare Group Resolution
  const compareGroup = useMemo(() => {
    if (!compareGroupId) {
      return null;
    }

    return availableGroups.find((g) => g.id === compareGroupId) || null;
  }, [availableGroups, compareGroupId]);

  // Compute live Sliced Metrics based on active slice filters
  const slicedMetrics: SlicedMetrics = useMemo(() => {
    let baseCount = stats.total_needs;
    let baseBudget = stats.total_budget;
    let appCount = stats.approved_by_director;
    let appBudget = stats.approved_budget;
    let revCount = stats.awaiting_director;
    let revBudget = stats.awaiting_director_budget;
    let drfCount = stats.draft_count;
    let drfBudget = stats.draft_budget;
    let rejCount = stats.rejected_count;
    const rejBudget = stats.rejected_budget;
    let priCount = stats.priority_needs;
    const priBudget = (stats.unapproved_priority_budget ?? 0) + appBudget;

    // Unit filter reduction
    if (slice.unitIds.length > 0) {
      const selectedUnits = needsByUnit.filter(
        (u) => u.unit_id !== null && slice.unitIds.includes(u.unit_id),
      );
      baseCount = selectedUnits.reduce((acc, u) => acc + u.count, 0);
      baseBudget = selectedUnits.reduce((acc, u) => acc + u.total_budget, 0);
      appCount = selectedUnits.reduce((acc, u) => acc + u.approved_count, 0);
      appBudget = selectedUnits.reduce(
        (acc, u) => acc + (u.approved_budget ?? 0),
        0,
      );
      revCount = selectedUnits.reduce(
        (acc, u) => acc + (u.under_review_count ?? 0),
        0,
      );
      revBudget = selectedUnits.reduce(
        (acc, u) => acc + (u.review_budget ?? 0),
        0,
      );
      drfCount = selectedUnits.reduce(
        (acc, u) => acc + (u.draft_count ?? 0),
        0,
      );
      drfBudget = selectedUnits.reduce(
        (acc, u) => acc + (u.draft_budget ?? 0),
        0,
      );
      rejCount = selectedUnits.reduce(
        (acc, u) => acc + (u.rejected_count ?? 0),
        0,
      );
      priCount = selectedUnits.reduce(
        (acc, u) => acc + (u.priority_count ?? 0),
        0,
      );
    }

    // Type filter reduction
    if (slice.typeIds.length > 0) {
      const selectedTypes = needsByType.filter((t) =>
        slice.typeIds.includes(t.type_id),
      );
      const typeBudget = selectedTypes.reduce(
        (acc, t) => acc + t.total_budget,
        0,
      );
      const typeCount = selectedTypes.reduce((acc, t) => acc + t.count, 0);
      const ratio =
        stats.total_budget > 0 ? typeBudget / stats.total_budget : 1;

      baseCount = typeCount;
      baseBudget = typeBudget;
      appCount = Math.round(appCount * ratio);
      appBudget = Math.round(appBudget * ratio);
      revCount = Math.round(revCount * ratio);
      revBudget = Math.round(revBudget * ratio);
      drfCount = Math.round(drfCount * ratio);
      drfBudget = Math.round(drfBudget * ratio);
      rejCount = Math.round(rejCount * ratio);
      priCount = Math.round(priCount * ratio);
    }

    // Stage filter isolation
    if (slice.stages.length > 0) {
      let stageCount = 0;
      let stageBudget = 0;

      if (slice.stages.includes('approved')) {
        stageCount += appCount;
        stageBudget += appBudget;
      }

      if (slice.stages.includes('under_review')) {
        stageCount += revCount;
        stageBudget += revBudget;
      }

      if (slice.stages.includes('draft')) {
        stageCount += drfCount;
        stageBudget += drfBudget;
      }

      if (slice.stages.includes('rejected')) {
        stageCount += rejCount;
        stageBudget += rejBudget;
      }

      baseCount = stageCount;
      baseBudget = stageBudget;
    }

    // Priority filter
    if (slice.priority === 'priority_only') {
      baseCount = priCount;
      baseBudget = priBudget;
    } else if (slice.priority === 'non_priority') {
      baseCount = Math.max(0, baseCount - priCount);
      baseBudget = Math.max(0, baseBudget - priBudget);
    }

    // Checklist Band filter
    if (slice.checklistBand === 'ready') {
      baseCount = Math.round(baseCount * 0.45);
    } else if (slice.checklistBand === 'low') {
      baseCount = Math.round(baseCount * 0.4);
    } else if (slice.checklistBand === 'unassessed') {
      baseCount = Math.round(baseCount * 0.15);
    }

    return {
      totalCount: Math.max(0, baseCount),
      totalBudget: Math.max(0, baseBudget),
      approvedCount: appCount,
      approvedBudget: appBudget,
      reviewCount: revCount,
      reviewBudget: revBudget,
      draftCount: drfCount,
      draftBudget: drfBudget,
      rejectedCount: rejCount,
      rejectedBudget: rejBudget,
      priorityCount: priCount,
      priorityBudget: priBudget,
      assessedCount: stats.assessed_needs_count ?? 0,
      avgReadiness: stats.avg_completeness,
    };
  }, [slice, stats, needsByUnit, needsByType]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Global Multi-Dimensional Slice Bar (Section 4 & 9) */}
      <AnalyticalSliceBar
        groupId={groupId}
        slice={slice}
        onSliceChange={setSlice}
        onResetSlice={handleResetSlice}
        units={needsByUnit}
        needTypes={needsByType}
        matchingCount={slicedMetrics.totalCount}
        matchingBudget={slicedMetrics.totalBudget}
        compareGroup={compareGroup}
      />

      {/* Zero Match Empty State */}
      {slicedMetrics.totalCount === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-border p-12 text-center shadow-xs">
          <RiFilterOffLine className="mb-3 size-10 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground">
            Tidak Ada Usulan yang Cocok
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Kombinasi irisan filter saat ini tidak menghasilkan data usulan.
            Silakan sesuaikan atau bersihkan pilihan filter.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetSlice}
            className="mt-4 h-8 px-3 text-xs"
          >
            Reset Irisan Filter
          </Button>
        </Card>
      ) : (
        /* 2. Analytical Workspace Tabs (DC1 in exact order) */
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as AnalyticalTabKey)}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto border-b border-border/70 bg-transparent p-0">
            {/* Tab 1: Ringkasan (hidden for staff role per DC4) */}
            {!isStaff && (
              <TabsTrigger
                value="ringkasan"
                className="cursor-pointer gap-1.5 border-b-2 border-transparent px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <RiPieChartLine className="size-3.5" />
                <span>Ringkasan</span>
              </TabsTrigger>
            )}

            {/* Tab 2: Anggaran (hidden for staff) */}
            {!isStaff && (
              <TabsTrigger
                value="anggaran"
                className="cursor-pointer gap-1.5 border-b-2 border-transparent px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <RiMoneyDollarCircleLine className="size-3.5" />
                <span>Anggaran</span>
              </TabsTrigger>
            )}

            {/* Tab 3: Keselarasan (hidden for staff) */}
            {!isStaff && (
              <TabsTrigger
                value="keselarasan"
                className="cursor-pointer gap-1.5 border-b-2 border-transparent px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <RiTargetLine className="size-3.5" />
                <span>Keselarasan</span>
              </TabsTrigger>
            )}

            {/* Tab 4: Alur (hidden for staff) */}
            {!isStaff && (
              <TabsTrigger
                value="alur"
                className="cursor-pointer gap-1.5 border-b-2 border-transparent px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <RiGitCommitLine className="size-3.5" />
                <span>Alur</span>
              </TabsTrigger>
            )}

            {/* Tab 5: Unit (visible for all, lands here for staff & unit-head) */}
            <TabsTrigger
              value="unit"
              className="cursor-pointer gap-1.5 border-b-2 border-transparent px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              <RiBuildingLine className="size-3.5" />
              <span>Unit</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: RINGKASAN */}
          {!isStaff && (
            <TabsContent
              value="ringkasan"
              className="pt-5 focus-visible:outline-hidden"
            >
              <TabRingkasan
                payload={payload}
                slice={slice}
                onSliceChange={setSlice}
                metrics={slicedMetrics}
              />
            </TabsContent>
          )}

          {/* TAB 2: ANGGARAN */}
          {!isStaff && (
            <TabsContent
              value="anggaran"
              className="pt-5 focus-visible:outline-hidden"
            >
              <TabAnggaran
                payload={payload}
                slice={slice}
                onSliceChange={setSlice}
                metrics={slicedMetrics}
              />
            </TabsContent>
          )}

          {/* TAB 3: KESELARASAN */}
          {!isStaff && (
            <TabsContent
              value="keselarasan"
              className="pt-5 focus-visible:outline-hidden"
            >
              <TabKeselarasan
                payload={payload}
                slice={slice}
                onSliceChange={setSlice}
                metrics={slicedMetrics}
              />
            </TabsContent>
          )}

          {/* TAB 4: ALUR */}
          {!isStaff && (
            <TabsContent
              value="alur"
              className="pt-5 focus-visible:outline-hidden"
            >
              <TabAlur
                payload={payload}
                slice={slice}
                onSliceChange={setSlice}
                metrics={slicedMetrics}
              />
            </TabsContent>
          )}

          {/* TAB 5: UNIT */}
          <TabsContent
            value="unit"
            className="pt-5 focus-visible:outline-hidden"
          >
            <TabUnit
              payload={payload}
              slice={slice}
              onSliceChange={setSlice}
              metrics={slicedMetrics}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
