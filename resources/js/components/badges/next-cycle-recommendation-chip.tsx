import { RiShareForwardLine } from '@remixicon/react';
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
import type { Need } from '@/types/need';

export interface NextCycleRecommendationChipProps extends BaseDomainBadgeProps {
  need?: Pick<
    Need,
    'is_recommended_for_next_cycle' | 'recommended_volume' | 'volume' | 'unit'
  > | null;
  isRecommended?: boolean | null;
  recommendedVolume?: string | number | null;
  volume?: string | number | null;
  unit?: string | null;
  withTooltip?: boolean;
}

export function NextCycleRecommendationChip({
  need,
  isRecommended: isRecommendedProp,
  recommendedVolume: recommendedVolumeProp,
  volume: volumeProp,
  unit: unitProp,
  size = 'sm',
  showIcon = true,
  withTooltip = true,
  className,
  ...props
}: NextCycleRecommendationChipProps) {
  const isRecommended =
    isRecommendedProp ?? need?.is_recommended_for_next_cycle ?? false;

  if (!isRecommended) {
    return null;
  }

  const recVol = recommendedVolumeProp ?? need?.recommended_volume ?? null;
  const totalVol = volumeProp ?? need?.volume ?? null;
  const unit = unitProp ?? need?.unit ?? '';

  const parsedRecVol = recVol !== null ? Number(recVol) : null;
  const parsedTotalVol = totalVol !== null ? Number(totalVol) : null;

  const isPartial =
    parsedRecVol !== null &&
    parsedRecVol > 0 &&
    parsedTotalVol !== null &&
    parsedRecVol < parsedTotalVol;

  const formattedRecVol =
    parsedRecVol !== null
      ? parsedRecVol.toLocaleString('id-ID', { maximumFractionDigits: 4 })
      : null;

  const label =
    isPartial && formattedRecVol
      ? `Siklus Berikutnya (${formattedRecVol}${unit ? ` ${unit}` : ''})`
      : 'Rekomendasi Siklus Berikutnya';

  const tooltipText =
    isPartial && formattedRecVol
      ? `Direkomendasikan Direktur untuk siklus perencanaan berikutnya (Sisa volume: ${formattedRecVol}${unit ? ` ${unit}` : ''})`
      : 'Direkomendasikan Direktur untuk siklus perencanaan berikutnya';

  const chipElement = (
    <span
      className={cn(
        domainBadgeVariants({ tone: 'info', size }),
        withTooltip && 'cursor-help',
        className,
      )}
      {...props}
    >
      {showIcon && (
        <RiShareForwardLine data-icon="inline-start" className="shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );

  if (!withTooltip) {
    return chipElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={chipElement} />
        <TooltipContent className="max-w-xs text-xs">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
