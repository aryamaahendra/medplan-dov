import { router, usePage } from '@inertiajs/react';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiLockLine,
  RiTargetLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { TabKeselarasan } from '@/features/dashboard/components/analytical/tab-keselarasan';
import { DashboardGroupSelector } from '@/features/dashboard/components/dashboard-group-selector';
import { DashboardKpiCards } from '@/features/dashboard/components/dashboard-kpi-cards';
import { OperationsLockMonitor } from '@/features/dashboard/components/operations/operations-lock-monitor';
import { OrganizationTreeVisualizer } from '@/features/dashboard/components/organization-tree-visualizer';
import { cn } from '@/lib/utils';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

interface DashboardContentProps {
  payload: NeedsDashboardPayload;
  reloading?: boolean;
}

export function DashboardContent({
  payload,
  reloading,
}: DashboardContentProps) {
  const { auth } = usePage<{
    auth: { user: { organizational_unit_id?: number | null } };
  }>().props;
  const userUnitId = auth?.user?.organizational_unit_id ?? null;

  const [isRenstraCollapsed, setIsRenstraCollapsed] = useState(false);
  const [isLockMonitorCollapsed, setIsLockMonitorCollapsed] = useState(false);

  const {
    currentGroup,
    availableGroups,
    stats,
    allUnitProgress,
    operations,
    activeUnlocks,
  } = payload;
  const groupId = currentGroup?.id;

  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        reloading && 'opacity-60 transition-opacity',
      )}
    >
      {/* 1. Header with Title & Custom Need Group Selector */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ringkasan eksekutif, pohon struktur pengusulan unit kerja,
            keselarasan Renstra, dan monitor kunci
          </p>
        </div>

        <DashboardGroupSelector
          currentGroup={currentGroup}
          availableGroups={availableGroups}
        />
      </div>

      {/* 2. KPI Stat Cards (5 Cards) */}
      <DashboardKpiCards stats={stats} groupId={groupId} />

      {/* 3. Tree Visualisasi Hirarki Organisasi */}
      <OrganizationTreeVisualizer
        groupId={groupId}
        allUnitProgress={allUnitProgress}
        userUnitId={userUnitId}
      />

      {/* 4. Penyelarasan Sasaran Strategis (Katalog Renstra) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <RiTargetLine className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Penyelarasan Sasaran Strategis (Katalog Renstra)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Keterkaitan usulan kebutuhan dengan sasaran strategis, indikator,
              dan IKU Renstra
            </p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsRenstraCollapsed(!isRenstraCollapsed)}
            className="gap-1 text-xs text-muted-foreground"
          >
            {isRenstraCollapsed ? (
              <>
                <RiArrowDownSLine className="size-3.5" />
                <span>Tampilkan</span>
              </>
            ) : (
              <>
                <RiArrowUpSLine className="size-3.5" />
                <span>Sembunyikan</span>
              </>
            )}
          </Button>
        </div>
        {!isRenstraCollapsed && <TabKeselarasan payload={payload} />}
      </div>

      {/* 5. Monitor Kunci & Dispensasi Siklus (Lock Monitor) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <RiLockLine className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Monitor Kunci & Dispensasi Siklus (Lock Monitor)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Status pembatasan edit per tingkatan (5-Tier) dan izin dispensasi
              revisi
            </p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsLockMonitorCollapsed(!isLockMonitorCollapsed)}
            className="gap-1 text-xs text-muted-foreground"
          >
            {isLockMonitorCollapsed ? (
              <>
                <RiArrowDownSLine className="size-3.5" />
                <span>Tampilkan</span>
              </>
            ) : (
              <>
                <RiArrowUpSLine className="size-3.5" />
                <span>Sembunyikan</span>
              </>
            )}
          </Button>
        </div>

        {!isLockMonitorCollapsed && (
          <OperationsLockMonitor
            groupId={groupId}
            lockMonitor={operations?.lock_monitor}
            activeUnlocks={activeUnlocks}
            borderless
            onOpenLockDialog={(needId) => {
              router.visit(`/needs/${needId}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
