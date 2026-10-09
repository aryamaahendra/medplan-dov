import {
  RiVerifiedBadgeLine,
  RiClipboardLine,
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiArrowRightDownLine,
  RiArrowRightUpLine,
  RiAlertLine,
} from '@remixicon/react';

import { StatsCard } from '@/components/dashboard/stats-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface NeedsStatsProps {
  stats?: {
    total_needs: number;
    total_budget: number;
    priority_needs: number;
    avg_completeness: number;
    approved_by_director: number;
    prev_group: { id: number; name: string } | null;
    prev_total_needs: number | null;
    prev_total_budget: number | null;
    prev_priority_needs: number | null;
    prev_avg_completeness: number | null;
    prev_approved_by_director: number | null;
  };
}

function DeltaBadge({
  current,
  prev,
  invert,
}: {
  current: number;
  prev: number | null;
  invert?: boolean;
}) {
  if (prev === null) {
    return null;
  }

  const delta = current - prev;

  if (delta === 0) {
    return null;
  }

  const isPositive = invert ? delta < 0 : delta > 0;
  const Icon = delta > 0 ? RiArrowRightUpLine : RiArrowRightDownLine;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isPositive ? 'text-success' : 'text-destructive',
      )}
    >
      <Icon className="size-3" />
      {delta > 0 ? '+' : ''}
      {delta}
    </span>
  );
}

export function NeedsStats({ stats }: NeedsStatsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        title="Total Usulan"
        value={formatNumber(stats.total_needs)}
        icon={RiClipboardLine}
        description={
          stats.prev_group ? (
            <span className="flex items-center gap-1.5">
              <DeltaBadge
                current={stats.total_needs}
                prev={stats.prev_total_needs}
              />
              <span className="truncate text-muted-foreground">
                prev: {formatNumber(stats.prev_total_needs ?? 0)} (
                {stats.prev_group.name})
              </span>
            </span>
          ) : (
            'no prev data'
          )
        }
        iconClassName="text-primary"
      />
      <StatsCard
        title="Total Estimasi Anggaran"
        value={formatCompactIDR(stats.total_budget)}
        icon={RiMoneyDollarCircleLine}
        description={
          stats.prev_group ? (
            <span className="flex items-center gap-1.5">
              <DeltaBadge
                current={stats.total_budget}
                prev={stats.prev_total_budget}
              />
              <span className="truncate text-muted-foreground">
                prev: {formatCompactIDR(stats.prev_total_budget ?? 0)} (
                {stats.prev_group.name})
              </span>
            </span>
          ) : (
            'no prev data'
          )
        }
        iconClassName="text-success"
      />
      <StatsCard
        title="Usulan Prioritas"
        value={formatNumber(stats.priority_needs)}
        icon={RiAlertLine}
        description={
          stats.prev_group ? (
            <span className="flex items-center gap-1.5">
              <DeltaBadge
                current={stats.priority_needs}
                prev={stats.prev_priority_needs}
              />
              <span className="truncate text-muted-foreground">
                prev: {formatNumber(stats.prev_priority_needs ?? 0)} (
                {stats.prev_group.name})
              </span>
            </span>
          ) : (
            'no prev data'
          )
        }
        iconClassName="text-warning"
      />
      <StatsCard
        title="Rata-rata Kelengkapan"
        value={formatPercent(stats.avg_completeness)}
        icon={RiFileList3Line}
        description={
          stats.prev_group ? (
            <span className="flex items-center gap-1.5">
              <DeltaBadge
                current={Math.round(stats.avg_completeness)}
                prev={
                  stats.prev_avg_completeness !== null
                    ? Math.round(stats.prev_avg_completeness)
                    : null
                }
              />
              <span className="truncate text-muted-foreground">
                prev: {formatPercent(stats.prev_avg_completeness ?? 0)} (
                {stats.prev_group.name})
              </span>
            </span>
          ) : (
            'no prev data'
          )
        }
        iconClassName="text-primary"
      />
      <StatsCard
        title="Disetujui Direktur"
        value={formatNumber(stats.approved_by_director)}
        icon={RiVerifiedBadgeLine}
        description={
          stats.prev_group ? (
            <span className="flex items-center gap-1.5">
              <DeltaBadge
                current={stats.approved_by_director}
                prev={stats.prev_approved_by_director}
              />
              <span className="truncate text-muted-foreground">
                prev: {formatNumber(stats.prev_approved_by_director ?? 0)} (
                {stats.prev_group.name})
              </span>
            </span>
          ) : (
            'no prev data'
          )
        }
        iconClassName="text-info"
      />
    </div>
  );
}
