import {
  RiBuildingLine,
  RiCoinsLine,
  RiFileCheckLine,
  RiQuillPenLine,
} from '@remixicon/react';

import {
  DirectorReviewBadge,
  PriorityBadge,
  ProposalStatusBadge,
  ReadinessBadge,
  UrgencyImpactBadge,
} from '@/components/badges';
import { Card } from '@/components/ui/card';
import { formatIDR } from '@/lib/formatters';
import type { Need } from '@/types';

export interface NeedShowCompactStatsProps {
  need: Need;
}

/**
 * Kartu Statistik Kompak Usulan Kebutuhan
 * Menampilkan ringkasan Pagu Anggaran dengan tata letak matriks Bento eksekutif.
 */
export function NeedShowCompactStats({ need }: NeedShowCompactStatsProps) {
  const checklistPercentage = Number(need.checklist_percentage ?? 0);

  return (
    <Card className="overflow-hidden border-border/80 shadow-2xs">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Panel Pagu Anggaran */}
        <div className="flex flex-col justify-between border-b border-border/60 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:col-span-4 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
            <RiCoinsLine className="h-4 w-4" />
            <span>Alokasi Pagu Anggaran</span>
          </div>

          <div className="my-3">
            <div className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {formatIDR(need.total_price)}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {need.volume} {need.unit}
              </span>
              <span>@</span>
              <span>{formatIDR(need.unit_price)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-background/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-2xs">
              Tahun Anggaran {need.year}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {need.need_type?.name || 'Kebutuhan Umum'}
            </span>
          </div>
        </div>

        {/* Panel Kanan: Bento Tata Kelola & Verifikasi */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:col-span-8">
          {/* Bento Baris 1: Tiga Pilar Status */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Status Dokumen
              </span>
              <div className="mt-1.5">
                <ProposalStatusBadge status={need.status} />
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Urgensi & Dampak
              </span>
              <div className="mt-1.5">
                <UrgencyImpactBadge
                  urgency={need.urgency}
                  impact={need.impact}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Prioritas Usulan
              </span>
              <div className="mt-1.5">
                <PriorityBadge isPriority={need.is_priority} />
              </div>
            </div>
          </div>

          {/* Bento Baris 2: Kelengkapan KAK & Unit Pengusul */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
            {/* Kelengkapan KAK Progress Tile */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 sm:col-span-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <RiFileCheckLine className="h-4 w-4 text-primary" />
                  <span>Kelengkapan Dokumen KAK</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ReadinessBadge percentage={checklistPercentage} />
                  <span className="font-mono text-xs font-bold text-foreground">
                    {checklistPercentage}%
                  </span>
                </div>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, checklistPercentage))}%`,
                  }}
                />
              </div>
            </div>

            {/* Unit Pengusul Tile */}
            <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-muted/20 p-3 sm:col-span-5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Unit Pengusul
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <RiBuildingLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {need.organizational_unit?.name || 'Unit Organisasi'}
                </span>
              </div>
            </div>
          </div>

          {/* Bento Baris 3: Telaah Direktur */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Hasil Telaah Direktur
              </span>
              <DirectorReviewBadge need={need} />
            </div>

            {need.notes && (
              <div className="mt-2 flex items-start gap-2 border-t border-border/50 pt-2 text-xs">
                <RiQuillPenLine className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Catatan:{' '}
                  </span>
                  {need.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
