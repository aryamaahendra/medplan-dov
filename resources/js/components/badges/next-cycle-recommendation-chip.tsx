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

  const { label, tooltipText } = getRecommendationDetails(
    recommendedVolumeProp ?? need?.recommended_volume,
    volumeProp ?? need?.volume,
    unitProp ?? need?.unit,
  );
  const chipElement = (
    <span
      className={cn(
        domainBadgeVariants({ tone: 'info', size }),
        withTooltip && 'cursor-help',
        className,
      )}
      {...props}
    >
      {showIcon && <RiShareForwardLine data-icon="inline-start" />}
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

function getRecommendationDetails(
  recVol: number | string | null | undefined,
  totalVol: number | string | null | undefined,
  unit: string | null | undefined,
) {
  const parsedRec = recVol != null ? Number(recVol) : null;
  const parsedTotal = totalVol != null ? Number(totalVol) : null;
  const hasVolume =
    parsedRec != null && !Number.isNaN(parsedRec) && parsedRec > 0;
  const isPartial =
    hasVolume &&
    (parsedTotal != null && !Number.isNaN(parsedTotal)
      ? parsedRec < parsedTotal
      : true);

  const formattedRec = hasVolume
    ? parsedRec.toLocaleString('id-ID', { maximumFractionDigits: 4 })
    : null;
  const unitSuffix = unit ? ` ${unit}` : '';

  const label =
    isPartial && formattedRec
      ? `Siklus Berikutnya (${formattedRec}${unitSuffix})`
      : 'Rekomendasi Siklus Berikutnya';

  const tooltipText =
    isPartial && formattedRec
      ? `Direkomendasikan Direktur untuk siklus perencanaan berikutnya (Sisa volume: ${formattedRec}${unitSuffix})`
      : 'Direkomendasikan Direktur untuk siklus perencanaan berikutnya';

  return { label, tooltipText };
}
