import { Link } from '@inertiajs/react';
import {
  RiFileTextLine,
  RiAttachmentLine,
  RiEdit2Line,
  RiQuillPenLine,
  RiDeleteBinLine,
  RiLockLine,
  RiLockUnlockLine,
  RiGovernmentLine,
  RiStackLine,
  RiCoinsLine,
  RiTimeLine,
  RiChat1Line,
} from '@remixicon/react';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import {
  LockStatusBadge,
  NeedStatusBadge,
  NextCycleRecommendationChip,
  PriorityBadge,
  UrgencyImpactBadge,
} from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NeedFinancialAdjustmentIndicator } from '@/features/need/components/need-financial-adjustment-indicator';
import { resolveNeedFinancialFigures } from '@/features/need/utils/need-financial-utils';
import { formatDateTime, formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

interface NeedListCardDetailedProps {
  need: Need;
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
  onLock?: (need: Need) => void;
  onUnlock?: (need: Need) => void;
}

export function NeedListCardDetailed({
  need,
  onEdit,
  onDelete,
  onReview,
  onLock,
  onUnlock,
}: NeedListCardDetailedProps) {
  const figures = resolveNeedFinancialFigures(need);

  const actions: Parameters<typeof ActionDropdown>[0]['actions'] = [
    {
      label: 'Lihat Detail',
      icon: RiFileTextLine,
      href: needRoutes.show.url({ need: need.id }),
    },
  ];

  if (need.can?.update) {
    actions.push({
      label: 'Edit Usulan',
      icon: RiEdit2Line,
      onClick: () => onEdit(need),
    });
    actions.push({
      label: 'Kelola Lampiran',
      icon: RiAttachmentLine,
      href: NeedAttachmentController.index.url({ need: need.id }),
    });
  }

  if (need.can?.delete) {
    actions.push('separator');
    actions.push({
      label: 'Hapus',
      icon: RiDeleteBinLine,
      onClick: () => onDelete(need),
      variant: 'destructive',
    });
  }

  if (need.can?.approve) {
    actions.push('separator');
    actions.push({
      label: 'Review Direktur',
      icon: RiQuillPenLine,
      onClick: () => onReview(need),
      indicator: !!need.notes,
    });
  }

  if (need.can?.lock && !need.is_locked && onLock) {
    actions.push('separator');
    actions.push({
      label: 'Kunci Usulan',
      icon: RiLockLine,
      onClick: () => onLock(need),
    });
  }

  if (
    need.can?.unlock &&
    (need.is_locked || !!need.unlocked_until) &&
    onUnlock
  ) {
    actions.push('separator');
    actions.push({
      label: 'Buka Kunci / Beri Perpanjangan',
      icon: RiLockUnlockLine,
      onClick: () => onUnlock(need),
    });
  }

  const checklistScore = Number(need.checklist_percentage || 0);

  // Build recursive unit path
  const unitPath: string[] = [];

  if (need.organizational_unit) {
    let current: typeof need.organizational_unit | undefined =
      need.organizational_unit;

    while (current) {
      unitPath.unshift(current.name);
      current = current.parents_recursive ?? undefined;
    }
  }

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-foreground/25 hover:shadow-xs">
      {/* Top Banner: Unit Context, Stage, & Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {need.need_type?.name && (
            <Badge variant="secondary">{need.need_type.name}</Badge>
          )}

          {unitPath.length > 0 && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <RiGovernmentLine className="size-3.5 opacity-60" />
              <span className="font-medium text-foreground">
                {unitPath.join(' › ')}
              </span>
            </span>
          )}

          <NeedStatusBadge need={need} />
          <NextCycleRecommendationChip need={need} />

          <LockStatusBadge
            isLocked={need.is_locked}
            unlockedUntil={need.unlocked_until}
            lockReason={need.lock_reason}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Primary Action Button */}
          {need.can?.approve ? (
            <Button size="sm" variant="outline" onClick={() => onReview(need)}>
              <RiQuillPenLine data-icon="inline-start" />
              Review Direktur
            </Button>
          ) : need.can?.update ? (
            <Button size="sm" variant="outline" onClick={() => onEdit(need)}>
              <RiEdit2Line data-icon="inline-start" />
              Edit Usulan
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              render={
                <Link href={needRoutes.show.url({ need: need.id })}>
                  Detail
                </Link>
              }
            />
          )}

          <ActionDropdown actions={actions} align="end" />
        </div>
      </div>

      {/* Main Body: 2 Columns (Content & Strategic Alignment / Finances) */}
      <div className="grid gap-6 p-4 md:grid-cols-12 md:gap-8">
        {/* Left Column (7-8 cols): Title, Description, Conditions, Alignment */}
        <div className="flex flex-col gap-3 md:col-span-7 lg:col-span-8">
          <div>
            <div className="flex items-start gap-1.5">
              <Link
                href={needRoutes.show.url({ need: need.id })}
                className="text-left text-base leading-snug font-semibold text-foreground transition-colors hover:text-foreground hover:underline sm:text-lg"
              >
                {need.title}
              </Link>
            </div>

            {need.description && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {need.description}
              </p>
            )}
          </div>

          {/* Condition Context Box */}
          {(need.current_condition || need.required_condition) && (
            <div className="grid gap-2 rounded-lg border bg-muted/30 p-2.5 text-xs sm:grid-cols-2">
              {need.current_condition && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Kondisi Saat Ini:
                  </span>
                  <p className="mt-0.5 line-clamp-2 text-foreground/80">
                    {need.current_condition}
                  </p>
                </div>
              )}
              {need.required_condition && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Kebutuhan Target:
                  </span>
                  <p className="mt-0.5 line-clamp-2 text-foreground/80">
                    {need.required_condition}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Strategic alignment tags */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <RiStackLine className="size-3.5 opacity-60" />
              Renstra:{' '}
              <strong className="text-foreground">
                {need.sasarans_count ?? 0} Sasaran
              </strong>
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span>
              IKU:{' '}
              <strong className="text-foreground">
                {need.kpi_indicators_count ?? 0} Indikator
              </strong>
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span>
              RLS:{' '}
              <strong className="text-foreground">
                {need.strategic_service_plans_count ?? 0} Rencana
              </strong>
            </span>
            {need.notes && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="inline-flex items-center gap-1 text-warning-foreground dark:text-warning">
                  <RiChat1Line className="size-3.5" />
                  Ada Catatan Direktur
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Column (4-5 cols): Financial & Status Board */}
        <div className="flex flex-col justify-between gap-4 rounded-lg border bg-muted/15 p-3.5 md:col-span-5 lg:col-span-4">
          {/* Price Breakdown */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <RiCoinsLine className="size-3.5 opacity-70" />
                Total Anggaran
              </span>
              <span className="font-mono tabular-nums">
                {figures.displayVolume.toLocaleString('id-ID')} {need.unit}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xl font-bold tracking-tight text-foreground tabular-nums">
                {formatIDR(figures.displayTotalPrice)}
              </span>
              <NeedFinancialAdjustmentIndicator
                figures={figures}
                unit={need.unit}
                showLabel
              />
            </div>
            <div className="mt-0.5 text-xss text-muted-foreground tabular-nums">
              Harga satuan: {formatIDR(figures.displayUnitPrice)} / {need.unit}
            </div>
          </div>

          {/* Checklist progress */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Kelengkapan Checklist
              </span>
              <span className="font-mono font-semibold text-foreground tabular-nums">
                {checklistScore}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  checklistScore >= 85
                    ? 'bg-primary'
                    : checklistScore >= 50
                      ? 'bg-warning'
                      : 'bg-primary/40',
                )}
                style={{ width: `${checklistScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Priority & Dampak Matrix, Attachments & Time */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/10 px-4 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge isPriority={need.is_priority} />
          <UrgencyImpactBadge urgency={need.urgency} impact={need.impact} />

          <span className="inline-flex items-center gap-1 text-xss text-muted-foreground">
            <RiAttachmentLine className="size-3 opacity-70" />
            {need.attachments_count ?? 0} Lampiran
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={needRoutes.show.url({ need: need.id })}
            className="text-xss font-semibold text-foreground hover:underline"
          >
            Lihat Detail Lengkap ›
          </Link>

          {need.created_at && (
            <span className="hidden font-mono text-xss text-muted-foreground lg:inline-block">
              <RiTimeLine className="mr-0.5 inline size-3 opacity-60" />
              {formatDateTime(need.created_at, {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
