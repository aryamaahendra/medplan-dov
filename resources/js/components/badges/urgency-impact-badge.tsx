import {
  RiAlertLine,
  RiInformationLine,
  RiSubtractLine,
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
import type { NeedPriority } from '@/types/need';

export interface UrgencyImpactBadgeProps extends BaseDomainBadgeProps {
  urgency?: NeedPriority | string | null;
  impact?: NeedPriority | string | null;
  withTooltip?: boolean;
}

const SCALE_LABEL: Record<string, string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
};

export function UrgencyImpactBadge({
  urgency,
  impact,
  size = 'sm',
  showIcon = true,
  withTooltip = true,
  className,
  ...props
}: UrgencyImpactBadgeProps) {
  const normUrgency = String(urgency ?? 'low').toLowerCase();
  const normImpact = String(impact ?? 'low').toLowerCase();

  const isHigh = normUrgency === 'high' || normImpact === 'high';
  const isMedium = normUrgency === 'medium' || normImpact === 'medium';

  const tone = isHigh ? 'warning' : isMedium ? 'info' : 'muted';
  const Icon = isHigh
    ? RiAlertLine
    : isMedium
      ? RiInformationLine
      : RiSubtractLine;

  const urgencyLabel = SCALE_LABEL[normUrgency] ?? 'Rendah';
  const impactLabel = SCALE_LABEL[normImpact] ?? 'Rendah';
  const label = `Urgensi ${urgencyLabel} · Dampak ${impactLabel}`;

  const badgeElement = (
    <span
      className={cn(domainBadgeVariants({ tone, size }), className)}
      {...props}
    >
      {showIcon && <Icon data-icon="inline-start" className="shrink-0" />}
      <span>{label}</span>
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
          Tingkat Urgensi: {urgencyLabel} | Dampak Operasional: {impactLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
