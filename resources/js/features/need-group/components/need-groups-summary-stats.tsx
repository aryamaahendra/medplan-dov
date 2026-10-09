import {
  RiFolderChartLine,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiCoinsLine,
} from '@remixicon/react';

import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import type { NeedGroupsSummaryStatsData } from '../types/need-group.types';

interface NeedGroupsSummaryStatsProps {
  stats: NeedGroupsSummaryStatsData;
}

export function NeedGroupsSummaryStats({ stats }: NeedGroupsSummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors sm:p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wider uppercase">
            Total Kelompok
          </span>
          <RiFolderChartLine className="size-4 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {formatNumber(stats.total_groups)}
          </span>
          <span className="text-xs text-muted-foreground">Tahun Anggaran</span>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors sm:p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wider uppercase">
            Kelompok Aktif
          </span>
          <RiCheckboxCircleLine className="size-4 text-success" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-success-foreground dark:text-success">
            {formatNumber(stats.active_groups)}
          </span>
          <span className="text-xs text-muted-foreground">
            dari {formatNumber(stats.total_groups)} kelompok
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors sm:p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wider uppercase">
            Usulan Terkumpul
          </span>
          <RiFileList3Line className="size-4 text-info" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {formatNumber(stats.total_needs)}
          </span>
          <span className="text-xs text-success-foreground dark:text-success">
            ({formatNumber(stats.total_approved)} Disetujui)
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors sm:p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wider uppercase">
            Akumulasi Anggaran
          </span>
          <RiCoinsLine className="size-4 text-warning" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {formatCompactIDR(stats.total_budget)}
          </span>
        </div>
      </div>
    </div>
  );
}
