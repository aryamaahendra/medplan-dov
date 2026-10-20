import { RiBuildingFill, RiCoinsFill } from '@remixicon/react';

import {
  NeedStatusBadge,
  NextCycleRecommendationChip,
  PriorityBadge,
  ReadinessBadge,
  UrgencyImpactBadge,
} from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCompactIDR, formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

export interface NeedShowCompactStatsProps {
  need: Need;
}

interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

function BentoTile({
  label,
  headerRight,
  children,
  className,
  ...props
}: BentoTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-2 rounded-xl border p-4',
        className,
      )}
      {...props}
    >
      {(label || headerRight) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="text-xss leading-none font-semibold tracking-wider text-muted-foreground uppercase">
              {label}
            </span>
          )}
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Kartu Statistik Kompak Usulan Kebutuhan
 * Menampilkan ringkasan Pagu Anggaran dengan tata letak matriks Bento eksekutif.
 */
export function NeedShowCompactStats({ need }: NeedShowCompactStatsProps) {
  const checklistPercentage = Number(need.checklist_percentage ?? 0);
  const formattedVolume = Number(need.volume).toLocaleString('id-ID', {
    maximumFractionDigits: 4,
  });
  const isApproved = need.status === 'approved';
  const approvedVolume =
    need.approved_volume !== null && need.approved_volume !== undefined
      ? Number(need.approved_volume)
      : Number(need.volume);
  const formattedApprovedVolume = approvedVolume.toLocaleString('id-ID', {
    maximumFractionDigits: 4,
  });
  const approvedUnitPrice =
    need.approved_unit_price !== null && need.approved_unit_price !== undefined
      ? Number(need.approved_unit_price)
      : Number(need.unit_price);
  const approvedTotalPrice =
    need.approved_total_price !== null &&
    need.approved_total_price !== undefined
      ? Number(need.approved_total_price)
      : isApproved
        ? approvedVolume * approvedUnitPrice
        : Number(need.total_price);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Panel Pagu Anggaran */}
        <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent lg:col-span-4">
          <CardContent className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <div className="flex items-center gap-2">
                <RiCoinsFill className="h-4 w-4 text-foreground" />
                <span>
                  {isApproved
                    ? 'Ketetapan Pagu Anggaran'
                    : 'Alokasi Pagu Anggaran'}
                </span>
              </div>
              {isApproved && (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 py-0 text-xss text-primary"
                >
                  Disetujui
                </Badge>
              )}
            </div>

            <div className="my-3">
              <div
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                title={formatIDR(
                  isApproved ? approvedTotalPrice : need.total_price,
                )}
              >
                {formatCompactIDR(
                  isApproved ? approvedTotalPrice : need.total_price,
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground/80">
                <span className="font-semibold text-foreground">
                  {isApproved ? formattedApprovedVolume : formattedVolume}{' '}
                  {need.unit}
                </span>
                <span>x</span>
                <span
                  title={formatIDR(
                    isApproved ? approvedUnitPrice : need.unit_price,
                  )}
                >
                  {formatCompactIDR(
                    isApproved ? approvedUnitPrice : need.unit_price,
                  )}
                </span>
                {isApproved && (
                  <span className="ml-1 text-muted-foreground">
                    (Awal: {formatCompactIDR(need.total_price)})
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-background">
                TA // {need.year}
              </Badge>

              <Badge variant="outline" className="bg-background">
                {need.need_type?.name || 'Kebutuhan Umum'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Panel Kanan: Bento Tata Kelola & Verifikasi */}
        <div className="grid grid-rows-2 gap-2 lg:col-span-8">
          {/* Bento Baris 1: Tiga Pilar Status */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
            <BentoTile label="Status Dokumen" className="col-span-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <NeedStatusBadge need={need} className="uppercase" />
                <NextCycleRecommendationChip need={need} />
                <PriorityBadge isPriority={need.is_priority} />
              </div>
            </BentoTile>

            <BentoTile label="Urgensi & Dampak" className="col-span-7">
              <div>
                <UrgencyImpactBadge
                  urgency={need.urgency}
                  impact={need.impact}
                  className="uppercase"
                />
              </div>
            </BentoTile>
          </div>

          {/* Bento Baris 2: Kelengkapan KAK & Unit Pengusul */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
            {/* Kelengkapan KAK Progress Tile */}
            <BentoTile
              label="Checklist"
              className="sm:col-span-7"
              headerRight={
                <div className="flex items-center gap-1.5">
                  <ReadinessBadge percentage={checklistPercentage} />
                  <span className="font-mono text-xs font-bold text-foreground">
                    {checklistPercentage}%
                  </span>
                </div>
              }
            >
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, checklistPercentage))}%`,
                  }}
                />
              </div>
            </BentoTile>

            {/* Unit Pengusul Tile */}
            <BentoTile label="Unit Pengusul" className="sm:col-span-5">
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <RiBuildingFill className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {need.organizational_unit?.name || 'Unit Organisasi'}
                </span>
              </div>
            </BentoTile>
          </div>
        </div>
      </div>
    </div>
  );
}
