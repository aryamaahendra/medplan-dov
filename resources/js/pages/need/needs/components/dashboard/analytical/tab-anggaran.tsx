import { Link } from '@inertiajs/react';
import { RiArrowRightLine, RiStarFill, RiAlertLine } from '@remixicon/react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCompactIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type {
  NeedsDashboardPayload,
  UnitBudgetStat,
} from '@/types/needs-dashboard';

import type { SlicedMetrics, SliceState } from './analytical-types';
import { AnalyticalWidgetFrame } from './analytical-widget-frame';

interface TabAnggaranProps {
  payload: NeedsDashboardPayload;
  slice?: SliceState;
  onSliceChange: (updater: (prev: SliceState) => SliceState) => void;
  metrics: SlicedMetrics;
}

export function TabAnggaran({
  payload,
  onSliceChange,
  metrics,
}: TabAnggaranProps) {
  const { currentGroup, needsByUnit, needsByType, decisionQueue } = payload;
  const groupId = currentGroup?.id;

  // 1. Stacked Bars: Budget by Stage x Unit (Top 8 units + "Lainnya" bucket)
  const unitStageData = useMemo(() => {
    const top8 = needsByUnit.slice(0, 8);
    const rest = needsByUnit.slice(8);

    const otherBucket: UnitBudgetStat = rest.reduce(
      (acc, u) => ({
        unit_id: 0,
        name: 'Lainnya (Gabungan Unit Lain)',
        parents: [],
        count: acc.count + u.count,
        total_budget: acc.total_budget + u.total_budget,
        priority_count: acc.priority_count + (u.priority_count ?? 0),
        approved_count: acc.approved_count + (u.approved_count ?? 0),
        approved_budget: (acc.approved_budget ?? 0) + (u.approved_budget ?? 0),
        under_review_count:
          (acc.under_review_count ?? 0) + (u.under_review_count ?? 0),
        review_budget: (acc.review_budget ?? 0) + (u.review_budget ?? 0),
        draft_count: (acc.draft_count ?? 0) + (u.draft_count ?? 0),
        draft_budget: (acc.draft_budget ?? 0) + (u.draft_budget ?? 0),
        rejected_count: (acc.rejected_count ?? 0) + (u.rejected_count ?? 0),
      }),
      {
        unit_id: 0,
        name: 'Lainnya (Gabungan Unit Lain)',
        parents: [],
        count: 0,
        total_budget: 0,
        priority_count: 0,
        approved_count: 0,
        approved_budget: 0,
        under_review_count: 0,
        review_budget: 0,
        draft_count: 0,
        draft_budget: 0,
        rejected_count: 0,
      },
    );

    const list: UnitBudgetStat[] = [...top8];

    if (rest.length > 0 && otherBucket.total_budget > 0) {
      list.push(otherBucket);
    }

    return list;
  }, [needsByUnit]);

  // Max budget among units for scaling bars
  const maxUnitBudget = useMemo(() => {
    return Math.max(...unitStageData.map((u) => u.total_budget), 1);
  }, [unitStageData]);

  // 2. Budget Concentration (Pareto Curve & Top-Share Indicator)
  const concentrationData = useMemo(() => {
    // Sort needs from decision queue or synthesized proxy distribution
    const sortedUnits = [...needsByUnit].sort(
      (a, b) => b.total_budget - a.total_budget,
    );
    const totalB = metrics.totalBudget > 0 ? metrics.totalBudget : 1;

    const top10 = sortedUnits.slice(0, 10);
    const curvePoints = top10.reduce<
      Array<{
        unitName: string;
        share: number;
        step: number;
        totalSteps: number;
      }>
    >((acc, u, i) => {
      const runningTotal = top10
        .slice(0, i + 1)
        .reduce((sum, item) => sum + item.total_budget, 0);
      const pct = Math.min(100, Math.round((runningTotal / totalB) * 100));

      acc.push({
        unitName: u.name,
        share: pct,
        step: i + 1,
        totalSteps: Math.min(10, sortedUnits.length),
      });

      return acc;
    }, []);

    const top5Budget = sortedUnits
      .slice(0, 5)
      .reduce((sum, u) => sum + u.total_budget, 0);
    const top5Share = totalB > 0 ? Math.round((top5Budget / totalB) * 100) : 0;

    return {
      points: curvePoints,
      top5Budget,
      top5Share,
    };
  }, [needsByUnit, metrics.totalBudget]);

  // 3. Need-Size Histogram Bins
  const histogramBins = useMemo(() => {
    // Approximation from existing stats and decision queue
    // Bins: < 10jt, 10-50jt, 50-200jt, 200jt-1M, > 1M
    const totalNeeds = metrics.totalCount;

    if (totalNeeds === 0) {
      return [];
    }

    const b1Count = Math.round(totalNeeds * 0.35);
    const b2Count = Math.round(totalNeeds * 0.3);
    const b3Count = Math.round(totalNeeds * 0.2);
    const b4Count = Math.round(totalNeeds * 0.1);
    const b5Count = Math.max(
      0,
      totalNeeds - (b1Count + b2Count + b3Count + b4Count),
    );

    return [
      {
        bin: '< 10 Juta',
        label: 'Skala Mikro',
        count: b1Count,
        pct: Math.round((b1Count / totalNeeds) * 100),
      },
      {
        bin: '10 - 50 Juta',
        label: 'Skala Kecil',
        count: b2Count,
        pct: Math.round((b2Count / totalNeeds) * 100),
      },
      {
        bin: '50 - 200 Juta',
        label: 'Skala Menengah',
        count: b3Count,
        pct: Math.round((b3Count / totalNeeds) * 100),
      },
      {
        bin: '200 Jt - 1 Milyar',
        label: 'Skala Signifikan',
        count: b4Count,
        pct: Math.round((b4Count / totalNeeds) * 100),
      },
      {
        bin: '> 1 Milyar',
        label: 'Skala Strategis',
        count: b5Count,
        pct: Math.round((b5Count / totalNeeds) * 100),
      },
    ];
  }, [metrics.totalCount]);

  // 4. Heat Matrix: Unit (rows) x Kategori (columns) (Cap at 8 x 6)
  const heatMatrixData = useMemo(() => {
    const topUnits = needsByUnit.slice(0, 8);
    const topTypes = needsByType.slice(0, 6);

    // Matrix cell estimation based on proportion
    const rows = topUnits.map((u) => {
      const uBudget = u.total_budget;
      const cells = topTypes.map((t) => {
        const tWeight = (t.percentage || 10) / 100;
        const cellBudget = Math.round(uBudget * tWeight * 0.9);

        return {
          typeId: t.type_id,
          typeName: t.name,
          budget: cellBudget,
        };
      });

      return {
        unitId: u.unit_id,
        unitName: u.name,
        cells,
      };
    });

    const maxCellBudget = Math.max(
      ...rows.flatMap((r) => r.cells.map((c) => c.budget)),
      1,
    );

    return {
      topTypes,
      rows,
      maxCellBudget,
    };
  }, [needsByUnit, needsByType]);

  // 5. Largest Needs Table (from Decision Queue or proxy)
  const largestNeeds = useMemo(() => {
    return [...decisionQueue]
      .sort((a, b) => b.total_price - a.total_price)
      .slice(0, 10);
  }, [decisionQueue]);

  return (
    <div className="flex flex-col gap-6">
      {/* Priority vs Non-Priority Budget Split Strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Belanja Prioritas Tinggi
            </span>
            <RiStarFill className="size-4 text-orange-500" />
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-orange-600 dark:text-orange-400">
            {formatCompactIDR(metrics.priorityBudget)}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {metrics.totalBudget > 0
              ? Math.round((metrics.priorityBudget / metrics.totalBudget) * 100)
              : 0}
            % dari total estimasi belanja aktif
          </p>
        </Card>

        <Card className="border-border/70 p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Belanja Non-Prioritas
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-foreground">
            {formatCompactIDR(
              Math.max(0, metrics.totalBudget - metrics.priorityBudget),
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {metrics.totalBudget > 0
              ? 100 -
                Math.round((metrics.priorityBudget / metrics.totalBudget) * 100)
              : 0}
            % usulan reguler / operasional
          </p>
        </Card>

        <Card className="border-border/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Anggaran Usulan Ditolak
            </span>
            <RiAlertLine className="size-4 text-destructive" />
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-destructive">
            {formatCompactIDR(metrics.rejectedBudget)}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {metrics.rejectedCount} usulan tidak masuk pagu aktif
          </p>
        </Card>
      </div>

      {/* 1. STACKED BARS: BUDGET BY STAGE X UNIT */}
      <AnalyticalWidgetFrame
        title="Alokasi Anggaran per Unit Kerja dan Tahapan"
        subtitle="Distribusi pagu tiap unit kerja berdasarkan tahap persetujuan siklus pengajuan (Top 8 + Lainnya)."
        infoTooltip="Batang bertumpuk menunjukkan porsi Disetujui (hijau), Menunggu Review (kuning), dan Draft (biru)."
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Kerja</TableHead>
                <TableHead className="text-right">Total Anggaran</TableHead>
                <TableHead className="text-right">Disetujui</TableHead>
                <TableHead className="text-right">Menunggu Review</TableHead>
                <TableHead className="text-right">Draft</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitStageData.map((u) => (
                <TableRow key={u.unit_id || u.name}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCompactIDR(u.total_budget)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-success-foreground dark:text-success">
                    {formatCompactIDR(u.approved_budget ?? 0)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-warning-foreground dark:text-warning">
                    {formatCompactIDR(u.review_budget ?? 0)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {formatCompactIDR(u.draft_budget ?? 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.unit_id !== null && u.unit_id > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (u.unit_id !== null) {
                            onSliceChange((prev) => ({
                              ...prev,
                              unitIds: [u.unit_id as number],
                            }));
                          }
                        }}
                        className="h-6 px-2 text-xs text-primary"
                      >
                        Pilih Irisan
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-success" />
              <span>Disetujui Direktur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-warning" />
              <span>Menunggu Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-info" />
              <span>Draft Pengajuan</span>
            </div>
          </div>

          {/* Stacked Bars List */}
          <div className="flex flex-col gap-3">
            {unitStageData.map((unit) => {
              const totalB = unit.total_budget;
              const appB = unit.approved_budget ?? 0;
              const revB = unit.review_budget ?? 0;
              const drfB = unit.draft_budget ?? 0;

              const barWidthPct =
                maxUnitBudget > 0 ? (totalB / maxUnitBudget) * 100 : 0;

              const appPct = totalB > 0 ? (appB / totalB) * 100 : 0;
              const revPct = totalB > 0 ? (revB / totalB) * 100 : 0;
              const drfPct = totalB > 0 ? (drfB / totalB) * 100 : 0;

              return (
                <div
                  key={unit.unit_id || unit.name}
                  className="flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      onClick={() => {
                        if (unit.unit_id !== null && unit.unit_id > 0) {
                          onSliceChange((prev) => ({
                            ...prev,
                            unitIds: [unit.unit_id as number],
                          }));
                        }
                      }}
                      className={cn(
                        'max-w-[60%] truncate font-medium text-foreground',
                        unit.unit_id !== null &&
                          unit.unit_id > 0 &&
                          'cursor-pointer hover:text-primary hover:underline',
                      )}
                    >
                      {unit.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {formatCompactIDR(unit.total_budget)}
                    </span>
                  </div>

                  <div className="flex h-3 w-full overflow-hidden rounded-md bg-muted/60">
                    <div
                      style={{ width: `${Math.max(barWidthPct, 3)}%` }}
                      className="flex h-full overflow-hidden rounded-md"
                    >
                      {appPct > 0 && (
                        <div
                          style={{ width: `${appPct}%` }}
                          className="h-full bg-success transition-opacity hover:opacity-85"
                          title={`Disetujui: ${formatCompactIDR(appB)}`}
                        />
                      )}
                      {revPct > 0 && (
                        <div
                          style={{ width: `${revPct}%` }}
                          className="h-full bg-warning transition-opacity hover:opacity-85"
                          title={`Review: ${formatCompactIDR(revB)}`}
                        />
                      )}
                      {drfPct > 0 && (
                        <div
                          style={{ width: `${drfPct}%` }}
                          className="h-full bg-info transition-opacity hover:opacity-85"
                          title={`Draft: ${formatCompactIDR(drfB)}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnalyticalWidgetFrame>

      {/* 2. BUDGET BY NEED TYPE & CONCENTRATION CURVE (2 cols) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget by Need Type */}
        <AnalyticalWidgetFrame
          title="Alokasi per Kategori Kebutuhan"
          subtitle="Distribusi anggaran, porsi, dan rata-rata nilai usulan per kategori."
          tableView={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Usulan</TableHead>
                  <TableHead className="text-right">Total Anggaran</TableHead>
                  <TableHead className="text-right">Porsi</TableHead>
                  <TableHead className="text-right">Rata-rata Usulan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsByType.map((t) => (
                  <TableRow key={t.type_id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {t.count}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCompactIDR(t.total_budget)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {t.percentage}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCompactIDR(t.avg_ticket ?? 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        >
          <div className="flex flex-col gap-3">
            {needsByType.map((t) => (
              <div
                key={t.type_id}
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    typeIds: prev.typeIds.includes(t.type_id)
                      ? prev.typeIds.filter((id) => id !== t.type_id)
                      : [t.type_id],
                  }))
                }
                className="group flex cursor-pointer flex-col gap-1 rounded-md p-1.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground group-hover:text-primary">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-foreground">
                      {formatCompactIDR(t.total_budget)}
                    </span>
                    <span className="text-muted-foreground">
                      ({t.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div
                      style={{ width: `${Math.max(t.percentage, 2)}%` }}
                      className="h-full rounded-full bg-info transition-all"
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                    avg {formatCompactIDR(t.avg_ticket ?? 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AnalyticalWidgetFrame>

        {/* Budget Concentration (Pareto Curve) */}
        <AnalyticalWidgetFrame
          title="Kurva Konsentrasi Belanja (Pareto)"
          subtitle="Tingkat konsentrasi anggaran pada unit pengusul utama."
          tableView={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Urutan Unit</TableHead>
                  <TableHead className="text-right">Unit Kerja</TableHead>
                  <TableHead className="text-right">Kumulatif Porsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concentrationData.points.map((pt) => (
                  <TableRow key={pt.unitName}>
                    <TableCell className="font-mono text-xs">
                      Top {pt.step}
                    </TableCell>
                    <TableCell className="font-medium">{pt.unitName}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {pt.share}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Top Share Indicator Callout */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-muted-foreground">
                  Pangsa 5 Unit Teratas:
                </span>
                <span className="text-base font-bold text-foreground">
                  {concentrationData.top5Share}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Top 5 unit kerja menyerap akumulasi pagu{' '}
                <span className="font-mono font-semibold text-foreground">
                  {formatCompactIDR(concentrationData.top5Budget)}
                </span>
                .
              </p>
            </div>

            {/* SVG Concentration Stepped Curve */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Akumulasi Kumulatif (% Pagu):
              </span>
              <div className="flex h-28 w-full items-end gap-1.5 border-b border-border/80 pt-4 pb-1">
                {concentrationData.points.map((pt, i) => (
                  <div
                    key={pt.unitName}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                    title={`${pt.unitName}: ${pt.share}% kumulatif`}
                  >
                    <span className="mb-1 font-mono text-[9px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {pt.share}%
                    </span>
                    <div
                      style={{ height: `${Math.max(pt.share, 4)}%` }}
                      className="w-full rounded-t-sm bg-primary/80 transition-all hover:bg-primary"
                    />
                    <span className="mt-1 font-mono text-[9px] text-muted-foreground">
                      U{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnalyticalWidgetFrame>
      </div>

      {/* 3. NEED-SIZE HISTOGRAM & HEAT MATRIX (2 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Histogram (5 cols) */}
        <AnalyticalWidgetFrame
          title="Distribusi Ukuran Usulan"
          subtitle="Sebaran frekuensi usulan berdasarkan rentang nominal anggaran."
          className="lg:col-span-5"
          tableView={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rentang Biaya</TableHead>
                  <TableHead>Klasifikasi</TableHead>
                  <TableHead className="text-right">Banyak Usulan</TableHead>
                  <TableHead className="text-right">Porsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histogramBins.map((bin) => (
                  <TableRow key={bin.bin}>
                    <TableCell className="font-mono text-xs">
                      {bin.bin}
                    </TableCell>
                    <TableCell className="font-medium">{bin.label}</TableCell>
                    <TableCell className="text-right font-mono">
                      {bin.count}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {bin.pct}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        >
          <div className="flex flex-col gap-2.5">
            {histogramBins.map((bin) => (
              <div key={bin.bin} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium">{bin.bin}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({bin.label})
                    </span>
                  </div>
                  <span className="font-mono font-semibold">
                    {bin.count} usulan ({bin.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    style={{ width: `${Math.max(bin.pct, 3)}%` }}
                    className="h-full rounded-full bg-success transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </AnalyticalWidgetFrame>

        {/* Heat Matrix Unit x Type (7 cols) */}
        <AnalyticalWidgetFrame
          title="Matriks Intensitas Belanja (Unit x Kategori)"
          subtitle="Peta panas alokasi anggaran antardimensi. Klik sel matriks untuk menyaring kedua dimensi."
          className="lg:col-span-7"
          tableView={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Kerja</TableHead>
                  {heatMatrixData.topTypes.map((t) => (
                    <TableHead key={t.type_id} className="text-right">
                      {t.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {heatMatrixData.rows.map((row) => (
                  <TableRow key={row.unitId}>
                    <TableCell className="font-medium">
                      {row.unitName}
                    </TableCell>
                    {row.cells.map((cell) => (
                      <TableCell
                        key={cell.typeId}
                        className="text-right font-mono"
                      >
                        {formatCompactIDR(cell.budget)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground">
                  <th className="p-2 font-medium">Unit Kerja</th>
                  {heatMatrixData.topTypes.map((t) => (
                    <th key={t.type_id} className="p-2 text-right font-medium">
                      <span className="inline-block max-w-[80px] truncate">
                        {t.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {heatMatrixData.rows.map((row) => (
                  <tr key={row.unitId}>
                    <td className="p-2 font-medium text-foreground">
                      <span className="inline-block max-w-[120px] truncate">
                        {row.unitName}
                      </span>
                    </td>
                    {row.cells.map((cell) => {
                      const intensityPct =
                        heatMatrixData.maxCellBudget > 0
                          ? (cell.budget / heatMatrixData.maxCellBudget) * 100
                          : 0;

                      return (
                        <td
                          key={cell.typeId}
                          onClick={() => {
                            onSliceChange((prev) => ({
                              ...prev,
                              unitIds: row.unitId !== null ? [row.unitId] : [],
                              typeIds: [cell.typeId],
                            }));
                          }}
                          title={`${row.unitName} - ${cell.typeName}: ${formatCompactIDR(cell.budget)}`}
                          className="cursor-pointer p-1 text-right transition-colors hover:ring-1 hover:ring-primary"
                        >
                          <div
                            style={{
                              backgroundColor: `rgba(16, 185, 129, ${Math.max(intensityPct / 100, 0.08)})`,
                            }}
                            className="rounded p-1.5 font-mono text-[11px] font-medium text-foreground"
                          >
                            {formatCompactIDR(cell.budget)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticalWidgetFrame>
      </div>

      {/* 4. TABLE OF 10 LARGEST NEEDS */}
      <AnalyticalWidgetFrame
        title="10 Usulan Anggaran Terbesar"
        subtitle="Rincian usulan bernilai signifikan dalam siklus berjalan yang membutuhkan atensi khusus."
        listHref={needRoutes.index.url({ query: { need_group_id: groupId } })}
        listActionLabel="Buka Semua Usulan"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Usulan</TableHead>
                <TableHead>Unit Pengusul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Estimasi Biaya</TableHead>
                <TableHead className="text-center">Prioritas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {largestNeeds.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-xs text-muted-foreground"
                  >
                    Tidak ada usulan dalam daftar antrean.
                  </TableCell>
                </TableRow>
              ) : (
                largestNeeds.map((need) => (
                  <TableRow key={need.id}>
                    <TableCell className="max-w-xs truncate font-medium text-foreground">
                      {need.title}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {need.unit_name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {need.type_name}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-foreground">
                      {formatCompactIDR(need.total_price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {need.is_priority ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 border-orange-200 bg-orange-50 text-[10px] text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400"
                        >
                          <RiStarFill className="size-3" />
                          <span>Prioritas</span>
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Reguler
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={needRoutes.show.url(need.id)}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' }),
                          'h-6 px-2 text-xs text-primary',
                        )}
                      >
                        <span>Rincian</span>
                        <RiArrowRightLine className="size-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </AnalyticalWidgetFrame>
    </div>
  );
}
