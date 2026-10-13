import {
  RiFileTextLine,
  RiSendPlaneLine,
  RiCloseCircleLine,
} from '@remixicon/react';
import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import { cn } from '@/lib/utils';
import type { NeedStatus } from '@/types/need';

export interface ProposalStatusConfig {
  label: string;
  tone: 'muted' | 'info' | 'destructive';
  icon: React.ElementType;
}

export const PROPOSAL_STATUS_MAP: Record<NeedStatus, ProposalStatusConfig> = {
  draft: {
    label: 'Draft',
    tone: 'muted',
    icon: RiFileTextLine,
  },
  approved: {
    label: 'Diajukan',
    tone: 'info',
    icon: RiSendPlaneLine,
  },
  rejected: {
    label: 'Ditolak',
    tone: 'destructive',
    icon: RiCloseCircleLine,
  },
};

export interface ProposalStatusBadgeProps extends BaseDomainBadgeProps {
  status?: NeedStatus | string | null;
}

export function ProposalStatusBadge({
  status,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: ProposalStatusBadgeProps) {
  const normalizedStatus = (status ?? 'draft') as NeedStatus;
  const config =
    PROPOSAL_STATUS_MAP[normalizedStatus] ?? PROPOSAL_STATUS_MAP.draft;
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
