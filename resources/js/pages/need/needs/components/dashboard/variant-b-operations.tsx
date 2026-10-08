import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

import { OperationsAgingHistogram } from './operations/operations-aging-histogram';
import { OperationsAttentionPanel } from './operations/operations-attention-panel';
import { OperationsHeader } from './operations/operations-header';
import { OperationsLockMonitor } from './operations/operations-lock-monitor';
import { OperationsStageStrip } from './operations/operations-stage-strip';
import { OperationsUnitProgressTable } from './operations/operations-unit-progress-table';

interface VariantBProps {
  payload: NeedsDashboardPayload;
  onOpenLockDialog?: (needId: number, mode: 'lock' | 'unlock') => void;
}

export function VariantBOperations({
  payload,
  onOpenLockDialog,
}: VariantBProps) {
  const {
    currentGroup,
    stats,
    stageDistribution,
    allUnitProgress,
    activeUnlocks,
    operations,
  } = payload;
  const groupId = currentGroup?.id;

  return (
    <div className="flex flex-col gap-6">
      {/* B1. Operations Header Strip */}
      <OperationsHeader
        currentGroup={currentGroup}
        stats={stats}
        operations={operations}
        activeUnlocksCount={activeUnlocks.length}
      />

      {/* B2. Interactive Stage Pipeline Tiles */}
      <OperationsStageStrip
        groupId={groupId}
        stageDistribution={stageDistribution}
        operations={operations}
      />

      {/* B3 & B4. Exceptions (Needs Attention) + Unit Submission Progress */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <OperationsAttentionPanel
            groupId={groupId}
            operations={operations}
            onOpenLockDialog={onOpenLockDialog}
          />
        </div>

        <div className="lg:col-span-7">
          <OperationsUnitProgressTable
            groupId={groupId}
            allUnitProgress={operations?.unit_progress ?? allUnitProgress}
          />
        </div>
      </div>

      {/* B5 & B6. Lock Monitor & Aging Histogram */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <OperationsLockMonitor
            groupId={groupId}
            lockMonitor={operations?.lock_monitor}
            activeUnlocks={activeUnlocks}
            onOpenLockDialog={onOpenLockDialog}
          />
        </div>

        <div className="lg:col-span-5">
          <OperationsAgingHistogram aging={operations?.aging} />
        </div>
      </div>
    </div>
  );
}
