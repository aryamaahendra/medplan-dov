import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiFeedbackLine,
  RiFileTextLine,
  RiSendPlaneLine,
} from '@remixicon/react';
import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Need, NeedStatus } from '@/types/need';

export interface NeedStatusConfig {
  label: string;
  tone: 'muted' | 'info' | 'success' | 'destructive' | 'warning';
  icon: React.ElementType;
  defaultTooltip: string;
}

export const NEED_STATUS_MAP: Record<NeedStatus, NeedStatusConfig> = {
  draft: {
    label: 'Draft',
    tone: 'muted',
    icon: RiFileTextLine,
    defaultTooltip: 'Draft usulan belum diajukan',
  },
  submitted: {
    label: 'Diajukan',
    tone: 'info',
    icon: RiSendPlaneLine,
    defaultTooltip: 'Menunggu Review Direktur',
  },
  approved: {
    label: 'Disetujui Direktur',
    tone: 'success',
    icon: RiCheckboxCircleLine,
    defaultTooltip: 'Telah disetujui Direktur',
  },
  rejected: {
    label: 'Ditolak Direktur',
    tone: 'destructive',
    icon: RiCloseCircleLine,
    defaultTooltip: 'Ditolak oleh Direktur',
  },
  revision: {
    label: 'Perlu Revisi',
    tone: 'warning',
    icon: RiFeedbackLine,
    defaultTooltip: 'Perlu perbaikan sesuai arahan Direktur',
  },
};

export interface NeedStatusBadgeProps extends BaseDomainBadgeProps {
  status?: NeedStatus | string | null;
  need?: Pick<Need, 'status' | 'notes'> | null;
  notes?: string | null;
  withTooltip?: boolean;
}

export function NeedStatusBadge({
  status: statusProp,
  need,
  notes: notesProp,
  size = 'sm',
  showIcon = true,
  withTooltip = true,
  className,
  ...props
}: NeedStatusBadgeProps) {
  const resolvedStatus = (statusProp ?? need?.status ?? 'draft') as NeedStatus;
  const config = NEED_STATUS_MAP[resolvedStatus] ?? NEED_STATUS_MAP.draft;
  const Icon = config.icon;
  const effectiveNotes = notesProp ?? need?.notes ?? null;
  const cleanNotes = effectiveNotes
    ? effectiveNotes.replace(/<[^>]*>?/gm, '').trim()
    : null;

  const hasInteractiveTooltip =
    withTooltip && (Boolean(cleanNotes) || Boolean(config.defaultTooltip));

  const badgeElement = (
    <span
      className={cn(
        domainBadgeVariants({ tone: config.tone, size }),
        hasInteractiveTooltip && 'cursor-help',
        className,
      )}
      {...props}
    >
      {showIcon && <Icon data-icon="inline-start" className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );

  if (!hasInteractiveTooltip) {
    return badgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={badgeElement} />
        <TooltipContent className="max-w-xs text-xs">
          {resolvedStatus === 'revision' && cleanNotes ? (
            <div>
              <p className="font-semibold text-warning">Catatan Direktur:</p>
              <p className="mt-1 line-clamp-3 text-muted-foreground">
                {cleanNotes}
              </p>
            </div>
          ) : resolvedStatus === 'rejected' && cleanNotes ? (
            <div>
              <p className="font-semibold text-destructive">
                Catatan Penolakan:
              </p>
              <p className="mt-1 line-clamp-3 text-muted-foreground">
                {cleanNotes}
              </p>
            </div>
          ) : (
            <p>{config.defaultTooltip}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
