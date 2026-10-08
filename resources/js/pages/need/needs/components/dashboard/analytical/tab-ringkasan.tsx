import { Link } from '@inertiajs/react';
import {
  RiArrowRightLine,
  RiCheckLine,
  RiTimeLine,
  RiAlertLine,
  RiShieldCheckLine,
  RiStarLine,
  RiBuildingLine,
  RiPriceTag3Line,
} from '@remixicon/react';
import { useMemo, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

import type {
  BreakdownDimension,
  BreakdownMetric,
  BreakdownRow,
  DerivedStage,
  SlicedMetrics,
  SliceState,
} from './analytical-types';
import { AnalyticalWidgetFrame } from './analytical-widget-frame';

interface TabRingkasanProps {
  payload: NeedsDashboardPayload;
  slice: SliceState;
  onSliceChange: (updater: (prev: SliceState) => SliceState) => void;
  metrics: SlicedMetrics;
}

export function TabRingkasan({
  payload,
  slice,
  onSliceChange,
  metrics,
}: TabRingkasanProps) {
  const { currentGroup, needsByUnit, needsByType, stageDistribution, matrix } =
    payload;
  const groupId = currentGroup?.id;

  // Breakdown Explorer States
  const [selectedMetric, setSelectedMetric] =
    useState<BreakdownMetric>('budget');
  const [selectedDimension, setSelectedDimension] =
    useState<BreakdownDimension>('unit');

  // Check if dimension is pinned in slice
  const isUnitPinned = slice.unitIds.length === 1;
  const isTypePinned = slice.typeIds.length === 1;
  const isStagePinned = slice.stages.length === 1;

  // Auto fallback if dimension is pinned
  const effectiveDimension: BreakdownDimension = useMemo(() => {
    if (selectedDimension === 'unit' && isUnitPinned) {
      return 'type';
    }

    if (selectedDimension === 'type' && isTypePinned) {
      return 'stage';
    }

    if (selectedDimension === 'stage' && isStagePinned) {
      return 'unit';
    }

    return selectedDimension;
  }, [selectedDimension, isUnitPinned, isTypePinned, isStagePinned]);

  // Compute Breakdown Explorer Rows
  const breakdownRows: BreakdownRow[] = useMemo(() => {
    let rawItems: Array<{
      key: string;
      label: string;
      count: number;
      budget: number;
      rawValue?: string | number | null;
    }> = [];

    switch (effectiveDimension) {
      case 'unit':
        rawItems = needsByUnit.map((u) => ({
          key: `unit-${u.unit_id}`,
          label: u.name,
          count: u.count,
          budget: u.total_budget,
          rawValue: u.unit_id,
        }));
        break;

      case 'type':
        rawItems = needsByType.map((t) => ({
          key: `type-${t.type_id}`,
          label: t.name,
          count: t.count,
          budget: t.total_budget,
          rawValue: t.type_id,
        }));
        break;

      case 'stage':
        rawItems = [
          {
            key: 'stage-approved',
            label: 'Disetujui Direktur',
            count: stageDistribution.approved.count,
            budget: stageDistribution.approved.budget,
            rawValue: 'approved',
          },
          {
            key: 'stage-under_review',
            label: 'Menunggu Review',
            count: stageDistribution.under_review.count,
            budget: stageDistribution.under_review.budget,
            rawValue: 'under_review',
          },
          {
            key: 'stage-draft',
            label: 'Draft Pengajuan',
            count: stageDistribution.draft.count,
            budget: stageDistribution.draft.budget,
            rawValue: 'draft',
          },
          {
            key: 'stage-rejected',
            label: 'Ditolak / Revisi',
            count: stageDistribution.rejected.count,
            budget: stageDistribution.rejected.budget,
            rawValue: 'rejected',
          },
        ];
        break;

      case 'priority':
        rawItems = [
          {
            key: 'p-priority',
            label: 'Prioritas Tinggi',
            count: metrics.priorityCount,
            budget: metrics.priorityBudget,
            rawValue: 'priority_only',
          },
          {
            key: 'p-normal',
            label: 'Non-Prioritas',
            count: Math.max(0, metrics.totalCount - metrics.priorityCount),
            budget: Math.max(0, metrics.totalBudget - metrics.priorityBudget),
            rawValue: 'non_priority',
          },
        ];
        break;

      case 'urgency': {
        const urgencies = ['high', 'medium', 'low'] as const;
        const urgencyLabels = {
          high: 'Urgensi Tinggi',
          medium: 'Urgensi Sedang',
          low: 'Urgensi Rendah',
        };
        rawItems = urgencies.map((u) => {
          let c = 0;
          let b = 0;
          ['high', 'medium', 'low'].forEach((imp) => {
            const cell = matrix[`${u}_${imp}`];

            if (cell) {
              c += cell.count;
              b += cell.budget;
            }
          });

          return {
            key: `urgency-${u}`,
            label: urgencyLabels[u],
            count: c,
            budget: b,
            rawValue: u,
          };
        });
        break;
      }

      case 'impact': {
        const impacts = ['high', 'medium', 'low'] as const;
        const impactLabels = {
          high: 'Dampak Tinggi',
          medium: 'Dampak Sedang',
          low: 'Dampak Rendah',
        };
        rawItems = impacts.map((imp) => {
          let c = 0;
          let b = 0;
          ['high', 'medium', 'low'].forEach((u) => {
            const cell = matrix[`${u}_${imp}`];

            if (cell) {
              c += cell.count;
              b += cell.budget;
            }
          });

          return {
            key: `impact-${imp}`,
            label: impactLabels[imp],
            count: c,
            budget: b,
            rawValue: imp,
          };
        });
        break;
      }

      case 'checklist':
        rawItems = [
          {
            key: 'cl-ready',
            label: 'Siap Telaah (Skor >= 85%)',
            count: payload.checklistBuckets['81-100'] ?? 0,
            budget: 0,
            rawValue: 'ready',
          },
          {
            key: 'cl-mid',
            label: 'Skor Sedang (61-80%)',
            count: payload.checklistBuckets['61-80'] ?? 0,
            budget: 0,
            rawValue: 'low',
          },
          {
            key: 'cl-low',
            label: 'Skor Rendah (<= 60%)',
            count:
              (payload.checklistBuckets['0-20'] ?? 0) +
              (payload.checklistBuckets['21-40'] ?? 0) +
              (payload.checklistBuckets['41-60'] ?? 0),
            budget: 0,
            rawValue: 'low',
          },
        ];
        break;
    }

    const totalVal =
      selectedMetric === 'budget'
        ? rawItems.reduce((acc, r) => acc + r.budget, 0)
        : rawItems.reduce((acc, r) => acc + r.count, 0);

    const avgVal = rawItems.length > 0 ? totalVal / rawItems.length : 0;

    // Sort descending by selected metric
    const sorted = [...rawItems].sort((a, b) => {
      const valA = selectedMetric === 'budget' ? a.budget : a.count;
      const valB = selectedMetric === 'budget' ? b.budget : b.count;

      return valB - valA;
    });

    return sorted.map((item, index) => {
      const val = selectedMetric === 'budget' ? item.budget : item.count;
      const pct = totalVal > 0 ? (val / totalVal) * 100 : 0;
      const delta = avgVal > 0 ? ((val - avgVal) / avgVal) * 100 : 0;

      return {
        key: item.key,
        label: item.label,
        metricValue: val,
        percentage: pct,
        rank: index + 1,
        deltaFromAvg: delta,
        rawValue: item.rawValue,
        dimensionKey: effectiveDimension,
      };
    });
  }, [
    effectiveDimension,
    selectedMetric,
    needsByUnit,
    needsByType,
    stageDistribution,
    metrics,
    matrix,
    payload.checklistBuckets,
  ]);

  // Handle clicking a row in breakdown explorer to cross-filter
  const handleCrossFilter = (row: BreakdownRow) => {
    if (!row.rawValue) {
      return;
    }

    onSliceChange((prev) => {
      switch (row.dimensionKey) {
        case 'unit': {
          const uId = Number(row.rawValue);

          return {
            ...prev,
            unitIds: prev.unitIds.includes(uId)
              ? prev.unitIds.filter((id) => id !== uId)
              : [uId],
          };
        }
        case 'type': {
          const tId = Number(row.rawValue);

          return {
            ...prev,
            typeIds: prev.typeIds.includes(tId)
              ? prev.typeIds.filter((id) => id !== tId)
              : [tId],
          };
        }
        case 'stage': {
          const st = String(row.rawValue) as DerivedStage;

          return {
            ...prev,
            stages: prev.stages.includes(st)
              ? prev.stages.filter((s) => s !== st)
              : [st],
          };
        }
        case 'priority':
          return {
            ...prev,
            priority:
              prev.priority === row.rawValue
                ? 'all'
                : (row.rawValue as 'priority_only' | 'non_priority'),
          };
        case 'urgency': {
          const u = row.rawValue as 'high' | 'medium' | 'low';

          return {
            ...prev,
            urgencies: prev.urgencies.includes(u)
              ? prev.urgencies.filter((item) => item !== u)
              : [u],
          };
        }
        case 'impact': {
          const imp = row.rawValue as 'high' | 'medium' | 'low';

          return {
            ...prev,
            impacts: prev.impacts.includes(imp)
              ? prev.impacts.filter((item) => item !== imp)
              : [imp],
          };
        }
        case 'checklist':
          return {
            ...prev,
            checklistBand:
              prev.checklistBand === row.rawValue
                ? 'all'
                : (row.rawValue as 'ready' | 'low'),
          };
        default:
          return prev;
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. KPI STRIP (Section 6) */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* KPI 1: Total Usulan Cocok */}
        <Card size="sm" className="border-border/70 shadow-xs">
          <CardHeader>
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Total Usulan
            </span>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {formatNumber(metrics.totalCount)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Estimasi belanja {formatCompactIDR(metrics.totalBudget)}
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Disetujui Direktur */}
        <Card size="sm" className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Disetujui Direktur
            </span>
            <RiCheckLine className="size-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-success-foreground dark:text-success">
              {formatNumber(metrics.approvedCount)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {formatCompactIDR(metrics.approvedBudget)} terkunci
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Menunggu Review */}
        <Card size="sm" className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Menunggu Review
            </span>
            <RiTimeLine className="size-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-warning-foreground dark:text-warning">
              {formatNumber(metrics.reviewCount)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {formatCompactIDR(metrics.reviewBudget)} butuh telaah
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Kesiapan Data (Readiness) */}
        <Card size="sm" className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Kesiapan Data
            </span>
            <RiShieldCheckLine className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {formatPercent(metrics.avgReadiness)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Dinilai {metrics.assessedCount} dari {metrics.totalCount} usulan
            </p>
          </CardContent>
        </Card>

        {/* KPI 5: Porsi Prioritas */}
        <Card size="sm" className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Porsi Prioritas
            </span>
            <RiStarLine className="size-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-warning-foreground dark:text-warning">
              {formatNumber(metrics.priorityCount)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {metrics.totalCount > 0
                ? Math.round((metrics.priorityCount / metrics.totalCount) * 100)
                : 0}
              % dari total pengajuan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informational Sub-Strip: Ditolak / Butuh Revisi */}
      {metrics.rejectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <RiAlertLine className="size-4 shrink-0 text-destructive" />
            <span>
              <strong>Ditolak / Butuh Revisi:</strong> Terdata{' '}
              <span className="font-mono font-semibold">
                {metrics.rejectedCount} usulan
              </span>{' '}
              senilai{' '}
              <span className="font-mono font-semibold">
                {formatCompactIDR(metrics.rejectedBudget)}
              </span>{' '}
              yang dikecualikan dari total belanja aktif.
            </span>
          </div>

          <Link
            href={needRoutes.index.url({
              query: { need_group_id: groupId, stage: ['rejected'] },
            })}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'h-7 border-destructive/30 bg-background text-xs text-destructive hover:bg-destructive/10',
            )}
          >
            <span>Lihat Usulan Ditolak</span>
            <RiArrowRightLine className="size-3.5" />
          </Link>
        </div>
      )}

      {/* 2. STAGE COMPOSITION (Distribusi per Tahapan Siklus) */}
      <AnalyticalWidgetFrame
        title="Distribusi Tahapan Siklus"
        subtitle="Komposisi usulan berdasarkan status kelayakan alur perencanaan. Klik segmen untuk mengisolasi irisan."
        infoTooltip="Klik pada nama atau baris tahapan untuk mengaktifkan filter irisan langsung."
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahapan</TableHead>
                <TableHead className="text-right">Banyak Usulan</TableHead>
                <TableHead className="text-right">Estimasi Anggaran</TableHead>
                <TableHead className="text-right">Porsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  key: 'approved' as DerivedStage,
                  name: 'Disetujui Direktur',
                  count: stageDistribution.approved.count,
                  budget: stageDistribution.approved.budget,
                  pct: stageDistribution.approved.percentage,
                },
                {
                  key: 'under_review' as DerivedStage,
                  name: 'Menunggu Review',
                  count: stageDistribution.under_review.count,
                  budget: stageDistribution.under_review.budget,
                  pct: stageDistribution.under_review.percentage,
                },
                {
                  key: 'draft' as DerivedStage,
                  name: 'Draft Pengajuan',
                  count: stageDistribution.draft.count,
                  budget: stageDistribution.draft.budget,
                  pct: stageDistribution.draft.percentage,
                },
                {
                  key: 'rejected' as DerivedStage,
                  name: 'Ditolak / Revisi',
                  count: stageDistribution.rejected.count,
                  budget: stageDistribution.rejected.budget,
                  pct: stageDistribution.rejected.percentage,
                },
              ].map((stage) => (
                <TableRow key={stage.key}>
                  <TableCell className="font-medium">{stage.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(stage.count)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCompactIDR(stage.budget)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {stage.pct}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={needRoutes.index.url({
                        query: {
                          need_group_id: groupId,
                          stage: [stage.key],
                        },
                      })}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'h-6 px-2 text-xs text-primary',
                      )}
                    >
                      Buka di daftar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      >
        <div className="flex flex-col gap-3.5">
          {/* Segmented Stacked Bar */}
          <div className="flex h-4 w-full overflow-hidden rounded-md bg-muted/60">
            {stageDistribution.approved.percentage > 0 && (
              <div
                style={{ width: `${stageDistribution.approved.percentage}%` }}
                className="group relative cursor-pointer bg-success transition-opacity hover:opacity-85"
                title={`Disetujui: ${stageDistribution.approved.percentage}%`}
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    stages: prev.stages.includes('approved')
                      ? prev.stages.filter((s) => s !== 'approved')
                      : ['approved'],
                  }))
                }
              />
            )}
            {stageDistribution.under_review.percentage > 0 && (
              <div
                style={{
                  width: `${stageDistribution.under_review.percentage}%`,
                }}
                className="group relative cursor-pointer bg-warning transition-opacity hover:opacity-85"
                title={`Menunggu Review: ${stageDistribution.under_review.percentage}%`}
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    stages: prev.stages.includes('under_review')
                      ? prev.stages.filter((s) => s !== 'under_review')
                      : ['under_review'],
                  }))
                }
              />
            )}
            {stageDistribution.draft.percentage > 0 && (
              <div
                style={{ width: `${stageDistribution.draft.percentage}%` }}
                className="group relative cursor-pointer bg-info transition-opacity hover:opacity-85"
                title={`Draft: ${stageDistribution.draft.percentage}%`}
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    stages: prev.stages.includes('draft')
                      ? prev.stages.filter((s) => s !== 'draft')
                      : ['draft'],
                  }))
                }
              />
            )}
            {stageDistribution.rejected.percentage > 0 && (
              <div
                style={{ width: `${stageDistribution.rejected.percentage}%` }}
                className="group relative cursor-pointer bg-destructive transition-opacity hover:opacity-85"
                title={`Ditolak: ${stageDistribution.rejected.percentage}%`}
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    stages: prev.stages.includes('rejected')
                      ? prev.stages.filter((s) => s !== 'rejected')
                      : ['rejected'],
                  }))
                }
              />
            )}
          </div>

          {/* Interactive Stage Legend Grid */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                key: 'approved' as DerivedStage,
                name: 'Disetujui Direktur',
                color: 'bg-success',
                count: stageDistribution.approved.count,
                budget: stageDistribution.approved.budget,
                pct: stageDistribution.approved.percentage,
              },
              {
                key: 'under_review' as DerivedStage,
                name: 'Menunggu Review',
                color: 'bg-warning',
                count: stageDistribution.under_review.count,
                budget: stageDistribution.under_review.budget,
                pct: stageDistribution.under_review.percentage,
              },
              {
                key: 'draft' as DerivedStage,
                name: 'Draft Pengajuan',
                color: 'bg-info',
                count: stageDistribution.draft.count,
                budget: stageDistribution.draft.budget,
                pct: stageDistribution.draft.percentage,
              },
              {
                key: 'rejected' as DerivedStage,
                name: 'Ditolak / Revisi',
                color: 'bg-destructive',
                count: stageDistribution.rejected.count,
                budget: stageDistribution.rejected.budget,
                pct: stageDistribution.rejected.percentage,
              },
            ].map((stage) => {
              const isSelected = slice.stages.includes(stage.key);

              return (
                <div
                  key={stage.key}
                  onClick={() =>
                    onSliceChange((prev) => ({
                      ...prev,
                      stages: prev.stages.includes(stage.key)
                        ? prev.stages.filter((s) => s !== stage.key)
                        : [stage.key],
                    }))
                  }
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-all hover:bg-accent/40',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border/60 bg-card',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn('size-2.5 rounded-full', stage.color)}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {stage.name}
                    </span>
                  </div>

                  <div className="mt-1 flex items-baseline justify-between font-mono">
                    <span className="text-sm font-bold text-foreground">
                      {formatNumber(stage.count)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stage.pct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{formatCompactIDR(stage.budget)}</span>
                    <span className="text-primary hover:underline">
                      Filter &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnalyticalWidgetFrame>

      {/* 3. BREAKDOWN EXPLORER (Signature Widget - Section 6) */}
      <AnalyticalWidgetFrame
        title="Eksplorasi Rincian (Breakdown Explorer)"
        subtitle="Analisis multi-dimensi perbandingan volume dan anggaran. Klik baris untuk menautkan filter silang."
        infoTooltip="Pilih metrik dan dimensi untuk mengevaluasi konsentrasi data dan pergeseran nilai terhadap rata-rata."
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setSelectedMetric('budget')}
                className={cn(
                  'cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                  selectedMetric === 'budget'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Total Anggaran
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('count')}
                className={cn(
                  'cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                  selectedMetric === 'count'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Banyak Usulan
              </button>
            </div>
          </div>
        }
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Peringkat</TableHead>
                <TableHead>Entitas / Kategori</TableHead>
                <TableHead className="text-right">
                  {selectedMetric === 'budget'
                    ? 'Estimasi Anggaran'
                    : 'Banyak Usulan'}
                </TableHead>
                <TableHead className="text-right">Porsi (%)</TableHead>
                <TableHead className="text-right">
                  Selisih vs Rata-rata
                </TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdownRows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{row.rank}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {selectedMetric === 'budget'
                      ? formatCompactIDR(row.metricValue)
                      : formatNumber(row.metricValue)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.percentage.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono',
                      row.deltaFromAvg >= 0
                        ? 'text-success-foreground dark:text-success'
                        : 'text-destructive',
                    )}
                  >
                    {row.deltaFromAvg >= 0 ? '+' : ''}
                    {row.deltaFromAvg.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCrossFilter(row)}
                      className="h-6 px-2 text-xs text-primary"
                    >
                      Pilih Irisan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Dimension Selector Ribbon */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
            <span className="text-[11px] font-medium text-muted-foreground">
              Dimensi Rincian:
            </span>

            {[
              {
                id: 'unit' as BreakdownDimension,
                label: 'Unit Kerja',
                icon: RiBuildingLine,
                disabled: isUnitPinned,
                disabledReason: 'Unit telah dibatasi ke 1 pilihan dalam irisan',
              },
              {
                id: 'type' as BreakdownDimension,
                label: 'Kategori Kebutuhan',
                icon: RiPriceTag3Line,
                disabled: isTypePinned,
                disabledReason:
                  'Kategori telah dibatasi ke 1 pilihan dalam irisan',
              },
              {
                id: 'stage' as BreakdownDimension,
                label: 'Tahap Siklus',
                icon: RiTimeLine,
                disabled: isStagePinned,
                disabledReason:
                  'Tahapan telah dibatasi ke 1 pilihan dalam irisan',
              },
              {
                id: 'priority' as BreakdownDimension,
                label: 'Prioritas',
                icon: RiStarLine,
                disabled: false,
              },
              {
                id: 'urgency' as BreakdownDimension,
                label: 'Urgensi',
                icon: RiAlertLine,
                disabled: false,
              },
              {
                id: 'impact' as BreakdownDimension,
                label: 'Dampak',
                icon: RiAlertLine,
                disabled: false,
              },
              {
                id: 'checklist' as BreakdownDimension,
                label: 'Skor Checklist',
                icon: RiShieldCheckLine,
                disabled: false,
              },
            ].map((dim) => {
              const isActive = effectiveDimension === dim.id;

              return (
                <Button
                  key={dim.id}
                  type="button"
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  disabled={dim.disabled}
                  onClick={() => setSelectedDimension(dim.id)}
                  title={dim.disabled ? dim.disabledReason : undefined}
                  className={cn(
                    'h-7 cursor-pointer gap-1 px-2.5 text-xs font-normal',
                    isActive && 'font-medium shadow-xs',
                    dim.disabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <dim.icon className="size-3.5" />
                  <span>{dim.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Ranking Explorer Horizontal Bars */}
          <div className="flex flex-col gap-2.5">
            {breakdownRows.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Tidak ada data tersedia untuk kombinasi dimensi ini.
              </p>
            ) : (
              breakdownRows.slice(0, 10).map((row) => (
                <div
                  key={row.key}
                  onClick={() => handleCrossFilter(row)}
                  className="group flex cursor-pointer flex-col gap-1 rounded-lg border border-transparent p-2 transition-colors hover:border-border/70 hover:bg-accent/40"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex max-w-[65%] items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                        #{row.rank}
                      </span>
                      <span className="truncate font-medium text-foreground group-hover:text-primary">
                        {row.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="font-semibold text-foreground">
                        {selectedMetric === 'budget'
                          ? formatCompactIDR(row.metricValue)
                          : `${formatNumber(row.metricValue)} usulan`}
                      </span>
                      <span className="text-muted-foreground">
                        ({row.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar with Delta Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        style={{ width: `${Math.max(row.percentage, 2)}%` }}
                        className={cn(
                          'h-full rounded-full transition-all',
                          row.rank === 1
                            ? 'bg-primary'
                            : row.rank <= 3
                              ? 'bg-primary/80'
                              : 'bg-primary/50',
                        )}
                      />
                    </div>

                    <span
                      className={cn(
                        'w-16 shrink-0 text-right font-mono text-[10px]',
                        row.deltaFromAvg >= 0
                          ? 'text-success-foreground dark:text-success'
                          : 'text-muted-foreground',
                      )}
                    >
                      {row.deltaFromAvg >= 0 ? '+' : ''}
                      {row.deltaFromAvg.toFixed(0)}% avg
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AnalyticalWidgetFrame>
    </div>
  );
}
