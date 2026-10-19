import { Link } from '@inertiajs/react';
import {
  RiTargetFill,
  RiArrowRightLine,
  RiAlertLine,
  RiCheckboxCircleFill,
  RiFileTextFill,
  RiAttachmentFill,
  RiSearchLine,
  RiInformationLine,
} from '@remixicon/react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/5 p-4 text-xs text-warning-foreground shadow-xs dark:bg-warning/10 dark:text-warning">
          <div className="flex items-start gap-3">
            <RiAlertLine className="mt-0.5 size-5 shrink-0 text-warning" />
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
            className={cn(buttonVariants({ size: 'sm' }), 'self-start')}
          >
            <span>Buka Usulan Belum Selaras</span>
            <RiArrowRightLine data-icon="inline-end" />
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
                    <Badge variant={item.pct >= 85 ? 'default' : 'secondary'}>
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
              <span className="text-xss font-semibold text-muted-foreground uppercase">
                Penyelarasan Renstra
              </span>
              <RiTargetFill className="size-4 text-foreground" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-foreground">
                {formatPercent(dataReadiness.alignment_coverage)}
              </div>
              <p className="mt-0.5 text-xss text-muted-foreground">
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
              <span className="text-xss font-semibold text-muted-foreground uppercase">
                Kelengkapan KAK
              </span>
              <RiFileTextFill className="size-4 text-success" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-success-foreground dark:text-success">
                {formatPercent(dataReadiness.kak_detail_coverage)}
              </div>
              <p className="mt-0.5 text-xss text-muted-foreground">
                Spesifikasi teknis terisi
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{
                  width: `${Math.max(dataReadiness.kak_detail_coverage, 3)}%`,
                }}
                className="h-full rounded-full bg-success"
              />
            </div>
          </div>

          {/* Card 3: Berkas Lampiran */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xss font-semibold text-muted-foreground uppercase">
                Lampiran Pendukung
              </span>
              <RiAttachmentFill className="size-4 text-info" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-foreground">
                {formatPercent(dataReadiness.attachment_coverage)}
              </div>
              <p className="mt-0.5 text-xss text-muted-foreground">
                Usulan memiliki lampiran
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{
                  width: `${Math.max(dataReadiness.attachment_coverage, 3)}%`,
                }}
                className="h-full rounded-full bg-info"
              />
            </div>
          </div>

          {/* Card 4: Rata-rata Checklist */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xss font-semibold text-muted-foreground uppercase">
                Rata-rata Checklist
              </span>
              <RiCheckboxCircleFill className="size-4 text-warning" />
            </div>
            <div className="mt-2">
              <div className="font-mono text-2xl font-bold text-foreground">
                {formatPercent(dataReadiness.avg_checklist)}
              </div>
              <p className="mt-0.5 text-xss text-muted-foreground">
                Kesiapan administratif
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{
                  width: `${Math.max(dataReadiness.avg_checklist, 3)}%`,
                }}
                className="h-full rounded-full bg-warning"
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
            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2 py-1 text-xs">
              <span
                onClick={() => setFilterZeroSupportOnly(false)}
                className={cn(
                  'cursor-pointer font-medium transition-colors select-none',
                  !filterZeroSupportOnly
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Semua Sasaran
              </span>
              <Switch
                size="sm"
                checked={filterZeroSupportOnly}
                onCheckedChange={setFilterZeroSupportOnly}
                aria-label="Filter sasaran tanpa dukungan"
              />
              <span
                onClick={() => setFilterZeroSupportOnly(true)}
                className={cn(
                  'cursor-pointer font-medium transition-colors select-none',
                  filterZeroSupportOnly
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Hanya Tanpa Dukungan ({zeroSupportCount})
              </span>
            </div>
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
            <RiInformationLine className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
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
                className="pl-8"
              />
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground">Katalog:</span>
              <Badge variant="outline">{supportedCount} Didukung</Badge>
              <Badge variant="secondary" className="text-destructive">
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
                        : 'border-dashed border-destructive/40 bg-destructive/5',
                    )}
                  >
                    <div>
                      <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                        {sasaran.tujuan_name}
                      </span>
                      <h4 className="mt-1 line-clamp-2 leading-snug font-medium text-foreground">
                        {sasaran.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 font-mono">
                      <span className="text-xss text-muted-foreground">
                        Dukungan Usulan:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-xs font-bold',
                            hasNeeds ? 'text-foreground' : 'text-destructive',
                          )}
                        >
                          {sasaran.needs_count} usulan
                        </span>
                        {!hasNeeds && (
                          <span className="size-1.5 rounded-full bg-destructive" />
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
