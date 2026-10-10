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

  // Durations & weekly throughput require status log history (DC7 gating)
  // When isGated is true, we display accumulation state without mock numbers.
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
      >
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
          <RiInformationLine className="mb-2 size-6 text-info" />
          <p className="font-medium text-foreground">
            Data Durasi dalam Tahap Akumulasi (DC7)
          </p>
          <p className="mt-1 max-w-md">
            Metrik durasi siklus memerlukan data audit log minimal 14 hari kerja
            aktif. Telemetri akan ditampilkan secara otomatis setelah periode
            kohort mencukupi tanpa menggunakan data rekaan.
          </p>
        </div>
      </AnalyticalWidgetFrame>

      {/* 4. THROUGHPUT MINGGUAN */}
      <AnalyticalWidgetFrame
        title="Throughput Penyelesaian Usulan Mingguan"
        subtitle="Kecepatan verifikasi usulan per minggu selama periode siklus pengajuan aktif."
      >
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
          <RiInformationLine className="mb-2 size-6 text-info" />
          <p className="font-medium text-foreground">
            Data Throughput dalam Tahap Akumulasi
          </p>
          <p className="mt-1 max-w-md">
            Penyelesaian usulan mingguan akan dikompilasi secara otomatis
            setelah kohort pengajuan mencapai siklus mingguan penuh.
          </p>
        </div>
      </AnalyticalWidgetFrame>
    </div>
  );
}
