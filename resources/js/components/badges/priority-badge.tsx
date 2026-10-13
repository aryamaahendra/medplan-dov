import { RiStarFill } from '@remixicon/react';
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

export interface PriorityBadgeProps extends BaseDomainBadgeProps {
  isPriority?: boolean | null;
  tooltipText?: string;
  withTooltip?: boolean;
}

export function PriorityBadge({
  isPriority,
  size = 'sm',
  showIcon = true,
  tooltipText = 'Usulan Prioritas Strategis',
  withTooltip = true,
  className,
  ...props
}: PriorityBadgeProps) {
  if (!isPriority) {
    return null;
  }

  const badgeElement = (
    <span
      className={cn(
        domainBadgeVariants({ tone: 'warning', size }),
        'font-semibold text-warning-foreground dark:text-warning',
        className,
      )}
      {...props}
    >
      {showIcon && (
        <RiStarFill
          data-icon="inline-start"
          className="shrink-0 fill-warning text-warning"
        />
      )}
      <span>Prioritas</span>
    </span>
  );

  if (!withTooltip) {
    return badgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={badgeElement} />
        <TooltipContent side="top" className="text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
