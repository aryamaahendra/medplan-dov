import {
  RiArrowRightDownLine,
  RiFileTextFill,
  RiHistoryFill,
  RiInformationFill,
  RiShieldCheckFill,
} from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';
import { resolveNeedFinancialFigures } from './need-financial-utils';

interface NeedFinancialComparisonCardsProps {
  need: Need;
  className?: string;
}

export function NeedFinancialComparisonCards({
  need,
  className,
}: NeedFinancialComparisonCardsProps) {
  const {
    requestedVolume,
    requestedUnitPrice,
    requestedTotalPrice,
    approvedVolume,
    approvedUnitPrice,
    approvedTotalPrice,
    isApproved,
    hasApprovedFigures,
    isVolumeReduced,
    isPriceReduced,
    isAdjusted,
    volumeDifference,
    totalDifference,
  } = resolveNeedFinancialFigures(need);

  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>
      {/* Kartu Usulan Awal */}
      <Card className="flex flex-col justify-between border-border/80 bg-card">
        <div>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <RiFileTextFill className="size-4" />
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
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
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
                  <span className="text-muted-foreground">
                    Volume Kuantitas
                  </span>
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
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Kartu Ketetapan Direktur */}
      <Card className="flex flex-col justify-between border-border/80 bg-card">
        <div>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                  {isApproved ? (
                    <RiShieldCheckFill className="size-4" />
                  ) : (
                    <RiInformationFill className="size-4" />
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

              {isApproved && <Badge variant="secondary">Disetujui</Badge>}
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
                  className="border-warning/40 text-xs text-warning-foreground"
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
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {isApproved || hasApprovedFigures ? (
                <>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
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
                    <div className="rounded-md border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning-foreground">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <RiArrowRightDownLine className="size-3.5 shrink-0" />
                        <span>Rasionalisasi Alokasi Anggaran:</span>
                      </div>
                      <div className="mt-1 space-y-0.5 text-xss text-warning-foreground/80">
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
                      <div className="rounded-md border border-info/30 bg-info/10 p-2.5 text-xs text-info-foreground">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <RiHistoryFill className="size-3.5 shrink-0" />
                          <span>Rekomendasi Siklus Berikutnya (Rollover):</span>
                        </div>
                        <p className="mt-1 text-xss text-info-foreground/85">
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
                    <RiInformationFill className="size-5" />
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
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
