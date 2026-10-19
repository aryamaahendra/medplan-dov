import { Link } from '@inertiajs/react';
import {
  RiMoneyDollarCircleFill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiAlertFill,
  RiFileList3Fill,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiBuildingLine,
  RiStackLine,
  RiStarFill,
  RiAttachment2,
  RiFileTextLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from '@remixicon/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePermission } from '@/hooks/use-permission';
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

interface VariantAProps {
  payload: NeedsDashboardPayload;
  onOpenDirectorReview?: (needId: number) => void;
}

export function VariantAExecutive({
  payload,
  onOpenDirectorReview,
}: VariantAProps) {
  const {
    stats,
    stageDistribution,
    matrix,
    decisionQueue,
    needsByUnit,
    needsByType,
    currentGroup,
  } = payload;
  const { hasRole, hasPermission } = usePermission();
  const canApprove =
    hasRole('director') ||
    hasRole('super-admin') ||
    hasPermission('approve needs');
  const groupId = currentGroup?.id;

  // Metric Toggle for Budget Pipeline: 'budget' vs 'count'
  const [pipelineMetric, setPipelineMetric] = useState<'budget' | 'count'>(
    'budget',
  );

  // Expand Other Units
  const [isOtherUnitsExpanded, setIsOtherUnitsExpanded] = useState(false);

  // Active Ask total (all non-rejected needs per D1)
  const activeBudget = stats.total_budget;
  const activeCount =
    stats.active_needs_count ?? stats.total_needs - stats.rejected_count;

  // L1 GLANCE KPI Calculations
  const approvedPct =
    activeBudget > 0
      ? Math.round((stats.approved_budget / activeBudget) * 100)
      : 0;

  const priorityPct =
    activeCount > 0
      ? Math.round((stats.priority_needs / activeCount) * 100)
      : 0;

  // Pipeline stages calculation with largest-remainder rounding
  // Pipeline percentages based on metric
  const pipelineStages = useMemo(() => {
    const rawPipelineStages = [
      {
        key: 'approved',
        label: 'Disetujui',
        count: stageDistribution.approved?.count ?? 0,
        budget: stageDistribution.approved?.budget ?? 0,
        color: 'bg-success',
        textColor: 'text-success-foreground',
        textClass: 'text-success-foreground dark:text-success',
      },
      {
        key: 'under_review',
        label: 'Menunggu Review',
        count: stageDistribution.under_review?.count ?? 0,
        budget: stageDistribution.under_review?.budget ?? 0,
        color: 'bg-warning',
        textColor: 'text-warning-foreground',
        textClass: 'text-warning-foreground dark:text-warning',
      },
      {
        key: 'draft',
        label: 'Draft',
        count: stageDistribution.draft?.count ?? 0,
        budget: stageDistribution.draft?.budget ?? 0,
        color: 'bg-muted-foreground/60',
        textColor: 'text-background',
        textClass: 'text-muted-foreground',
      },
    ];

    const totalVal = pipelineMetric === 'budget' ? activeBudget : activeCount;

    if (totalVal <= 0) {
      return rawPipelineStages.map((s) => ({ ...s, pct: 0 }));
    }

    return rawPipelineStages.map((s) => {
      const val = pipelineMetric === 'budget' ? s.budget : s.count;
      const pct = Math.round((val / totalVal) * 100);

      return { ...s, pct };
    });
  }, [pipelineMetric, activeBudget, activeCount, stageDistribution]);

  // Delta helpers for compare group
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
    stats.prev_total_budget &&
    stats.prev_approved_budget !== undefined &&
    stats.prev_approved_budget !== null
      ? Math.round((stats.approved_budget / (activeBudget || 1)) * 100) -
        Math.round(
          (stats.prev_approved_budget / (stats.prev_total_budget || 1)) * 100,
        )
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

  // Units list: Top 8 plus Others
  const { topUnits, otherUnits, otherUnitsTotalBudget, otherUnitsCount } =
    useMemo(() => {
      const top = needsByUnit.slice(0, 8);
      const rest = needsByUnit.slice(8);
      const restBudget = rest.reduce((acc, u) => acc + u.total_budget, 0);
      const restCount = rest.reduce((acc, u) => acc + u.count, 0);

      return {
        topUnits: top,
        otherUnits: rest,
        otherUnitsTotalBudget: restBudget,
        otherUnitsCount: restCount,
      };
    }, [needsByUnit]);

  const maxUnitBudget = useMemo(() => {
    const vals = topUnits.map((u) => u.total_budget);

    if (otherUnitsTotalBudget > 0) {
      vals.push(otherUnitsTotalBudget);
    }

    return Math.max(...vals, 1);
  }, [topUnits, otherUnitsTotalBudget]);

  // Priority matrix cells quantile heat calculation
  const maxMatrixBudget = useMemo(() => {
    const budgets = Object.values(matrix).map((c) => c.budget);

    return Math.max(...budgets, 1);
  }, [matrix]);

  return (
    <div className="flex flex-col gap-6">
      {/* W2 KPI STRIP (5 Cards) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                TOTAL ANGGARAN
              </span>
              <RiMoneyDollarCircleFill className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xl font-bold tracking-tight text-foreground">
                {formatCompactIDR(stats.total_budget)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xss text-muted-foreground">
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
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                DISETUJUI DIREKTUR
              </span>
              <RiCheckboxCircleFill className="size-4 text-success" />
            </CardHeader>
            <CardContent>
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

        {/* Card 3: Awaiting Director Review (Emphasized for Approvers) */}
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
                  'text-xss font-semibold tracking-wider uppercase',
                  canApprove
                    ? 'text-warning-foreground dark:text-warning'
                    : 'text-muted-foreground',
                )}
              >
                {canApprove ? 'MENUNGGU PERSETUJUAN ANDA' : 'MENUNGGU DIREKTUR'}
              </span>
              <RiTimeFill
                className={cn(
                  'size-4',
                  canApprove ? 'text-warning' : 'text-muted-foreground',
                )}
              />
            </CardHeader>
            <CardContent>
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
                  'mt-1 truncate font-mono text-xss',
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
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                USULAN PRIORITAS
              </span>
              <RiAlertFill className="size-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xl font-bold tracking-tight text-warning-foreground dark:text-warning">
                {formatNumber(stats.priority_needs)} Usulan
              </div>
              <div className="mt-1 flex items-center justify-between text-xss text-muted-foreground">
                <span>
                  {priorityPct}% dari usulan (
                  {stats.unapproved_priority_count ?? 0} belum acc)
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

        {/* Card 5: Readiness Score (Assessed only per D2) */}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                RATA KELENGKAPAN
              </span>
              <RiFileList3Fill className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xl font-bold tracking-tight text-foreground">
                {formatPercent(stats.avg_completeness)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xss text-muted-foreground">
                <span>
                  terisi {stats.assessed_needs_count ?? 0}/{activeCount} usulan
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

      {/* W3 BUDGET PIPELINE BAR */}
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Pipeline Anggaran Berdasarkan Tahapan</CardTitle>
              <CardDescription>
                Progres pengajuan dari draft hingga persetujuan Direktur
              </CardDescription>
            </div>

            {/* Metric Switch: Anggaran vs Jumlah Item */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'cursor-pointer font-medium transition-colors select-none',
                  pipelineMetric === 'budget'
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setPipelineMetric('budget')}
              >
                Anggaran
              </span>
              <Switch
                size="sm"
                checked={pipelineMetric === 'count'}
                onCheckedChange={(checked) =>
                  setPipelineMetric(checked ? 'count' : 'budget')
                }
                aria-label="Alihkan metrik antara Anggaran dan Jumlah Item"
              />
              <span
                className={cn(
                  'cursor-pointer font-medium transition-colors select-none',
                  pipelineMetric === 'count'
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setPipelineMetric('count')}
              >
                Jumlah Item
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stacked Horizontal Bar */}
          <div className="flex h-6 w-full overflow-hidden rounded-md bg-muted/40 p-0.5">
            {pipelineStages.map((stage) => {
              if (stage.pct <= 0) {
                return null;
              }

              return (
                <Link
                  key={stage.key}
                  href={needRoutes.index.url({
                    query: {
                      need_group_id: groupId,
                      stage: [stage.key],
                    },
                  })}
                  title={`${stage.label}: ${formatCompactIDR(stage.budget)} (${stage.pct}%) - ${stage.count} item`}
                  aria-label={`${stage.label}: ${formatCompactIDR(stage.budget)}, ${stage.pct} persen, ${stage.count} usulan`}
                  style={{ width: `${Math.max(stage.pct, 3)}%` }}
                  className={cn(
                    'flex h-full items-center justify-center text-xss font-semibold transition-opacity first:rounded-l last:rounded-r hover:opacity-90',
                    stage.color,
                    stage.textColor,
                  )}
                >
                  {stage.pct >= 12 && (
                    <span>
                      {stage.label} {stage.pct}%
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Legend and Separated Rejected Pill */}
          <div className="mt-3 flex flex-col gap-2 border-t pt-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {pipelineStages.map((stage) => (
                <Link
                  key={stage.key}
                  href={needRoutes.index.url({
                    query: {
                      need_group_id: groupId,
                      stage: [stage.key],
                    },
                  })}
                  className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-accent"
                >
                  <span
                    className={cn('size-2.5 shrink-0 rounded-xs', stage.color)}
                  />
                  <span className="font-medium text-foreground">
                    {stage.label}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {pipelineMetric === 'budget'
                      ? `${formatCompactIDR(stage.budget)} (${stage.pct}%)`
                      : `${formatNumber(stage.count)} item (${stage.pct}%)`}
                  </span>
                </Link>
              ))}
            </div>

            {/* Rejected Chip (Separated per D1) */}
            <Link
              href={needRoutes.index.url({
                query: {
                  need_group_id: groupId,
                  stage: ['rejected'],
                },
              })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <span>Ditolak:</span>
              <span className="font-mono font-bold">
                {formatCompactIDR(stats.rejected_budget)}
              </span>
              <span className="text-muted-foreground">
                ({stats.rejected_count} item)
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* W4 DECISION QUEUE (7) & W5 PRIORITY MATRIX (5) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Decision Queue (W4) */}
        <Card className="flex flex-col justify-between border-border/70 lg:col-span-7">
          <div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Antrean Telaah Direktur</CardTitle>
                <CardDescription>
                  {stats.awaiting_director} usulan · Total{' '}
                  {formatCompactIDR(stats.awaiting_director_budget)}
                </CardDescription>
              </div>
              <Link
                href={needRoutes.index.url({
                  query: {
                    need_group_id: groupId,
                    stage: ['under_review'],
                  },
                })}
                className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
              >
                Lihat semua ({stats.awaiting_director})
                <RiArrowRightLine className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {decisionQueue.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-4 text-center">
                  <RiShieldCheckLine className="mb-2 size-8 text-success opacity-80" />
                  <p className="text-sm font-medium text-foreground">
                    Tidak ada antrean telaah
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Semua usulan yang diverifikasi telah disetujui atau belum
                    diajukan.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {decisionQueue.map((item) => (
                    <div
                      key={item.id}
                      className="-mx-2.5 flex flex-col justify-between gap-2.5 rounded-lg px-2.5 py-3 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.is_priority && (
                            <span
                              title="Urgensi & Dampak Tinggi"
                              className="inline-flex"
                            >
                              <RiStarFill className="size-3.5 shrink-0 text-warning" />
                            </span>
                          )}
                          <Link
                            href={needRoutes.show.url({ need: item.id })}
                            className="max-w-[420px] truncate text-xs font-semibold text-foreground transition-colors hover:underline"
                          >
                            {item.title}
                          </Link>
                          {item.attachments_count ? (
                            <span className="flex items-center gap-0.5 font-mono text-xss text-muted-foreground">
                              <RiAttachment2 className="size-3" />
                              {item.attachments_count}
                            </span>
                          ) : null}
                          {item.has_notes && (
                            <span
                              title="Ada catatan review"
                              className="inline-flex"
                            >
                              <RiFileTextLine className="size-3 text-muted-foreground" />
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xss text-muted-foreground">
                          <span className="truncate">{item.unit_name}</span>
                          <span className="text-border">•</span>
                          <span className="font-mono font-medium text-foreground">
                            {formatCompactIDR(item.total_price)}
                          </span>
                          {item.volume && item.unit && (
                            <span className="text-muted-foreground">
                              ({item.volume} {item.unit})
                            </span>
                          )}
                          <span className="text-border">•</span>
                          <span
                            className={cn(
                              'py-0.2 rounded px-1 font-mono text-xss',
                              item.checklist_percentage < 85
                                ? 'bg-warning/15 text-warning-foreground dark:text-warning'
                                : 'text-muted-foreground',
                            )}
                          >
                            Checklist {Math.round(item.checklist_percentage)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                        {onOpenDirectorReview && canApprove ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onOpenDirectorReview(item.id)}
                          >
                            Telaah
                          </Button>
                        ) : (
                          <Link
                            href={needRoutes.show.url({ need: item.id })}
                            className="inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-medium transition-colors hover:bg-accent"
                          >
                            Lihat
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Right Column (5 cols): 3x3 Priority Matrix (W5) */}
        <Card className="flex flex-col justify-between border-border/70 lg:col-span-5">
          <div>
            <CardHeader>
              <CardTitle>Matriks Prioritas (Urgensi x Dampak)</CardTitle>
              <CardDescription>
                Urgensi (kolom) x Dampak (baris) untuk usulan aktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                {/* Header Axis */}
                <div className="p-1 text-xss font-semibold text-muted-foreground">
                  Dampak \ Urg
                </div>
                <div className="p-1 text-xss font-semibold text-muted-foreground">
                  Rendah
                </div>
                <div className="p-1 text-xss font-semibold text-muted-foreground">
                  Sedang
                </div>
                <div className="p-1 text-xss font-semibold text-muted-foreground">
                  Tinggi
                </div>

                {/* Rows from High Impact to Low Impact */}
                {(['high', 'medium', 'low'] as const).map((impact) => (
                  <div key={impact} className="contents">
                    <div className="flex items-center justify-center p-1 text-xss font-semibold text-muted-foreground capitalize">
                      {impact === 'high'
                        ? 'Tinggi'
                        : impact === 'medium'
                          ? 'Sedang'
                          : 'Rendah'}
                    </div>

                    {(['low', 'medium', 'high'] as const).map((urgency) => {
                      const cellKey = `${urgency}_${impact}`;
                      const cell = matrix[cellKey] || { count: 0, budget: 0 };
                      const isTopPriority =
                        urgency === 'high' && impact === 'high';

                      // Heat intensity
                      const intensityRatio =
                        maxMatrixBudget > 0 ? cell.budget / maxMatrixBudget : 0;

                      return (
                        <Link
                          key={urgency}
                          href={needRoutes.index.url({
                            query: {
                              need_group_id: groupId,
                              urgency: [urgency],
                              impact: [impact],
                              stage: ['draft', 'under_review', 'approved'],
                            },
                          })}
                          className={cn(
                            'flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-[1.02] hover:shadow-xs',
                            isTopPriority
                              ? 'border-2 border-destructive/70 bg-destructive/10 text-destructive dark:bg-destructive/20'
                              : cell.count > 0
                                ? intensityRatio > 0.5
                                  ? 'border-primary/50 bg-primary/15 text-foreground'
                                  : 'border-border/80 bg-accent/40 text-foreground hover:bg-accent/70'
                                : 'pointer-events-none border-border/40 bg-muted/20 text-muted-foreground opacity-50',
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {isTopPriority && (
                              <RiStarFill className="size-3 text-destructive" />
                            )}
                            <span className="font-mono text-sm leading-none font-bold">
                              {cell.count}
                            </span>
                          </div>
                          <span className="mt-1 w-full truncate font-mono text-xss text-muted-foreground">
                            {cell.count > 0
                              ? formatCompactIDR(cell.budget)
                              : 'Rp 0'}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Callout under Matrix */}
              {(stats.unapproved_priority_count ?? 0) > 0 && (
                <Link
                  href={needRoutes.index.url({
                    query: {
                      need_group_id: groupId,
                      is_priority: ['1'],
                      stage: ['draft', 'under_review'],
                    },
                  })}
                  className="mt-4 flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning-foreground transition-colors hover:bg-warning/15 dark:text-warning"
                >
                  <span className="font-medium">
                    Perhatian: {stats.unapproved_priority_count} usulan
                    prioritas belum disetujui
                  </span>
                  <span className="font-mono font-bold">
                    {formatCompactIDR(stats.unapproved_priority_budget ?? 0)}
                  </span>
                </Link>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* W6 BUDGET BY UNIT (7) & W7 BUDGET BY TYPE (5) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Budget by Unit (W6) */}
        <Card className="border-border/70 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <RiBuildingLine className="size-4 text-muted-foreground" />
              <CardTitle>Anggaran per Unit Kerja</CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Top 8 Unit
            </span>
          </CardHeader>
          <CardContent>
            {topUnits.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Belum ada usulan per unit.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {topUnits.map((unit) => {
                  const widthPct = Math.max(
                    Math.round((unit.total_budget / maxUnitBudget) * 100),
                    4,
                  );

                  return (
                    <Link
                      key={unit.unit_id ?? unit.name}
                      href={needRoutes.index.url({
                        query: {
                          need_group_id: groupId,
                          ...(unit.unit_id
                            ? {
                                organizational_unit_id: [
                                  unit.unit_id.toString(),
                                ],
                              }
                            : {}),
                          stage: ['draft', 'under_review', 'approved'],
                        },
                      })}
                      className="group -mx-1.5 flex flex-col gap-1 rounded-md p-1.5 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="max-w-[65%] truncate font-medium text-foreground">
                          {unit.name}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-muted-foreground">
                            {unit.count} item
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatCompactIDR(unit.total_budget)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          style={{ width: `${widthPct}%` }}
                          className="h-full rounded-full bg-primary/80 transition-all group-hover:bg-primary"
                        />
                      </div>
                    </Link>
                  );
                })}

                {/* Others row */}
                {otherUnits.length > 0 && (
                  <div className="mt-1 border-t border-dashed pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setIsOtherUnitsExpanded(!isOtherUnitsExpanded)
                      }
                      className="flex w-full items-center justify-between py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span>Lainnya ({otherUnits.length} unit)</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span>{otherUnitsCount} item</span>
                        <span className="font-semibold">
                          {formatCompactIDR(otherUnitsTotalBudget)}
                        </span>
                      </div>
                    </button>

                    {isOtherUnitsExpanded && (
                      <div className="mt-2 flex flex-col gap-2 border-l border-border/80 pl-2">
                        {otherUnits.map((unit) => (
                          <Link
                            key={unit.unit_id ?? unit.name}
                            href={needRoutes.index.url({
                              query: {
                                need_group_id: groupId,
                                ...(unit.unit_id
                                  ? {
                                      organizational_unit_id: [
                                        unit.unit_id.toString(),
                                      ],
                                    }
                                  : {}),
                                stage: ['draft', 'under_review', 'approved'],
                              },
                            })}
                            className="flex items-center justify-between text-xss text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <span className="max-w-[70%] truncate">
                              {unit.name}
                            </span>
                            <span className="font-mono">
                              {formatCompactIDR(unit.total_budget)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget by Need Type (W7) */}
        <Card className="border-border/70 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <RiStackLine className="size-4 text-muted-foreground" />
              <CardTitle>Anggaran per Jenis Kebutuhan</CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Top 6 Kategori
            </span>
          </CardHeader>
          <CardContent>
            {needsByType.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Belum ada kategori kebutuhan.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {needsByType.map((type) => (
                  <Link
                    key={type.type_id}
                    href={needRoutes.index.url({
                      query: {
                        need_group_id: groupId,
                        need_type_id: [type.type_id.toString()],
                        stage: ['draft', 'under_review', 'approved'],
                      },
                    })}
                    className="group -mx-1.5 flex flex-col gap-1 rounded-md p-1.5 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="max-w-[60%] truncate font-medium text-foreground">
                        {type.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted-foreground">
                          {type.percentage}%
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCompactIDR(type.total_budget)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        style={{ width: `${Math.max(type.percentage, 3)}%` }}
                        className="h-full rounded-full bg-info/80 transition-all group-hover:bg-info"
                      />
                    </div>
                    <div className="flex items-center justify-between font-mono text-xss text-muted-foreground">
                      <span>{type.count} usulan</span>
                      {type.avg_ticket ? (
                        <span>Rata: {formatCompactIDR(type.avg_ticket)}</span>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
