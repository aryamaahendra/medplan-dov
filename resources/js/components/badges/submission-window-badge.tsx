import {
  RiDoorOpenLine,
  RiLockLine,
  RiCalendarEventLine,
  RiTimeLine,
} from '@remixicon/react';
import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import { cn } from '@/lib/utils';

export type SubmissionWindowStatus =
  'open' | 'closed' | 'upcoming' | 'indefinite';

export interface SubmissionWindowConfig {
  label: string;
  tone: 'success' | 'destructive' | 'warning' | 'muted';
  icon: React.ElementType;
}

export const SUBMISSION_WINDOW_MAP: Record<
  SubmissionWindowStatus,
  SubmissionWindowConfig
> = {
  open: {
    label: 'Buka Pengajuan',
    tone: 'success',
    icon: RiDoorOpenLine,
  },
  closed: {
    label: 'Pengajuan Ditutup',
    tone: 'destructive',
    icon: RiLockLine,
  },
  upcoming: {
    label: 'Mendatang',
    tone: 'warning',
    icon: RiCalendarEventLine,
  },
  indefinite: {
    label: 'Jadwal Fleksibel',
    tone: 'muted',
    icon: RiTimeLine,
  },
};

export interface SubmissionWindowBadgeProps extends BaseDomainBadgeProps {
  status?: SubmissionWindowStatus | string | null;
}

export function SubmissionWindowBadge({
  status,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: SubmissionWindowBadgeProps) {
  const normalizedStatus = (status ?? 'indefinite') as SubmissionWindowStatus;
  const config =
    SUBMISSION_WINDOW_MAP[normalizedStatus] ?? SUBMISSION_WINDOW_MAP.indefinite;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        domainBadgeVariants({ tone: config.tone, size }),
        className,
      )}
      {...props}
    >
      {showIcon && <Icon data-icon="inline-start" className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
