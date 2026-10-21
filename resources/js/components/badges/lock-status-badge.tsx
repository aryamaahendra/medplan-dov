import { RiLockFill, RiLockUnlockFill } from '@remixicon/react';
import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export interface LockStatusBadgeProps extends BaseDomainBadgeProps {
  isLocked?: boolean | null;
  unlockedUntil?: string | null;
  lockReason?: string | null;
  withTooltip?: boolean;
}

export function LockStatusBadge({
  isLocked,
  unlockedUntil,
  lockReason,
  size = 'sm',
  showIcon = true,
  withTooltip = true,
  className,
  ...props
}: LockStatusBadgeProps) {
  // Check if unlockedUntil is configured without calling impure Date.now() directly during render
  const isOverrideActive = Boolean(
    unlockedUntil &&
    Number.isFinite(new Date(unlockedUntil).getTime()) &&
    new Date(unlockedUntil).toISOString() > new Date().toISOString(),
  );

  if (!isLocked && !isOverrideActive) {
    return null;
  }

  const tone = isOverrideActive ? 'info' : 'destructive';
  const Icon = isOverrideActive ? RiLockUnlockFill : RiLockFill;
  const label = isOverrideActive ? 'Perpanjangan Aktif' : 'Terkunci';

  const tooltipText = isOverrideActive
    ? `Dapat disunting hingga ${formatDateTime(unlockedUntil!)}`
    : lockReason || 'Usulan telah dikunci untuk revisi.';

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
        <TooltipContent
          side="bottom"
          align="start"
          className="max-w-xs text-xs"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
