import { Link } from '@inertiajs/react';
import {
  RiAlertLine,
  RiTimeLine,
  RiLockLine,
  RiLockUnlockLine,
  RiFileCheckLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiFileTextLine,
  RiBuildingLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type {
  NeedsDashboardPayload,
  UnitProgressItem,
} from '@/types/needs-dashboard';

interface VariantBProps {
  payload: NeedsDashboardPayload;
  onOpenLockDialog?: (needId: number, mode: 'lock' | 'unlock') => void;
}

export function VariantBOperations({
  payload,
  onOpenLockDialog,
}: VariantBProps) {
  const {
    currentGroup,
    stats,
    stageDistribution,
    allUnitProgress,
    dataReadiness,
    exceptions,
    activeUnlocks,
  } = payload;
  const groupId = currentGroup?.id;

  const [hideZeroUnits, setHideZeroUnits] = useState(false);

  const filteredUnitProgress = hideZeroUnits
    ? allUnitProgress.filter((u) => u.has_submission)
    : allUnitProgress;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Cycle Status Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              currentGroup?.window_status === 'open' ? 'default' : 'secondary'
            }
            className="h-6"
          >
            Siklus: {currentGroup?.name} ({currentGroup?.year})
          </Badge>
          <span className="text-xs text-muted-foreground">
            Terkunci:{' '}
            <strong className="font-mono text-foreground">
              {stats.locked_count}
            </strong>{' '}
            usulan
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="text-xs text-muted-foreground">
            Izin Perpanjangan Aktif:{' '}
            <strong className="font-mono text-foreground">
              {activeUnlocks.length}
            </strong>{' '}
            usulan
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Total Permohonan:{' '}
            <strong className="font-mono text-foreground">
              {stats.total_needs}
            </strong>
          </span>
          <span>-</span>
          <span>
            Anggaran:{' '}
            <strong className="font-mono text-foreground">
              {formatCompactIDR(stats.total_budget)}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. Interactive Pipeline Cards (Click = stage filter launchpad) */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Draft Stage */}
        <Link
          href={needRoutes.index.url({
            query: { need_group_id: groupId, status: ['draft'] },
          })}
          className="group block"
        >
          <Card className="h-full border-border/70 transition-all hover:border-primary/50 hover:shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3.5 pb-1">
              <span className="text-xs font-medium text-muted-foreground">
                1. DRAFT
              </span>
              <RiFileTextLine className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-3">
              <div className="font-mono text-xl font-bold">
                {formatNumber(stageDistribution.draft.count)}
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {formatCompactIDR(stageDistribution.draft.budget)} (
                {stageDistribution.draft.percentage}%)
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Under Review Stage */}
        <Link
          href={needRoutes.index.url({
            query: {
              need_group_id: groupId,
              status: ['approved'],
              is_approved_by_director: ['0'],
            },
          })}
          className="group block"
        >
          <Card className="h-full border-amber-500/30 bg-amber-500/5 transition-all hover:border-amber-500/60 hover:shadow-xs dark:bg-amber-500/10">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3.5 pb-1">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                2. MENUNGGU REVIEW
              </span>
              <RiTimeLine className="size-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-3">
              <div className="font-mono text-xl font-bold text-amber-800 dark:text-amber-300">
                {formatNumber(stageDistribution.under_review.count)}
              </div>
              <p className="mt-1 font-mono text-[11px] text-amber-700/80 dark:text-amber-400/80">
                {formatCompactIDR(stageDistribution.under_review.budget)} (
                {stageDistribution.under_review.percentage}%)
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Approved Stage */}
        <Link
          href={needRoutes.index.url({
            query: { need_group_id: groupId, is_approved_by_director: ['1'] },
          })}
          className="group block"
        >
          <Card className="h-full border-emerald-500/30 bg-emerald-500/5 transition-all hover:border-emerald-500/60 hover:shadow-xs dark:bg-emerald-500/10">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3.5 pb-1">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                3. DISETUJUI DIREKTUR
              </span>
              <RiCheckboxCircleLine className="size-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-3">
              <div className="font-mono text-xl font-bold text-emerald-800 dark:text-emerald-300">
                {formatNumber(stageDistribution.approved.count)}
              </div>
              <p className="mt-1 font-mono text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                {formatCompactIDR(stageDistribution.approved.budget)} (
                {stageDistribution.approved.percentage}%)
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Rejected Stage */}
        <Link
          href={needRoutes.index.url({
            query: { need_group_id: groupId, status: ['rejected'] },
          })}
          className="group block"
        >
          <Card className="h-full border-border/70 transition-all hover:border-destructive/50 hover:shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3.5 pb-1">
              <span className="text-xs font-medium text-destructive">
                4. DITOLAK / REVISI
              </span>
              <RiCloseCircleLine className="size-4 text-destructive" />
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-3">
              <div className="font-mono text-xl font-bold text-destructive">
                {formatNumber(stageDistribution.rejected.count)}
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {formatCompactIDR(stageDistribution.rejected.budget)} (
                {stageDistribution.rejected.percentage}%)
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Locked Overlay */}
        <Link
          href={needRoutes.index.url({ query: { need_group_id: groupId } })}
          className="group block"
        >
          <Card className="h-full border-border/70 bg-muted/30 transition-all hover:border-primary/50 hover:shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3.5 pb-1">
              <span className="text-xs font-medium text-muted-foreground">
                5. STATUS TERKUNCI
              </span>
              <RiLockLine className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-3">
              <div className="font-mono text-xl font-bold">
                {formatNumber(stats.locked_count)}
              </div>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                Usulan dengan kunci efektif
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. 2-Column Grid: Exceptions (Needs Attention) + Unit Submission Progress Table */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left (5 cols): Exceptions Strip */}
        <Card className="border-border/70 lg:col-span-5">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <RiAlertLine className="size-4 text-amber-600" />
              Perlu Perhatian (Exceptions)
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Usulan macet, syarat kelengkapan kurang, atau batas revisi
              mendekat
            </p>
          </CardHeader>
          <CardContent className="px-5 pt-0 pb-4">
            <div className="flex flex-col divide-y divide-border/60">
              {/* Rule 1: Draft checklist < 50% */}
              <Link
                href={needRoutes.index.url({
                  query: { need_group_id: groupId, status: ['draft'] },
                })}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-amber-500" />
                  <span className="truncate text-xs text-foreground">
                    Draft dengan checklist skor &lt; 50%
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 shrink-0 font-mono text-xs"
                >
                  {exceptions.low_checklist_drafts}
                </Badge>
              </Link>

              {/* Rule 2: Under review with no files */}
              <Link
                href={needRoutes.index.url({
                  query: {
                    need_group_id: groupId,
                    status: ['approved'],
                    is_approved_by_director: ['0'],
                  },
                })}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-orange-500" />
                  <span className="truncate text-xs text-foreground">
                    Menunggu review tanpa lampiran KAK/file
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 shrink-0 font-mono text-xs"
                >
                  {exceptions.under_review_no_files}
                </Badge>
              </Link>

              {/* Rule 3: Unaligned needs */}
              <Link
                href={needRoutes.index.url({
                  query: { need_group_id: groupId },
                })}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                  <span className="truncate text-xs text-foreground">
                    Belum terkait Sasaran/Indikator/IKK
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 shrink-0 font-mono text-xs"
                >
                  {exceptions.unaligned_needs}
                </Badge>
              </Link>

              {/* Rule 4: Revision expiring < 3 days */}
              <Link
                href={needRoutes.index.url({
                  query: { need_group_id: groupId },
                })}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-red-500" />
                  <span className="truncate text-xs text-foreground">
                    Izin buka kunci berakhir &lt; 3 hari
                  </span>
                </div>
                <Badge
                  variant="destructive"
                  className="ml-2 shrink-0 font-mono text-xs"
                >
                  {exceptions.expiring_unlocks}
                </Badge>
              </Link>

              {/* Rule 5: Rejected and not revised */}
              <Link
                href={needRoutes.index.url({
                  query: { need_group_id: groupId, status: ['rejected'] },
                })}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-rose-500" />
                  <span className="truncate text-xs text-foreground">
                    Ditolak dengan catatan perbaikan
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 shrink-0 border-destructive/30 font-mono text-xs text-destructive"
                >
                  {exceptions.rejected_not_revised}
                </Badge>
              </Link>

              {/* Rule 6: Zero submissions units */}
              <div className="-mx-2 flex items-center justify-between px-2 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground">
                    Unit kerja belum mengajukan usulan
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-2 shrink-0 font-mono text-xs"
                >
                  {exceptions.zero_submission_units} unit
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right (7 cols): Unit Submission Progress Table */}
        <Card className="border-border/70 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between px-5 pt-4 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <RiBuildingLine className="size-4 text-muted-foreground" />
                Progres Pengajuan per Unit Kerja
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Monitoring sebaran usulan dan penyelesaian verifikasi tiap unit
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHideZeroUnits((v) => !v)}
              className="h-7 text-xs font-normal"
            >
              {hideZeroUnits ? 'Tampilkan Semua Unit' : 'Hanya Unit Terisi'}
            </Button>
          </CardHeader>
          <CardContent className="px-5 pt-0 pb-4">
            <div className="max-h-[300px] overflow-y-auto rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-[40%]">Unit Kerja</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Draft</TableHead>
                    <TableHead className="text-center">Review</TableHead>
                    <TableHead className="text-center">Selesai</TableHead>
                    <TableHead className="text-right">% Selesai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnitProgress.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-6 text-center text-xs text-muted-foreground"
                      >
                        Tidak ada data unit yang sesuai.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUnitProgress.map((item: UnitProgressItem) => (
                      <TableRow
                        key={item.unit_id}
                        className={cn(
                          'text-xs transition-colors',
                          !item.has_submission &&
                            'bg-amber-500/5 text-muted-foreground dark:bg-amber-500/10',
                        )}
                      >
                        <TableCell className="max-w-[160px] truncate font-medium">
                          <Link
                            href={needRoutes.index.url({
                              query: {
                                need_group_id: groupId,
                                organizational_unit_id: [
                                  item.unit_id.toString(),
                                ],
                              },
                            })}
                            className="hover:text-primary hover:underline"
                          >
                            {item.name}
                          </Link>
                          {!item.has_submission && (
                            <span className="ml-1.5 text-[10px] font-normal text-amber-700 dark:text-amber-400">
                              (Belum ada usulan)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {item.total_needs}
                        </TableCell>
                        <TableCell className="text-center font-mono text-muted-foreground">
                          {item.draft_count}
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold text-amber-600 dark:text-amber-400">
                          {item.under_review_count}
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.approved_count}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {item.completion_rate}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bottom 2-Column: Data Readiness (4 meters) + Lock & Extension Monitor */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Data Readiness (5 cols) */}
        <Card className="border-border/70 lg:col-span-5">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <RiFileCheckLine className="size-4 text-primary" />
              Kelayakan Mutu Data (4 Indikator)
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tingkat kesiapan administrasi dan penyelarasan dokumen
            </p>
          </CardHeader>
          <CardContent className="px-5 pt-0 pb-4">
            <div className="flex flex-col gap-3.5">
              {/* Metric 1 */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Rata-rata Skor Checklist
                  </span>
                  <span className="font-mono font-semibold">
                    {dataReadiness.avg_checklist}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    style={{
                      width: `${Math.min(dataReadiness.avg_checklist, 100)}%`,
                    }}
                    className="h-full rounded-full bg-emerald-600"
                  />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Kelengkapan Dokumen / File Pendukung
                  </span>
                  <span className="font-mono font-semibold">
                    {dataReadiness.attachment_coverage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    style={{
                      width: `${Math.min(dataReadiness.attachment_coverage, 100)}%`,
                    }}
                    className="h-full rounded-full bg-blue-600"
                  />
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Keterkaitan Renstra / Sasaran / IKK
                  </span>
                  <span className="font-mono font-semibold">
                    {dataReadiness.alignment_coverage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    style={{
                      width: `${Math.min(dataReadiness.alignment_coverage, 100)}%`,
                    }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>

              {/* Metric 4 */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Format Rincian KAK Terisi Lengkap
                  </span>
                  <span className="font-mono font-semibold">
                    {dataReadiness.kak_detail_coverage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    style={{
                      width: `${Math.min(dataReadiness.kak_detail_coverage, 100)}%`,
                    }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lock & Extension Monitor (7 cols) */}
        <Card className="border-border/70 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between px-5 pt-4 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <RiLockUnlockLine className="size-4 text-amber-600" />
                Monitor Izin Buka Kunci (Extension Monitor)
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Usulan yang sedang dalam periode dispensasi revisi sementara
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-5 pt-0 pb-4">
            {activeUnlocks.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 text-center">
                <RiLockLine className="mb-1.5 size-6 text-muted-foreground opacity-60" />
                <p className="text-xs font-medium text-foreground">
                  Tidak ada perpanjangan aktif
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Semua usulan mengikuti aturan kunci normal siklus pengajuan.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {activeUnlocks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <span className="block truncate font-medium text-foreground">
                        {item.title}
                      </span>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate">{item.unit_name}</span>
                        <span>-</span>
                        <span className="font-mono text-amber-700 dark:text-amber-400">
                          Batas:{' '}
                          {item.unlocked_until
                            ? new Date(item.unlocked_until).toLocaleDateString(
                                'id-ID',
                              )
                            : '-'}
                        </span>
                        {item.lock_reason && (
                          <span>- ({item.lock_reason})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {onOpenLockDialog && item.can_lock && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenLockDialog(item.id, 'lock')}
                          className="h-7 text-xs"
                        >
                          Kunci Kembali
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
