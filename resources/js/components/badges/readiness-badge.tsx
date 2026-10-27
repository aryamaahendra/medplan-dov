import { RiShieldCheckLine, RiTimeLine, RiAlertLine } from '@remixicon/react';
import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import { cn } from '@/lib/utils';

export interface ReadinessBadgeProps extends BaseDomainBadgeProps {
  percentage: number | string | null | undefined;
  showPercentage?: boolean;
}

export function ReadinessBadge({
  percentage,
  showPercentage = true,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: ReadinessBadgeProps) {
  const numericPct = Math.round(Number(percentage || 0));

  const isReady = numericPct >= 85;
  const isInProgress = numericPct >= 50 && numericPct < 85;

  const tone = isReady ? 'success' : isInProgress ? 'warning' : 'destructive';
  const Icon = isReady
    ? RiShieldCheckLine
    : isInProgress
      ? RiTimeLine
      : RiAlertLine;

  const label = isReady
    ? 'Siap Ditinjau'
    : isInProgress
      ? 'Perlu Dilengkapi'
      : 'Belum Lengkap';

  return (
    <span
      className={cn(domainBadgeVariants({ tone, size }), className)}
      {...props}
    >
      {showIcon && <Icon data-icon="inline-start" className="shrink-0" />}
      <span>
        {label}
        {showPercentage && ` (${numericPct}%)`}
      </span>
    </span>
  );
}
