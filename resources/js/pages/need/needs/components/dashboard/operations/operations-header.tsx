import { router } from '@inertiajs/react';
import {
  RiRefreshLine,
  RiTimeLine,
  RiShieldCheckLine,
  RiBuildingLine,
  RiLockLine,
  RiLockUnlockLine,
} from '@remixicon/react';
import { useState } from 'react';

import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  DashboardGroupOption,
  DashboardStats,
  OperationsPayload,
} from '@/types/needs-dashboard';

interface OperationsHeaderProps {
  currentGroup: DashboardGroupOption | null;
  stats: DashboardStats;
  operations?: OperationsPayload;
  activeUnlocksCount: number;
}

export function OperationsHeader({
  currentGroup,
  stats,
  operations,
  activeUnlocksCount,
}: OperationsHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({
      only: ['dashboardPayload'],
      onFinish: () => setIsRefreshing(false),
    });
  };

  const meta = operations?.meta;
  const windowStatus =
    meta?.window_status ?? currentGroup?.window_status ?? 'open';
  const daysRemaining = meta?.days_remaining;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Window status & Scope Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {windowStatus === 'open' ? (
            <StatusBadge status="success">Buka Pengajuan</StatusBadge>
          ) : windowStatus === 'closed' ? (
            <StatusBadge status="destructive">Pengajuan Ditutup</StatusBadge>
          ) : windowStatus === 'upcoming' ? (
            <StatusBadge status="warning">Mendatang</StatusBadge>
          ) : (
            <StatusBadge status="muted">Jadwal Fleksibel</StatusBadge>
          )}

          {daysRemaining !== null && daysRemaining !== undefined && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                daysRemaining <= 3
                  ? 'font-bold text-destructive'
                  : daysRemaining <= 7
                    ? 'text-warning-foreground dark:text-warning'
                    : 'text-muted-foreground',
              )}
            >
              <RiTimeLine className="size-3.5" />
              {daysRemaining <= 0
                ? 'Batas waktu berakhir'
                : `Sisa ${daysRemaining} hari${meta?.window_end_at ? ` (s/d ${meta.window_end_at} WITA)` : ''}`}
            </span>
          )}

          <span className="text-muted-foreground">-</span>

          <Badge
            variant="outline"
            className="gap-1 text-xs font-normal text-muted-foreground"
          >
            <RiShieldCheckLine className="size-3 text-primary" />
            <span>Cakupan: {meta?.scope_label ?? 'Seluruh Rumah Sakit'}</span>
          </Badge>
        </div>

        {/* Right: Updated timestamp & Refresh button */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Diperbarui: {meta?.formatted_time ?? 'Hari ini'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Muat ulang data operasional"
          >
            <RiRefreshLine
              className={cn(
                'size-3.5',
                isRefreshing && 'animate-spin text-primary',
              )}
            />
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <RiBuildingLine className="size-3.5 text-muted-foreground" />
            <span>Total Permohonan:</span>
            <strong className="font-mono font-bold text-foreground">
              {formatNumber(stats.total_needs)}
            </strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Total Anggaran:</span>
            <strong className="font-mono font-bold text-foreground">
              {formatCompactIDR(stats.total_budget)}
            </strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <RiLockLine className="size-3.5 text-muted-foreground" />
            <span>Terkunci:</span>
            <strong className="font-mono font-bold text-foreground">
              {formatNumber(stats.locked_count)}
            </strong>
            <span>usulan</span>
          </div>

          <div className="flex items-center gap-1.5">
            <RiLockUnlockLine className="size-3.5 text-warning" />
            <span>Izin Buka Kunci:</span>
            <strong className="font-mono font-bold text-warning-foreground dark:text-warning">
              {formatNumber(activeUnlocksCount)}
            </strong>
            <span>usulan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
