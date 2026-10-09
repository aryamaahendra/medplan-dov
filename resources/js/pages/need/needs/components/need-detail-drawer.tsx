import {
  RiFileTextLine,
  RiEdit2Line,
  RiQuillPenLine,
  RiLockLine,
  RiStarFill,
  RiGovernmentLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatDateTime, formatIDR } from '@/lib/formatters';
import {
  getCombinedPriority,
  getNeedWorkflowStage,
  WORKFLOW_STAGES,
} from '@/lib/need-workflow';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

interface NeedDetailDrawerProps {
  need: Need | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
  onLock?: (need: Need) => void;
  onUnlock?: (need: Need) => void;
}

type DrawerTab = 'summary' | 'kak' | 'alignment' | 'review';

export function NeedDetailDrawer({
  need,
  open,
  onOpenChange,
  onEdit,
  onReview,
}: NeedDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('summary');

  if (!need) {
    return null;
  }

  const stage = getNeedWorkflowStage(need);
  const stageMeta = WORKFLOW_STAGES[stage];
  const StageIcon = stageMeta.icon;
  const priority = getCombinedPriority(need);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
      >
        {/* Header with Title and Primary Badges */}
        <SheetHeader className="border-b bg-muted/20 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {need.year}
            </Badge>
            {need.need_type?.name && (
              <Badge variant="secondary">{need.need_type.name}</Badge>
            )}
            <Badge variant={stageMeta.variant}>
              <StageIcon data-icon="inline-start" />
              {stageMeta.label}
            </Badge>
            {need.is_locked && (
              <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground dark:text-warning">
                <RiLockLine className="size-3" />
                Terkunci
              </span>
            )}
          </div>

          <SheetTitle className="mt-2 text-lg leading-snug font-bold">
            {need.title}
          </SheetTitle>

          {unitPath.length > 0 && (
            <SheetDescription className="mt-1 flex items-center gap-1.5 text-xs">
              <RiGovernmentLine className="size-3.5 shrink-0 opacity-70" />
              <span>{unitPath.join(' › ')}</span>
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Tab navigation pills */}
        <div className="flex items-center gap-1 border-b bg-muted/10 px-5 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'summary'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Ringkasan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kak')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'kak'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            KAK / TOR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alignment')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'alignment'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Keterkaitan (
            {(need.sasarans_count ?? 0) +
              (need.kpi_indicators_count ?? 0) +
              (need.strategic_service_plans_count ?? 0)}
            )
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'review'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Review & Kunci
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'summary' && (
            <div className="flex flex-col gap-5 text-sm">
              {/* Financial Box */}
              <div className="rounded-xl border bg-card p-4">
                <span className="text-xs text-muted-foreground">
                  Total Kebutuhan Anggaran
                </span>
                <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground">
                  {formatIDR(need.total_price)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Volume:{' '}
                  <strong className="font-mono text-foreground">
                    {Number(need.volume).toLocaleString('id-ID')} {need.unit}
                  </strong>{' '}
                  ×{' '}
                  <span className="font-mono">
                    {formatIDR(need.unit_price)}
                  </span>
                </div>
              </div>

              {/* Priority & Impact Matrix */}
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Matriks Prioritas
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={priority.colorClass}>
                    {priority.label}
                  </Badge>
                  {need.is_priority && (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <RiStarFill data-icon="inline-start" />
                      Usulan Prioritas
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {need.description && (
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Deskripsi Kebutuhan
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed whitespace-pre-line text-foreground/90 sm:text-sm">
                    {need.description}
                  </p>
                </div>
              )}

              {/* Conditions */}
              {(need.current_condition || need.required_condition) && (
                <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
                  {need.current_condition && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Kondisi Saat Ini
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-foreground">
                        {need.current_condition}
                      </p>
                    </div>
                  )}
                  {need.required_condition && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Kondisi Yang Diharapkan
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-foreground">
                        {need.required_condition}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Checklist Progress */}
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    Kelengkapan Checklist
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {checklistScore}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
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
          )}

          {activeTab === 'kak' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="rounded-lg border bg-muted/20 p-4 leading-relaxed text-muted-foreground">
                <p>
                  Untuk melihat atau melengkapi Kerangka Acuan Kerja (KAK / TOR)
                  secara utuh (Latar Belakang, Spesifikasi Teknis, KPA, dan
                  Sumber Dana), silakan buka halaman rincian.
                </p>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      window.location.href = needRoutes.show.url({
                        need: need.id,
                      });
                    }}
                  >
                    <RiFileTextLine data-icon="inline-start" />
                    Buka Halaman Detail KAK
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alignment' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Sasaran Strategis Renstra</span>
                  <span className="font-mono font-bold">
                    {need.sasarans_count ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b py-2">
                  <span className="font-medium">
                    Indikator Kinerja Utama (IKU)
                  </span>
                  <span className="font-mono font-bold">
                    {need.kpi_indicators_count ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium">
                    Rencana Layanan Strategis (RLS)
                  </span>
                  <span className="font-mono font-bold">
                    {need.strategic_service_plans_count ?? 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="flex flex-col gap-4 text-xs">
              {/* Director Review & Notes */}
              <div className="rounded-xl border bg-card p-4">
                <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Status Review Direktur
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant={
                      need.approved_by_director_at ? 'default' : 'secondary'
                    }
                  >
                    {need.approved_by_director_at
                      ? 'Telah Disetujui Direktur'
                      : 'Belum Direview'}
                  </Badge>
                  {need.approved_by_director_at && (
                    <span className="text-muted-foreground">
                      {formatDateTime(need.approved_by_director_at)}
                    </span>
                  )}
                </div>

                {need.notes ? (
                  <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning-foreground dark:text-warning">
                    <span className="font-semibold">
                      Catatan Evaluasi Direktur:
                    </span>
                    <p className="mt-1 leading-relaxed whitespace-pre-line">
                      {need.notes}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-muted-foreground italic">
                    Belum ada catatan evaluasi dari Direktur.
                  </p>
                )}
              </div>

              {/* Lock & Window Status */}
              <div className="rounded-xl border bg-card p-4">
                <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Status Penguncian & Batas Waktu
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status Kunci:</span>
                    <span className="font-medium">
                      {need.is_locked ? 'Terkunci' : 'Terbuka'}
                    </span>
                  </div>
                  {need.lock_reason && (
                    <div className="rounded bg-muted/40 p-2 text-muted-foreground">
                      Alasan: {need.lock_reason}
                    </div>
                  )}
                  {need.unlocked_until && (
                    <div className="flex items-center justify-between text-warning-foreground dark:text-warning">
                      <span>Perpanjangan Aktif Sampai:</span>
                      <span className="font-mono">
                        {formatDateTime(need.unlocked_until)}
                      </span>
                    </div>
                  )}
                  {need.group_submission_end_at && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Batas Akhir Periode:</span>
                      <span className="font-mono">
                        {formatDateTime(need.group_submission_end_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Action Bar */}
        <div className="flex items-center justify-between border-t bg-muted/20 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            {need.can?.approve && (
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  onOpenChange(false);
                  onReview(need);
                }}
              >
                <RiQuillPenLine data-icon="inline-start" />
                Review Direktur
              </Button>
            )}

            {need.can?.update && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(need);
                }}
              >
                <RiEdit2Line data-icon="inline-start" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
