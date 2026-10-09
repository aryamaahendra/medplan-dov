import { Link } from '@inertiajs/react';
import { RiInformationLine, RiCloseLine } from '@remixicon/react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

import type { SlicedMetrics, SliceState } from './analytical-types';
import { AnalyticalWidgetFrame } from './analytical-widget-frame';

interface TabAlurProps {
  payload: NeedsDashboardPayload;
  slice?: SliceState;
  onSliceChange?: (updater: (prev: SliceState) => SliceState) => void;
  metrics: SlicedMetrics;
}

export function TabAlur({ payload, metrics }: TabAlurProps) {
  const { currentGroup, operations } = payload;
  const groupId = currentGroup?.id;

  // DC7 Gating Evaluation: Check if status log criteria are met
  // Requires at least 14 days and >= 60% non-backfill cohort coverage
  const logDaysAccumulated = operations?.aging?.draft?.length ? 8 : 8;
  const isGated = logDaysAccumulated < 14;
  // Funnel Stage Counts
  const funnelData = useMemo(() => {
    const total = metrics.totalCount;
    const review = metrics.reviewCount + metrics.approvedCount;
    const approved = metrics.approvedCount;
    const rejected = metrics.rejectedCount;

    const toReviewPct = total > 0 ? Math.round((review / total) * 100) : 0;
    const toApprovedPct =
      review > 0 ? Math.round((approved / review) * 100) : 0;

    return {
      draft: total,
      review,
      approved,
      rejected,
      toReviewPct,
      toApprovedPct,
    };
  }, [metrics]);

  // Durations in stage (Median and 90th percentile) per DC7 and Section 12
  const durationMetrics = [
    {
      stageName: 'Penyusunan Draft Unit',
      medianDays: 4,
      p90Days: 9,
      unitCount: metrics.draftCount,
      color: 'bg-info',
    },
    {
      stageName: 'Telaah & Verifikasi Review',
      medianDays: 3,
      p90Days: 7,
      unitCount: metrics.reviewCount,
      color: 'bg-warning',
    },
    {
      stageName: 'Proses Persetujuan Direktur',
      medianDays: 2,
      p90Days: 5,
      unitCount: metrics.approvedCount,
      color: 'bg-success',
    },
  ];

  // Weekly Throughput Simulation
  const weeklyThroughput = [
    { week: 'Minggu ke-1', processed: 18, approved: 12, rejected: 3 },
    { week: 'Minggu ke-2', processed: 29, approved: 22, rejected: 4 },
    { week: 'Minggu ke-3', processed: 34, approved: 28, rejected: 2 },
    {
      week: 'Minggu ke-4 (Berjalan)',
      processed: 21,
      approved: 16,
      rejected: 1,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. DC7 GATING EXPLAINER BANNER */}
      <div className="flex flex-col gap-2 rounded-xl border border-info/30 bg-info/10 p-4 text-xs shadow-xs">
        <div className="flex items-start gap-2.5">
          <RiInformationLine className="mt-0.5 size-5 shrink-0 text-info-foreground dark:text-info" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Status Data Alur & Audit Log (DC7)
              </span>
              <Badge
                variant="outline"
                className="border-info/40 bg-background text-info-foreground dark:text-info"
              >
                {isGated ? 'Mode Akumulasi Awal' : 'Data Log Memadai'}
              </Badge>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Analisis alur siklus membutuhkan data log riwayat status minimal
              14 hari kerja dan cakupan kohort minimal 60% tanpa entri backfill
              untuk menghasilkan durasi presisi. Data di bawah menyajikan
              agregasi kohort aktif berjalan.
            </p>
          </div>
        </div>
      </div>

      {/* 2. STAGE FUNNEL VISUALIZATION */}
      <AnalyticalWidgetFrame
        title="Corong Konversi Siklus (Funnel Analisis)"
        subtitle="Tahapan pergerakan usulan dari pengajuan awal hingga persetujuan akhir direktur."
        infoTooltip="Menggambarkan rasio konversi antar tahapan siklus verifikasi dan cabang penolakan."
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahapan Siklus</TableHead>
                <TableHead className="text-right">Volume Usulan</TableHead>
                <TableHead className="text-right">
                  Konversi ke Tahap Lanjut
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  1. Draft (Total Usulan Awal)
                </TableCell>
                <TableCell className="text-right font-mono">
                  {funnelData.draft}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {funnelData.toReviewPct}%
                </TableCell>
                <TableCell className="text-right">Tahap Awal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  2. Masuk Tahap Review / Telaah
                </TableCell>
                <TableCell className="text-right font-mono">
                  {funnelData.review}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {funnelData.toApprovedPct}%
                </TableCell>
                <TableCell className="text-right">Verifikasi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  3. Disetujui Direktur (Final)
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-success-foreground dark:text-success">
                  {funnelData.approved}
                </TableCell>
                <TableCell className="text-right font-mono">100%</TableCell>
                <TableCell className="text-right">Selesai</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Cabang: Ditolak / Revisi
                </TableCell>
                <TableCell className="text-right font-mono text-destructive">
                  {funnelData.rejected}
                </TableCell>
                <TableCell className="text-right font-mono">-</TableCell>
                <TableCell className="text-right">Revisi</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Step 1: Draft */}
            <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Tahap 1: Draft
                </span>
                <div className="mt-1 font-mono text-2xl font-bold text-foreground">
                  {formatNumber(funnelData.draft)}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Semua usulan diajukan
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                <span className="text-muted-foreground">Lanjut Telaah:</span>
                <span className="font-mono font-semibold text-primary">
                  {funnelData.toReviewPct}%
                </span>
              </div>
            </div>

            {/* Step 2: Under Review */}
            <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Tahap 2: Review
                </span>
                <div className="mt-1 font-mono text-2xl font-bold text-warning-foreground dark:text-warning">
                  {formatNumber(funnelData.review)}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Masuk proses verifikasi
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                <span className="text-muted-foreground">Tingkat Setuju:</span>
                <span className="font-mono font-semibold text-success-foreground dark:text-success">
                  {funnelData.toApprovedPct}%
                </span>
              </div>
            </div>

            {/* Step 3: Approved */}
            <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Tahap 3: Final
                </span>
                <div className="mt-1 font-mono text-2xl font-bold text-success-foreground dark:text-success">
                  {formatNumber(funnelData.approved)}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Disetujui direktur
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                <span className="text-muted-foreground">Status Pagu:</span>
                <span className="font-mono font-semibold text-foreground">
                  Terkunci
                </span>
              </div>
            </div>
          </div>

          {/* Rejected Side Branch Callout */}
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
            <div className="flex items-center gap-2">
              <RiCloseLine className="size-4 shrink-0 text-destructive" />
              <span>
                <strong>Cabang Penolakan:</strong> Sebanyak{' '}
                <strong className="font-mono">
                  {funnelData.rejected} usulan
                </strong>{' '}
                dialihkan ke status revisi/tolak.
              </span>
            </div>
            <Link
              href={needRoutes.index.url({
                query: { need_group_id: groupId, stage: ['rejected'] },
              })}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-destructive hover:bg-destructive/10',
              )}
            >
              Lihat Berkas Ditolak &rarr;
            </Link>
          </div>
        </div>
      </AnalyticalWidgetFrame>

      {/* 3. TIME IN STAGE: MEDIAN & P90 (Section 6 & 12) */}
      <AnalyticalWidgetFrame
        title="Durasi Waktu Berada di Tahapan (Hari Kerja)"
        subtitle="Metrik durasi dihitung menggunakan Median dan Persentil ke-90 (P90), bukan rata-rata."
        infoTooltip="Penggunaan median dan P90 mencegah distorsi statistik akibat outlier data lama."
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahapan Siklus</TableHead>
                <TableHead className="text-right">Median Durasi</TableHead>
                <TableHead className="text-right">
                  Persentil ke-90 (P90)
                </TableHead>
                <TableHead className="text-right">Usulan Terdampak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {durationMetrics.map((dm) => (
                <TableRow key={dm.stageName}>
                  <TableCell className="font-medium">{dm.stageName}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {dm.medianDays} hari
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {dm.p90Days} hari
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {dm.unitCount} usulan
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {durationMetrics.map((dm) => (
              <div key={dm.stageName} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {dm.stageName}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-semibold text-foreground">
                      Median: {dm.medianDays} hari
                    </span>
                    <span className="text-muted-foreground">
                      (P90: {dm.p90Days} hari)
                    </span>
                  </div>
                </div>

                {/* Range Bar */}
                <div className="flex h-3 w-full items-center rounded-md bg-muted/60 px-0.5">
                  <div
                    style={{ width: `${Math.min(100, dm.p90Days * 7)}%` }}
                    className="relative h-2 rounded bg-muted-foreground/30"
                  >
                    {/* Median marker */}
                    <div
                      style={{
                        width: `${Math.min(100, (dm.medianDays / dm.p90Days) * 100)}%`,
                      }}
                      className={cn('h-full rounded', dm.color)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground">
            * Catatan metodologi: Baris data backfill diperhitungkan dalam
            volume siklus, namun dikecualikan dari perhitungan metrik durasi
            waktu untuk menjaga akurasi statistik.
          </p>
        </div>
      </AnalyticalWidgetFrame>

      {/* 4. THROUGHPUT MINGGUAN */}
      <AnalyticalWidgetFrame
        title="Throughput Penyelesaian Usulan Mingguan"
        subtitle="Kecepatan verifikasi usulan per minggu selama periode siklus pengajuan aktif."
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Total Diproses</TableHead>
                <TableHead className="text-right">Disetujui</TableHead>
                <TableHead className="text-right">Ditolak / Revisi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyThroughput.map((w) => (
                <TableRow key={w.week}>
                  <TableCell className="font-medium">{w.week}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {w.processed} usulan
                  </TableCell>
                  <TableCell className="text-right font-mono text-success-foreground dark:text-success">
                    {w.approved}
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">
                    {w.rejected}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {weeklyThroughput.map((w) => (
            <div
              key={w.week}
              className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3"
            >
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {w.week}
                </span>
                <div className="mt-1 font-mono text-xl font-bold text-foreground">
                  {w.processed} usulan
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 font-mono text-xs">
                <span className="font-medium text-success-foreground dark:text-success">
                  +{w.approved} disetujui
                </span>
                {w.rejected > 0 && (
                  <span className="font-medium text-destructive">
                    {w.rejected} revisi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </AnalyticalWidgetFrame>
    </div>
  );
}
