import {
  RiFileTextLine,
  RiAttachmentLine,
  RiEdit2Line,
  RiQuillPenLine,
  RiDeleteBinLine,
  RiLockLine,
  RiLockUnlockLine,
  RiStarFill,
  RiInformationLine,
  RiLinksLine,
} from '@remixicon/react';
import type { ColumnDef } from '@tanstack/react-table';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatIDR } from '@/lib/formatters';
import {
  getCombinedPriority,
  getNeedWorkflowStage,
  WORKFLOW_STAGES,
} from '@/lib/need-workflow';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

export const getSmartColumns = (
  onEdit: (need: Need) => void,
  onDelete: (need: Need) => void,
  onReview: (need: Need) => void,
  onSelectDetail: (need: Need) => void,
  onLock?: (need: Need) => void,
  onUnlock?: (need: Need) => void,
): ColumnDef<Need>[] => [
  getIndexColumn(),

  // Column 1: Usulan Kebutuhan (Title, Type, Unit & recursive hierarchy in tooltip)
  {
    accessorKey: 'title',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Usulan Kebutuhan" />
    ),
    cell: ({ row }) => {
      const need = row.original;
      const unit = need.organizational_unit;

      const path: string[] = [];
      let current: typeof unit | null | undefined = unit;

      while (current) {
        path.unshift(current.name);
        current = current.parents_recursive ?? undefined;
      }

      return (
        <div className="flex max-w-[340px] flex-col gap-1 py-1">
          <div className="flex items-start gap-1.5">
            <button
              type="button"
              onClick={() => onSelectDetail(need)}
              className="line-clamp-2 text-left leading-snug font-semibold text-foreground transition-colors hover:text-primary hover:underline"
            >
              {need.title}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {need.need_type?.name && (
              <Badge variant="secondary">{need.need_type.name}</Badge>
            )}

            {path.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="line-clamp-1 cursor-help text-[11px] hover:text-foreground">
                        {path[path.length - 1]}
                      </span>
                    }
                  />
                  <TooltipContent
                    side="bottom"
                    align="start"
                    className="text-xs"
                  >
                    {path.join(' › ')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      );
    },
  },

  // Column 2: Anggaran (Total Price, Breakdown: Volume × Unit Price)
  {
    accessorKey: 'total_price',
    header: (props) => <DataTableColumnHeader {...props} title="Anggaran" />,
    meta: { cellClassName: 'tabular-nums font-mono w-[180px]' },
    cell: ({ row }) => {
      const need = row.original;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {formatIDR(need.total_price)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {Number(need.volume).toLocaleString('id-ID')} {need.unit} ×{' '}
            {formatIDR(need.unit_price)}
          </span>
        </div>
      );
    },
  },

  // Column 3: Prioritas (Priority Star + Combined Urgency/Impact Chip)
  {
    id: 'priority_matrix',
    header: 'Prioritas & Dampak',
    cell: ({ row }) => {
      const need = row.original;
      const priority = getCombinedPriority(need);

      return (
        <div className="flex items-center gap-1.5">
          {need.is_priority ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning-foreground dark:text-warning">
                      <RiStarFill className="size-3.5" />
                    </span>
                  }
                />
                <TooltipContent side="top">Usulan Prioritas</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}

          <Badge variant="outline" className={priority.colorClass}>
            {priority.label}
          </Badge>
        </div>
      );
    },
  },

  // Column 4: Tahapan Alur (Derived Workflow Stage + Lock status)
  {
    id: 'stage',
    header: 'Tahapan Alur',
    cell: ({ row }) => {
      const need = row.original;
      const stage = getNeedWorkflowStage(need);
      const stageMeta = WORKFLOW_STAGES[stage];
      const StageIcon = stageMeta.icon;

      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={stageMeta.variant}>
            <StageIcon data-icon="inline-start" />
            {stageMeta.label}
          </Badge>

          {need.is_locked && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="inline-flex cursor-help items-center gap-0.5 text-[10px] font-medium text-warning-foreground dark:text-warning">
                      <RiLockLine className="size-2.5" />
                      Terkunci
                    </span>
                  }
                />
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-w-xs text-xs"
                >
                  {need.lock_reason || 'Usulan telah dikunci untuk revisi.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {need.unlocked_until && (
            <span className="text-[10px] text-warning-foreground dark:text-warning">
              Perpanjangan aktif
            </span>
          )}
        </div>
      );
    },
  },

  // Column 5: Kelengkapan (Checklist Progress Bar + Attachments & Alignment Badges)
  {
    accessorKey: 'checklist_percentage',
    header: (props) => <DataTableColumnHeader {...props} title="Kelengkapan" />,
    meta: { cellClassName: 'w-[140px]' },
    cell: ({ row }) => {
      const need = row.original;
      const percentage = Number(need.checklist_percentage || 0);
      const totalLinkages =
        (need.sasarans_count ?? 0) +
        (need.kpi_indicators_count ?? 0) +
        (need.strategic_service_plans_count ?? 0);

      return (
        <div className="flex w-[120px] flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>Checklist</span>
            <span className="font-semibold text-foreground">{percentage}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full transition-all duration-300',
                percentage >= 85
                  ? 'bg-primary'
                  : percentage >= 50
                    ? 'bg-warning'
                    : 'bg-primary/40',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span
              className="inline-flex items-center gap-0.5"
              title="Jumlah file lampiran"
            >
              <RiAttachmentLine className="size-3 opacity-70" />
              {need.attachments_count ?? 0}
            </span>
            <span
              className="inline-flex items-center gap-0.5"
              title="Keterkaitan Renstra & KPI"
            >
              <RiLinksLine className="size-3 opacity-70" />
              {totalLinkages} tautan
            </span>
          </div>
        </div>
      );
    },
  },

  // Column 6: Aksi (Role-based Primary Button + Dropdown Action)
  {
    id: 'actions',
    meta: { cellClassName: 'w-1 text-right' },
    cell: ({ row }) => {
      const need = row.original;

      const actions: Parameters<typeof ActionDropdown>[0]['actions'] = [
        {
          label: 'Detail Panel',
          icon: RiInformationLine,
          onClick: () => onSelectDetail(need),
        },
        {
          label: 'Halaman Penuh',
          icon: RiFileTextLine,
          href: needRoutes.show.url({ need: need.id }),
        },
      ];

      if (need.can?.update) {
        actions.push({
          label: 'Edit',
          icon: RiEdit2Line,
          onClick: () => onEdit(need),
        });
        actions.push({
          label: 'Lampiran',
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
          label: 'Buka Kunci / Perpanjangan',
          icon: RiLockUnlockLine,
          onClick: () => onUnlock(need),
        });
      }

      return (
        <div className="flex items-center justify-end gap-1.5">
          {/* Primary Action Button based on workflow stage */}
          {need.can?.approve ? (
            <Button size="sm" variant="outline" onClick={() => onReview(need)}>
              <RiQuillPenLine data-icon="inline-start" />
              Review
            </Button>
          ) : need.can?.update ? (
            <Button size="sm" variant="outline" onClick={() => onEdit(need)}>
              <RiEdit2Line data-icon="inline-start" />
              Edit
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectDetail(need)}
            >
              Detail
            </Button>
          )}

          <ActionDropdown actions={actions} align="end" />
        </div>
      );
    },
  },
];
