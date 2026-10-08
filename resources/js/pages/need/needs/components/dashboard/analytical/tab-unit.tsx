import { Link } from '@inertiajs/react';
import { RiBuildingLine, RiArrowRightLine, RiLockLine } from '@remixicon/react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type {
  NeedsDashboardPayload,
  UnitBudgetStat,
  UnitProgressItem,
} from '@/types/needs-dashboard';

import type { SlicedMetrics, SliceState } from './analytical-types';
import { AnalyticalWidgetFrame } from './analytical-widget-frame';

interface TabUnitProps {
  payload: NeedsDashboardPayload;
  slice: SliceState;
  onSliceChange: (updater: (prev: SliceState) => SliceState) => void;
  metrics?: SlicedMetrics;
}

export function TabUnit({ payload, slice, onSliceChange }: TabUnitProps) {
  const { currentGroup, needsByUnit, allUnitProgress, myUnitData } = payload;
  const groupId = currentGroup?.id;
  const { hasRole } = usePermission();

  const isScopedRole = hasRole('unit-head') || hasRole('staff');

  // Selected Unit ID State:
  // For scoped roles, default to myUnitData.unit_id
  // For hospital-wide roles, default to first unit in needsByUnit or myUnitData
  const [selectedUnitId, setSelectedUnitId] = useState<number>(() => {
    if (slice.unitIds.length > 0) {
      return slice.unitIds[0];
    }

    if (myUnitData) {
      return myUnitData.unit_id;
    }

    return needsByUnit[0]?.unit_id ?? 0;
  });

  // Find currently active unit data
  const currentUnitStat = useMemo<UnitBudgetStat | undefined>(() => {
    return needsByUnit.find((u) => u.unit_id === selectedUnitId);
  }, [needsByUnit, selectedUnitId]);

  // Find direct child units of selected unit
  const childUnits = useMemo<UnitProgressItem[]>(() => {
    return allUnitProgress.filter((u) => u.parent_id === selectedUnitId);
  }, [allUnitProgress, selectedUnitId]);
  const approvalRate = useMemo(() => {
    if (!currentUnitStat || currentUnitStat.count === 0) {
      return 0;
    }

    return Math.round(
      (currentUnitStat.approved_count / currentUnitStat.count) * 100,
    );
  }, [currentUnitStat]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. UNIT SELECTOR & ROLE SCOPE NOTICE */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RiBuildingLine className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Unit Kerja Aktif
            </span>
            {isScopedRole && (
              <Badge
                variant="outline"
                className="gap-1 border-border/80 bg-muted/40 text-[10px] font-normal"
              >
                <RiLockLine className="size-3 text-muted-foreground" />
                <span>Cakupan Terkunci</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isScopedRole
              ? 'Tampilan dibatasi secara ketat hanya untuk data unit kerja Anda (DC5).'
              : 'Pilih unit kerja untuk memeriksa profil pengajuan dan hierarki turunan.'}
          </p>
        </div>

        {/* Unit Selector Dropdown (disabled for scoped roles) */}
        {!isScopedRole ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedUnitId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setSelectedUnitId(newId);
                onSliceChange((prev) => ({
                  ...prev,
                  unitIds: [newId],
                }));
              }}
              className="h-8 max-w-xs rounded-md border border-border/80 bg-background px-3 text-xs text-foreground outline-hidden focus:border-ring"
            >
              {needsByUnit.map((unit) => (
                <option
                  key={unit.unit_id ?? 'root'}
                  value={unit.unit_id !== null ? unit.unit_id : ''}
                >
                  {unit.name} ({unit.count} usulan)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="font-mono text-xs font-semibold text-foreground">
            {currentUnitStat?.name ?? myUnitData?.name}
          </div>
        )}
      </div>

      {/* 2. UNIT HEADER SNAPSHOT */}
      <Card className="border-border/70 p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-foreground">
                {currentUnitStat?.name ?? 'Unit Kerja'}
              </h3>
              <Badge
                variant={approvalRate >= 70 ? 'default' : 'secondary'}
                className="text-[10px]"
              >
                Tingkat Persetujuan {approvalRate}%
              </Badge>
            </div>

            {currentUnitStat?.parents && currentUnitStat.parents.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Induk Hirarki: {currentUnitStat.parents.join(' > ')}
              </p>
            )}
          </div>

          <Link
            href={needRoutes.index.url({
              query: {
                need_group_id: groupId,
                organizational_unit_id: [selectedUnitId.toString()],
              },
            })}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'h-8 gap-1.5 self-start px-3 text-xs font-medium shadow-xs',
            )}
          >
            <span>Buka Daftar Usulan Unit</span>
            <RiArrowRightLine className="size-3.5" />
          </Link>
        </div>

        {/* KPI Strip per Unit */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Total Usulan
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              {formatNumber(currentUnitStat?.count ?? 0)}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {formatCompactIDR(currentUnitStat?.total_budget ?? 0)}
            </span>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Disetujui Direktur
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatNumber(currentUnitStat?.approved_count ?? 0)}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {formatCompactIDR(currentUnitStat?.approved_budget ?? 0)}
            </span>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Menunggu Review
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatNumber(currentUnitStat?.under_review_count ?? 0)}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {formatCompactIDR(currentUnitStat?.review_budget ?? 0)}
            </span>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Draft / Perlu Tindak Lanjut
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              {formatNumber(currentUnitStat?.draft_count ?? 0)}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {formatCompactIDR(currentUnitStat?.draft_budget ?? 0)}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. CHILD-UNITS BREAKDOWN TABLE (Hierarki Sub-Unit) */}
      <AnalyticalWidgetFrame
        title="Hierarki Sub-Unit Kerja Terkait"
        subtitle="Rincian usulan pada unit-unit turunan di bawah koordinasi unit aktif."
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sub-Unit Kerja</TableHead>
                <TableHead className="text-right">Total Usulan</TableHead>
                <TableHead className="text-right">Estimasi Anggaran</TableHead>
                <TableHead className="text-right">Disetujui</TableHead>
                <TableHead className="text-right">Menunggu Review</TableHead>
                <TableHead className="text-right">Tingkat Setuju</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childUnits.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-xs text-muted-foreground"
                  >
                    Unit ini tidak memiliki sub-unit turunan langsung dalam
                    hirarki.
                  </TableCell>
                </TableRow>
              ) : (
                childUnits.map((child) => (
                  <TableRow key={child.unit_id}>
                    <TableCell className="font-medium text-foreground">
                      {child.name}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(child.total_needs)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCompactIDR(child.total_budget)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600">
                      {formatNumber(child.approved_count)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-amber-600">
                      {formatNumber(child.under_review_count)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {child.completion_rate}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={needRoutes.index.url({
                          query: {
                            need_group_id: groupId,
                            organizational_unit_id: [child.unit_id.toString()],
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
                ))
              )}
            </TableBody>
          </Table>
        }
      >
        {childUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
            <RiBuildingLine className="mb-2 size-8 text-muted-foreground/40" />
            <p className="font-medium text-foreground">
              Tidak Ada Sub-Unit Turunan
            </p>
            <p className="mt-0.5 max-w-sm text-muted-foreground">
              Unit ini merupakan unit pelaksana langsung tanpa pembagian divisi
              turunan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-Unit Kerja</TableHead>
                  <TableHead className="text-right">Total Usulan</TableHead>
                  <TableHead className="text-right">Estimasi Pagu</TableHead>
                  <TableHead className="text-right">Disetujui</TableHead>
                  <TableHead className="text-right">
                    Tingkat Persetujuan
                  </TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childUnits.map((child) => (
                  <TableRow key={child.unit_id}>
                    <TableCell className="font-medium text-foreground">
                      {child.name}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(child.total_needs)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCompactIDR(child.total_budget)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600">
                      {formatNumber(child.approved_count)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {child.completion_rate}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={needRoutes.index.url({
                          query: {
                            need_group_id: groupId,
                            organizational_unit_id: [child.unit_id.toString()],
                          },
                        })}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' }),
                          'h-6 px-2 text-xs text-primary',
                        )}
                      >
                        Lihat Usulan &rarr;
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </AnalyticalWidgetFrame>
    </div>
  );
}
