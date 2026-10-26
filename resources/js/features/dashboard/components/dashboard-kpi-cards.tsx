import { Link } from '@inertiajs/react';
import {
  RiAlertFill,
  RiArrowDownLine,
  RiArrowUpLine,
  RiCheckboxCircleFill,
  RiFileList3Fill,
  RiMoneyDollarCircleFill,
  RiTimeFill,
} from '@remixicon/react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermission } from '@/hooks/use-permission';
import {
  formatCompactIDR,
  formatIDR,
  formatNumber,
  formatPercent,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { DashboardStats } from '@/types/needs-dashboard';

interface DashboardKpiCardsProps {
  stats: DashboardStats;
  groupId?: number;
  className?: string;
}

export function DashboardKpiCards({
  stats,
  groupId,
  className,
}: DashboardKpiCardsProps) {
  const { hasRole, hasPermission } = usePermission();
  const canApprove =
    hasRole('director') ||
    hasRole('super-admin') ||
    hasPermission('approve needs');

  const activeBudget = stats.total_budget;
  const activeCount =
    stats.active_needs_count ?? stats.total_needs - stats.rejected_count;

  const approvedPct =
    activeBudget > 0
      ? Math.round((stats.approved_budget / activeBudget) * 100)
      : 0;

  const priorityPct =
    activeCount > 0
      ? Math.round((stats.priority_needs / activeCount) * 100)
      : 0;

  const totalBudgetDelta =
    stats.prev_group && stats.prev_total_budget
      ? Math.round(
          ((stats.total_budget - stats.prev_total_budget) /
            stats.prev_total_budget) *
            100,
        )
      : null;

  const approvedShareDelta =
    stats.prev_group &&
    stats.prev_approved_budget !== null &&
    stats.prev_approved_budget !== undefined &&
    stats.prev_total_budget &&
    stats.prev_total_budget > 0
      ? approvedPct -
        Math.round((stats.prev_approved_budget / stats.prev_total_budget) * 100)
      : null;

  const priorityDelta =
    stats.prev_group &&
    stats.prev_priority_needs !== null &&
    stats.prev_priority_needs !== undefined
      ? stats.priority_needs - stats.prev_priority_needs
      : null;

  const readinessDelta =
    stats.prev_group &&
    stats.prev_avg_completeness !== null &&
    stats.prev_avg_completeness !== undefined
      ? Math.round(stats.avg_completeness - stats.prev_avg_completeness)
      : null;

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-5', className)}>
      {/* Card 1: Total Budget */}
      <Link
        href={needRoutes.index.url({
          query: {
            need_group_id: groupId,
            stage: ['draft', 'under_review', 'approved'],
          },
        })}
        className="group block"
      >
        <Card
          size="sm"
          className="h-full border-border/70 transition-all hover:border-foreground/30 hover:shadow-xs"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
              TOTAL ANGGARAN
            </span>
            <RiMoneyDollarCircleFill className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="font-mono text-xl font-bold tracking-tight text-foreground"
              title={formatIDR(stats.total_budget)}
            >
              {formatCompactIDR(stats.total_budget)}
            </div>

            <div className="mt-2">
              <div className="truncate font-mono text-xs text-muted-foreground">
                {formatIDR(stats.total_budget)}
              </div>
              <div className="flex items-center justify-between text-xss text-muted-foreground">
                <span>{formatNumber(activeCount)} usulan aktif</span>
                {totalBudgetDelta !== null && (
                  <span className="flex items-center gap-0.5 font-mono text-muted-foreground">
                    {totalBudgetDelta >= 0 ? (
                      <RiArrowUpLine className="size-3" />
                    ) : (
                      <RiArrowDownLine className="size-3" />
                    )}
                    {Math.abs(totalBudgetDelta)}% vs {stats.prev_group?.year}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Card 2: Approved Budget */}
      <Link
        href={needRoutes.index.url({
          query: {
            need_group_id: groupId,
            stage: ['approved'],
          },
        })}
        className="group block"
      >
        <Card
          size="sm"
          className="h-full border-border/70 transition-all hover:border-success/50 hover:shadow-xs"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
              DISETUJUI DIREKTUR
            </span>
            <RiCheckboxCircleFill className="size-4 text-success" />
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between">
            <div className="font-mono text-xl font-bold tracking-tight text-success-foreground dark:text-success">
              {formatCompactIDR(stats.approved_budget)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xss text-muted-foreground">
              <span>
                {approvedPct}% dari anggaran (
                {formatNumber(stats.approved_by_director)} item)
              </span>
              {approvedShareDelta !== null && (
                <span className="flex items-center gap-0.5 font-mono text-muted-foreground">
                  {approvedShareDelta >= 0 ? '+' : ''}
                  {approvedShareDelta} pp
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Card 3: Awaiting Director Review */}
      <Link
        href={needRoutes.index.url({
          query: {
            need_group_id: groupId,
            stage: ['under_review'],
          },
        })}
        className="group block"
      >
        <Card
          size="sm"
          className={cn(
            'h-full transition-all hover:shadow-xs',
            canApprove
              ? 'border-warning/40 bg-warning/10 hover:border-warning/70 dark:bg-warning/15'
              : 'border-border/70 hover:border-foreground/30',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <span
              className={cn(
                'text-xs font-semibold tracking-wider uppercase',
                canApprove
                  ? 'text-warning-foreground dark:text-warning'
                  : 'text-muted-foreground',
              )}
            >
              {canApprove ? 'MENUNGGU ANDA' : 'MENUNGGU DIREKTUR'}
            </span>
            <RiTimeFill
              className={cn(
                'size-4',
                canApprove ? 'text-warning' : 'text-muted-foreground',
              )}
            />
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between">
            <div
              className={cn(
                'font-mono text-xl font-bold tracking-tight',
                canApprove
                  ? 'text-warning-foreground dark:text-warning'
                  : 'text-foreground',
              )}
            >
              {formatNumber(stats.awaiting_director)} Usulan
            </div>
            <p
              className={cn(
                'mt-1 truncate font-mono text-xs',
                canApprove
                  ? 'text-warning-foreground/80 dark:text-warning/80'
                  : 'text-muted-foreground',
              )}
            >
              {formatCompactIDR(stats.awaiting_director_budget)} butuh telaah
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Card 4: Priority Needs */}
      <Link
        href={needRoutes.index.url({
          query: {
            need_group_id: groupId,
            is_priority: ['1'],
            stage: ['draft', 'under_review', 'approved'],
          },
        })}
        className="group block"
      >
        <Card
          size="sm"
          className="h-full border-border/70 transition-all hover:border-foreground/30 hover:shadow-xs"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
              USULAN PRIORITAS
            </span>
            <RiAlertFill className="size-4 text-warning" />
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between">
            <div className="font-mono text-xl font-bold tracking-tight text-warning-foreground dark:text-warning">
              {formatNumber(stats.priority_needs)} Usulan
            </div>
            <div className="mt-1 flex items-center justify-between text-xss text-muted-foreground">
              <span>
                {priorityPct}% ({stats.unapproved_priority_count ?? 0} Belum
                Acc)
              </span>
              {priorityDelta !== null && (
                <span className="flex items-center gap-0.5 font-mono text-muted-foreground">
                  {priorityDelta >= 0 ? '+' : ''}
                  {priorityDelta}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Card 5: Readiness Score */}
      <Link
        href={needRoutes.index.url({
          query: {
            need_group_id: groupId,
            sort: 'checklist_percentage',
            direction: 'asc',
          },
        })}
        className="group block"
      >
        <Card
          size="sm"
          className="h-full border-border/70 transition-all hover:border-foreground/30 hover:shadow-xs"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
              RATA KELENGKAPAN
            </span>
            <RiFileList3Fill className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between">
            <div className="font-mono text-xl font-bold tracking-tight text-foreground">
              {formatPercent(stats.avg_completeness)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xss text-muted-foreground">
              <span>
                Terisi {stats.assessed_needs_count ?? 0}/{activeCount} Usulan
              </span>
              {readinessDelta !== null && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 font-mono font-medium',
                    readinessDelta >= 0
                      ? 'text-success-foreground dark:text-success'
                      : 'text-destructive',
                  )}
                >
                  {readinessDelta >= 0 ? '+' : ''}
                  {readinessDelta} pp
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
