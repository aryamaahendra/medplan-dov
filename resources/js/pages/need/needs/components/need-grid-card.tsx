import { Link } from '@inertiajs/react';
import {
  RiFileTextLine,
  RiAttachmentLine,
  RiEdit2Line,
  RiQuillPenLine,
  RiDeleteBinLine,
} from '@remixicon/react';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import {
  NeedStatusBadge,
  NextCycleRecommendationChip,
  PriorityBadge,
  UrgencyImpactBadge,
} from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NeedFinancialAdjustmentIndicator } from '@/features/need/components/need-financial-adjustment-indicator';
import { resolveNeedFinancialFigures } from '@/features/need/utils/need-financial-utils';
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';
interface NeedGridCardProps {
  need: Need;
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
}

export function NeedGridCard({
  need,
  onEdit,
  onDelete,
  onReview,
}: NeedGridCardProps) {
  const figures = resolveNeedFinancialFigures(need);

  const actions: Parameters<typeof ActionDropdown>[0]['actions'] = [
    {
      label: 'Detail',
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

  if (need.can?.approve) {
    actions.push('separator');
    actions.push({
      label: 'Review Direktur',
      icon: RiQuillPenLine,
      onClick: () => onReview(need),
      indicator: !!need.notes,
    });
  }

  const percentage = Number(need.checklist_percentage || 0);

  // Build unit path
  const unitPath: string[] = [];

  if (need.organizational_unit) {
    const traverse = (unit: typeof need.organizational_unit) => {
      if (!unit) {
        return;
      }

      if (unit.parents_recursive) {
        traverse(unit.parents_recursive);
      }

      unitPath.push(unit.name);
    };
    traverse(need.organizational_unit);
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="">
          {/* Identity row */}
          <div className="flex items-start gap-2 px-3 pb-2">
            <div className="flex flex-1 flex-wrap gap-1.5">
              <Badge variant="outline">{need.year}</Badge>
              {need.need_type?.name && (
                <Badge variant="secondary">{need.need_type.name}</Badge>
              )}
            </div>
            <ActionDropdown actions={actions} align="end" />
          </div>

          {/* Title */}
          <div className={cn('px-3 pb-1', unitPath.length === 0 && 'pb-3')}>
            <Link
              href={needRoutes.show.url({ need: need.id })}
              className="line-clamp-2 text-sm leading-snug font-semibold hover:underline"
            >
              {need.title}
            </Link>
          </div>

          {/* Unit path */}
          {unitPath.length > 0 && (
            <div className="px-3 pb-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span
                        className={cn(
                          'line-clamp-1 text-[12px] leading-tight text-muted-foreground hover:text-foreground',
                          unitPath.length > 1 && 'cursor-help',
                        )}
                      >
                        {unitPath[unitPath.length - 1]}
                      </span>
                    }
                  />
                  <TooltipContent
                    side="bottom"
                    align="start"
                    className="text-xs"
                  >
                    {unitPath.join(' › ')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Financial */}
          <div className="border-t px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xss text-muted-foreground tabular-nums">
                {figures.displayVolume.toLocaleString('id-ID')} {need.unit} ×{' '}
                {formatIDR(figures.displayUnitPrice)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-1">
              <span className="font-mono text-lg font-semibold text-foreground tabular-nums">
                {formatIDR(figures.displayTotalPrice)}
              </span>
              <NeedFinancialAdjustmentIndicator
                figures={figures}
                unit={need.unit}
                showLabel={false}
              />
            </div>
          </div>

          {/* Priority & Urgency/Impact signals */}
          <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2">
            <PriorityBadge isPriority={need.is_priority} />
            <UrgencyImpactBadge urgency={need.urgency} impact={need.impact} />
          </div>

          {/* Unified Status & Recommendation Chip */}
          <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2">
            <NeedStatusBadge need={need} />
            <NextCycleRecommendationChip need={need} />
          </div>
        </div>

        {/* Checklist score */}
        <div className="mt-auto flex shrink grow flex-col justify-end border-t px-3 pt-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground tabular-nums">
              Checklist
            </span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                percentage >= 85
                  ? 'font-bold text-foreground'
                  : percentage >= 50
                    ? 'text-warning'
                    : 'text-muted-foreground',
              )}
            >
              {percentage}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full transition-all duration-500',
                percentage >= 100
                  ? 'bg-primary'
                  : percentage >= 85
                    ? 'bg-primary/80'
                    : percentage > 50
                      ? 'bg-warning'
                      : 'bg-primary/30',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
