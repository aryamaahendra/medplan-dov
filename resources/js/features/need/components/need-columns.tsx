import { Link } from '@inertiajs/react';
import {
  RiFileTextLine,
  RiAttachmentLine,
  RiEdit2Line,
  RiQuillPenLine,
  RiDeleteBinLine,
  RiLockUnlockLine,
  RiLinksLine,
  RiLockLine,
} from '@remixicon/react';
import type { ColumnDef } from '@tanstack/react-table';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import {
  DirectorReviewBadge,
  LockStatusBadge,
  PriorityBadge,
  ProposalStatusBadge,
  UrgencyImpactBadge,
} from '@/components/badges';
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
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

export const getNeedColumns = (
  onEdit: (need: Need) => void,
  onDelete: (need: Need) => void,
  onReview: (need: Need) => void,
  onSelectDetail?: (need: Need) => void,
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

      if (unit) {
        let current: typeof unit | null | undefined = unit;

        while (current) {
          path.unshift(current.name);
          current = current.parents_recursive ?? undefined;
        }
      }

      return (
        <div className="flex max-w-[340px] flex-col gap-1 py-1">
          <div className="flex items-start gap-1.5">
            <Link
              href={needRoutes.show.url({ need: need.id })}
              className="line-clamp-2 text-left leading-snug font-semibold text-foreground transition-colors hover:text-foreground hover:underline"
            >
              {need.title}
            </Link>
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
                      <span className="line-clamp-1 cursor-help text-xss hover:text-foreground">
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
          <span className="text-xss text-muted-foreground">
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

      return (
        <div className="flex items-center gap-1.5">
          <PriorityBadge isPriority={need.is_priority} />
          <UrgencyImpactBadge urgency={need.urgency} impact={need.impact} />
        </div>
      );
    },
  },
  {
    id: 'status_review',
    header: 'Status & Review',
    cell: ({ row }) => {
      const need = row.original;

      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-wrap items-center gap-1">
            <ProposalStatusBadge status={need.status} />
            <DirectorReviewBadge need={need} />
          </div>
          <LockStatusBadge
            isLocked={need.is_locked}
            unlockedUntil={need.unlocked_until}
            lockReason={need.lock_reason}
          />
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
          <div className="flex items-center justify-between font-mono text-xss text-muted-foreground">
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

          <div className="flex items-center gap-2 text-xss text-muted-foreground">
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
          label: 'Lihat Detail',
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
              render={
                <Link href={needRoutes.show.url({ need: need.id })}>
                  Detail
                </Link>
              }
            />
          )}

          <ActionDropdown actions={actions} align="end" />
        </div>
      );
    },
  },
];

export const getSmartColumns = getNeedColumns;
