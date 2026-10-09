import {
  RiFolderChartLine,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiCoinsLine,
} from '@remixicon/react';

import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import type { NeedGroup } from '../types/need-group.types';

interface NeedGroupsSummaryStatsProps {
  totalCount: number;
  data: NeedGroup[];
}

export function NeedGroupsSummaryStats({
  totalCount,
  data,
}: NeedGroupsSummaryStatsProps) {
  const activeCount = data.filter((g) => g.is_active).length;
  const totalNeeds = data.reduce((acc, g) => acc + (g.need_count || 0), 0);
  const totalApproved = data.reduce(
    (acc, g) => acc + (g.approved_count || 0),
    0,
  );
  const totalBudget = data.reduce(
    (acc, g) => acc + (Number(g.total_budget) || 0),
    0,
  );

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
            {formatNumber(totalCount)}
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
            {formatNumber(activeCount)}
          </span>
          <span className="text-xs text-muted-foreground">
            dari {data.length} di halaman
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
            {formatNumber(totalNeeds)}
          </span>
          <span className="text-xs text-success-foreground dark:text-success">
            ({formatNumber(totalApproved)} Disetujui)
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
            {formatCompactIDR(totalBudget)}
          </span>
        </div>
      </div>
    </div>
  );
}
