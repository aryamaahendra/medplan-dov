import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NEED_STATUS_CONFIG } from '@/constants/need';
import type { NeedStatusConfig } from '@/constants/need';
import { cn } from '@/lib/utils';
import type { Need, NeedStatus } from '@/types/need';

export const NEED_STATUS_MAP = NEED_STATUS_CONFIG;
export type { NeedStatusConfig };

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
      {showIcon && <Icon data-icon="inline-start" />}
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
