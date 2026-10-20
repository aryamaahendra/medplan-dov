import {
  RiArrowRightDownLine,
  RiFileTextLine,
  RiHistoryLine,
  RiInformationLine,
  RiShieldCheckLine,
} from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

interface NeedFinancialComparisonCardsProps {
  need: Need;
  className?: string;
}

export function NeedFinancialComparisonCards({
  need,
  className,
}: NeedFinancialComparisonCardsProps) {
  const requestedVolume = Number(need.volume || 0);
  const requestedUnitPrice = Number(need.unit_price || 0);
  const requestedTotalPrice = Number(
    need.total_price || requestedVolume * requestedUnitPrice,
  );

  const isApproved = need.status === 'approved';
  const hasApprovedVolume =
    need.approved_volume !== null && need.approved_volume !== undefined;
  const hasApprovedUnitPrice =
    need.approved_unit_price !== null && need.approved_unit_price !== undefined;
  const hasApprovedTotalPrice =
    need.approved_total_price !== null &&
    need.approved_total_price !== undefined;

  const hasApprovedFigures =
    hasApprovedVolume || hasApprovedUnitPrice || hasApprovedTotalPrice;

  const approvedVolume = hasApprovedVolume
    ? Number(need.approved_volume)
    : isApproved
      ? requestedVolume
      : null;

  const approvedUnitPrice = hasApprovedUnitPrice
    ? Number(need.approved_unit_price)
    : isApproved
      ? requestedUnitPrice
      : null;

  const approvedTotalPrice = hasApprovedTotalPrice
    ? Number(need.approved_total_price)
    : approvedVolume !== null && approvedUnitPrice !== null
      ? approvedVolume * approvedUnitPrice
      : isApproved
        ? requestedTotalPrice
        : null;

  const isVolumeReduced =
    approvedVolume !== null && approvedVolume < requestedVolume;
  const isPriceReduced =
    approvedTotalPrice !== null && approvedTotalPrice < requestedTotalPrice;
  const isAdjusted = isVolumeReduced || isPriceReduced;

  const volumeDifference =
    approvedVolume !== null ? Math.max(0, requestedVolume - approvedVolume) : 0;
  const totalDifference =
    approvedTotalPrice !== null
      ? Math.max(0, requestedTotalPrice - approvedTotalPrice)
      : 0;

  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>
      {/* Kartu Usulan Awal */}
      <Card className="flex flex-col justify-between border-border/80 bg-card">
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <RiFileTextLine className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Usulan Awal
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Diajukan oleh unit pengusul
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              Pengusul
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                Estimasi Total Usulan
              </span>
              <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {formatIDR(requestedTotalPrice)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {requestedVolume.toLocaleString('id-ID', {
                  maximumFractionDigits: 4,
                })}{' '}
                {need.unit} × {formatIDR(requestedUnitPrice)}
              </div>
            </div>

            <div className="space-y-2 divide-y divide-border/50 text-xs">
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Volume Kuantitas</span>
                <span className="font-semibold text-foreground">
                  {requestedVolume.toLocaleString('id-ID', {
                    maximumFractionDigits: 4,
                  })}{' '}
                  {need.unit}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Harga Satuan</span>
                <span className="font-semibold text-foreground">
                  {formatIDR(requestedUnitPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Unit Kerja</span>
                <span className="max-w-[200px] truncate font-semibold text-foreground">
                  {need.organizational_unit?.name || '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Kartu Ketetapan Direktur */}
      <Card
        className={cn(
          'flex flex-col justify-between border-border/80 bg-card',
          isApproved && 'border-primary/40 bg-primary/5',
        )}
      >
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg',
                  isApproved
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {isApproved ? (
                  <RiShieldCheckLine className="size-4" />
                ) : (
                  <RiInformationLine className="size-4" />
                )}
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Ketetapan Direktur
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Keputusan resmi pimpinan
                </p>
              </div>
            </div>

            {isApproved && (
              <Badge className="border-primary/30 bg-primary/15 text-xs text-primary">
                Disetujui
              </Badge>
            )}
            {need.status === 'submitted' && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Menunggu Review
              </Badge>
            )}
            {need.status === 'revision' && (
              <Badge
                variant="outline"
                className="border-warning/40 text-xs text-warning"
              >
                Perlu Revisi
              </Badge>
            )}
            {need.status === 'rejected' && (
              <Badge
                variant="outline"
                className="border-destructive/40 text-xs text-destructive"
              >
                Ditolak
              </Badge>
            )}
            {need.status === 'draft' && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Draft
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {isApproved || hasApprovedFigures ? (
              <>
                <div
                  className={cn(
                    'rounded-lg border p-3.5',
                    isApproved
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-border/60 bg-muted/30',
                  )}
                >
                  <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                    Pagu Total Disetujui
                  </span>
                  <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {formatIDR(approvedTotalPrice ?? requestedTotalPrice)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {approvedVolume?.toLocaleString('id-ID', {
                      maximumFractionDigits: 4,
                    })}{' '}
                    {need.unit} ×{' '}
                    {formatIDR(approvedUnitPrice ?? requestedUnitPrice)}
                  </div>
                </div>

                <div className="space-y-2 divide-y divide-border/50 text-xs">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-muted-foreground">
                      Volume Disetujui
                    </span>
                    <span className="font-semibold text-foreground">
                      {approvedVolume?.toLocaleString('id-ID', {
                        maximumFractionDigits: 4,
                      })}{' '}
                      {need.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-muted-foreground">
                      Harga Satuan Disetujui
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatIDR(approvedUnitPrice ?? requestedUnitPrice)}
                    </span>
                  </div>
                  {need.approved_by_director_at && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-muted-foreground">
                        Waktu Persetujuan
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatDateTime(need.approved_by_director_at)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rasionalisasi Penyesuaian */}
                {isAdjusted && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <RiArrowRightDownLine className="size-3.5 shrink-0" />
                      <span>Rasionalisasi Alokasi Anggaran:</span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-xss text-muted-foreground dark:text-amber-300/80">
                      {isVolumeReduced && (
                        <p>
                          Penyesuaian kuantitas: -
                          {volumeDifference.toLocaleString('id-ID', {
                            maximumFractionDigits: 4,
                          })}{' '}
                          {need.unit}
                        </p>
                      )}
                      {isPriceReduced && (
                        <p>
                          Efisiensi total pagu: -{formatIDR(totalDifference)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Rekomendasi Siklus Berikutnya */}
                {need.is_recommended_for_next_cycle &&
                  need.recommended_volume && (
                    <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-700 dark:text-blue-400">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <RiHistoryLine className="size-3.5 shrink-0" />
                        <span>Rekomendasi Siklus Berikutnya (Rollover):</span>
                      </div>
                      <p className="mt-1 text-xss text-muted-foreground dark:text-blue-300/80">
                        Sisa kuantitas sebanyak{' '}
                        <strong className="text-foreground">
                          {Number(need.recommended_volume).toLocaleString(
                            'id-ID',
                            { maximumFractionDigits: 4 },
                          )}{' '}
                          {need.unit}
                        </strong>{' '}
                        dicatat sebagai rekomendasi eksekutif untuk siklus
                        perencanaan berikutnya.
                      </p>
                    </div>
                  )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <RiInformationLine className="size-5" />
                </div>
                <p className="mt-3 text-xs font-semibold text-foreground">
                  {need.status === 'submitted'
                    ? 'Menunggu Ketetapan Direktur'
                    : need.status === 'revision'
                      ? 'Dalam Proses Revisi'
                      : need.status === 'rejected'
                        ? 'Usulan Ditolak'
                        : 'Belum Diajukan'}
                </p>
                <p className="mt-1 max-w-[260px] text-xss text-muted-foreground">
                  {need.status === 'submitted'
                    ? 'Kuantitas dan harga satuan resmi akan ditetapkan oleh Direktur pada tahap review.'
                    : need.status === 'revision'
                      ? 'Unit kerja pengusul sedang memperbaiki usulan sesuai arahan Direktur.'
                      : need.status === 'rejected'
                        ? need.is_recommended_for_next_cycle
                          ? `Usulan ditolak untuk siklus ini namun direkomendasikan penuh (${requestedVolume.toLocaleString('id-ID')} ${need.unit}) untuk siklus berikutnya.`
                          : 'Usulan tidak disetujui untuk siklus anggaran ini.'
                        : 'Usulan masih berupa draft dan belum diajukan untuk review.'}
                </p>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
