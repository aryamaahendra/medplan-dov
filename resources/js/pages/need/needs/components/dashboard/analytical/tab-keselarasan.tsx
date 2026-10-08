import { Link } from '@inertiajs/react';
import {
  RiTargetLine,
  RiArrowRightLine,
  RiAlertLine,
  RiCheckLine,
  RiFileTextLine,
  RiAttachment2,
  RiSearchLine,
  RiInformationLine,
} from '@remixicon/react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type {
  NeedsDashboardPayload,
  SasaranOverviewItem,
} from '@/types/needs-dashboard';

import type { SlicedMetrics, SliceState } from './analytical-types';
import { AnalyticalWidgetFrame } from './analytical-widget-frame';

interface TabKeselarasanProps {
  payload: NeedsDashboardPayload;
  slice?: SliceState;
  onSliceChange?: (updater: (prev: SliceState) => SliceState) => void;
  metrics: SlicedMetrics;
}

export function TabKeselarasan({ payload, metrics }: TabKeselarasanProps) {
  const { currentGroup, dataReadiness, exceptions, sasaranOverview } = payload;
  const groupId = currentGroup?.id;

  const [sasaranSearch, setSasaranSearch] = useState('');
  const [filterZeroSupportOnly, setFilterZeroSupportOnly] = useState(false);

  // Filtered Sasaran Target Catalog
  const filteredSasarans = useMemo(() => {
    return sasaranOverview.filter((s: SasaranOverviewItem) => {
      const matchesSearch =
        !sasaranSearch.trim() ||
        s.name.toLowerCase().includes(sasaranSearch.toLowerCase()) ||
        s.tujuan_name.toLowerCase().includes(sasaranSearch.toLowerCase());

      const matchesZero = !filterZeroSupportOnly || s.needs_count === 0;

      return matchesSearch && matchesZero;
    });
  }, [sasaranOverview, sasaranSearch, filterZeroSupportOnly]);

  const zeroSupportCount = useMemo(() => {
    return sasaranOverview.filter((s) => s.needs_count === 0).length;
  }, [sasaranOverview]);

  const supportedCount = sasaranOverview.length - zeroSupportCount;

  // Unaligned / Orphan Needs Estimate
  const orphanCount = exceptions.unaligned_needs ?? 0;
  const orphanBudgetEstimate =
    metrics.totalCount > 0
      ? Math.round((orphanCount / metrics.totalCount) * metrics.totalBudget)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. ORPHAN NEEDS ALERT BANNER */}
      {orphanCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-950 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <RiAlertLine className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                Usulan Belum Selaras dengan Renstra (Orphan Needs)
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Terdapat{' '}
                <strong className="font-mono text-foreground">
                  {orphanCount} usulan
                </strong>{' '}
                senilai{' '}
                <strong className="font-mono text-foreground">
                  {formatCompactIDR(orphanBudgetEstimate)}
                </strong>{' '}
                yang belum ditautkan ke Sasaran Renstra, Indikator, IKU, maupun
                Rencana Layanan Strategis.
              </p>
            </div>
          </div>

          <Link
            href={needRoutes.index.url({
              query: {
                need_group_id: groupId,
                attention: ['unaligned_needs'],
              },
            })}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'h-8 gap-1.5 px-3 text-xs font-medium',
            )}
          >
            <span>Buka Usulan Belum Selaras</span>
            <RiArrowRightLine className="size-3.5" />
          </Link>
        </div>
      )}

      {/* 2. LINKAGE COVERAGE METRICS (Section 6) */}
      <AnalyticalWidgetFrame
        title="Cakupan Penyelarasan Strategis & Dokumen"
        subtitle="Proporsi usulan perencanaan yang memiliki keterkaitan dengan dokumen arahan strategis rumah sakit."
        infoTooltip="Menampilkan persentase usulan yang memenuhi keterhubungan Renstra, IKU, KAK, dan berkas lampiran."
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimensi Penyelarasan</TableHead>
                <TableHead>Target Standar</TableHead>
                <TableHead className="text-right">
                  Tingkat Keterpenuhan
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  label: 'Keterhubungan Sasaran & Indikator Renstra',
                  target: '100%',
                  pct: dataReadiness.alignment_coverage,
                },
                {
                  label:
                    'Kelengkapan Kerangka Acuan Kerja (KAK / Detail Teknis)',
                  target: '100%',
                  pct: dataReadiness.kak_detail_coverage,
                },
                {
                  label: 'Kelengkapan Berkas Lampiran Pendukung',
                  target: '85%',
                  pct: dataReadiness.attachment_coverage,
                },
                {
                  label: 'Rata-rata Skor Kepatuhan Checklist Kebutuhan',
                  target: '85%',
                  pct: dataReadiness.avg_checklist,
                },
              ].map((item) => (
                <TableRow key={item.label}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.target}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatPercent(item.pct)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={item.pct >= 85 ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {item.pct >= 85 ? 'Memenuhi Target' : 'Perlu Peningkatan'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Renstra & IKU */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Penyelarasan Renstra
              </span>
              <RiTargetLine className="size-4 text-primary" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-foreground">
                {formatPercent(dataReadiness.alignment_coverage)}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Usulan terhubung Sasaran / IKU
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{
                  width: `${Math.max(dataReadiness.alignment_coverage, 3)}%`,
                }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>

          {/* Card 2: KAK / Detail Teknis */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Kelengkapan KAK
              </span>
              <RiFileTextLine className="size-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatPercent(dataReadiness.kak_detail_coverage)}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Spesifikasi teknis terisi
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{
                  width: `${Math.max(dataReadiness.kak_detail_coverage, 3)}%`,
                }}
                className="h-full rounded-full bg-emerald-600"
              />
            </div>
          </div>

          {/* Card 3: Berkas Lampiran */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Lampiran Pendukung
              </span>
              <RiAttachment2 className="size-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-foreground">
                {formatPercent(dataReadiness.attachment_coverage)}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Usulan memiliki lampiran
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{
                  width: `${Math.max(dataReadiness.attachment_coverage, 3)}%`,
                }}
                className="h-full rounded-full bg-blue-600"
              />
            </div>
          </div>

          {/* Card 4: Rata-rata Checklist */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Rata-rata Checklist
              </span>
              <RiCheckLine className="size-4 text-amber-600" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-foreground">
                {formatPercent(dataReadiness.avg_checklist)}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Kesiapan administratif
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{
                  width: `${Math.max(dataReadiness.avg_checklist, 3)}%`,
                }}
                className="h-full rounded-full bg-amber-500"
              />
            </div>
          </div>
        </div>
      </AnalyticalWidgetFrame>

      {/* 3. TARGET VIEW: RENSTRA CATALOG (Section 6 & DC6) */}
      <AnalyticalWidgetFrame
        title="Penyelarasan Sasaran Strategis (Katalog Renstra)"
        subtitle="Distribusi dukungan usulan kebutuhan terhadap seluruh sasaran strategis, termasuk sasaran dengan 0 usulan pendukung."
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={filterZeroSupportOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterZeroSupportOnly(!filterZeroSupportOnly)}
              className="h-7 px-2.5 text-xs font-normal"
            >
              Hanya Tanpa Dukungan ({zeroSupportCount})
            </Button>
          </div>
        }
        tableView={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tujuan Renstra</TableHead>
                <TableHead>Sasaran Strategis</TableHead>
                <TableHead className="text-right">Banyak Usulan</TableHead>
                <TableHead className="text-right">Status Dukungan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSasarans.map((sasaran) => (
                <TableRow key={sasaran.id}>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                    {sasaran.tujuan_name}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {sasaran.name}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatNumber(sasaran.needs_count)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        sasaran.needs_count > 0 ? 'default' : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {sasaran.needs_count > 0
                        ? 'Didukung'
                        : 'Belum Ada Usulan'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      >
        <div className="flex flex-col gap-4">
          {/* DC6 NON-ADDITIVE DISCLAIMER BANNER */}
          <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
            <RiInformationLine className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="leading-relaxed">
              <strong>Catatan Penyelarasan (DC6):</strong> Usulan kebutuhan
              dapat terhubung ke lebih dari satu sasaran strategis secara
              simultan (relasi many-to-many). Total usulan per sasaran tidak
              dijumlahkan langsung untuk menghindari perhitungan ganda
              (double-counting). Total keseluruhan dihitung berbasis usulan
              unik.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <RiSearchLine className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari sasaran atau tujuan..."
                value={sasaranSearch}
                onChange={(e) => setSasaranSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground">Katalog:</span>
              <Badge variant="outline" className="font-normal">
                {supportedCount} Didukung
              </Badge>
              <Badge
                variant="secondary"
                className="font-normal text-rose-600 dark:text-rose-400"
              >
                {zeroSupportCount} Tanpa Dukungan
              </Badge>
            </div>
          </div>

          {/* Grid of Targets */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSasarans.length === 0 ? (
              <p className="col-span-full py-8 text-center text-xs text-muted-foreground">
                Tidak ditemukan sasaran strategis yang sesuai dengan kriteria
                pencarian.
              </p>
            ) : (
              filteredSasarans.map((sasaran) => {
                const hasNeeds = sasaran.needs_count > 0;

                return (
                  <div
                    key={sasaran.id}
                    className={cn(
                      'flex flex-col justify-between rounded-lg border p-3.5 text-xs transition-all',
                      hasNeeds
                        ? 'border-border/80 bg-card hover:border-primary/50 hover:shadow-xs'
                        : 'border-dashed border-rose-300/70 bg-rose-50/20 dark:border-rose-900/60 dark:bg-rose-950/10',
                    )}
                  >
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        {sasaran.tujuan_name}
                      </span>
                      <h4 className="mt-1 line-clamp-2 leading-snug font-medium text-foreground">
                        {sasaran.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 font-mono">
                      <span className="text-[11px] text-muted-foreground">
                        Dukungan Usulan:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-xs font-bold',
                            hasNeeds
                              ? 'text-primary'
                              : 'text-rose-600 dark:text-rose-400',
                          )}
                        >
                          {sasaran.needs_count} usulan
                        </span>
                        {!hasNeeds && (
                          <span className="size-1.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </AnalyticalWidgetFrame>
    </div>
  );
}
