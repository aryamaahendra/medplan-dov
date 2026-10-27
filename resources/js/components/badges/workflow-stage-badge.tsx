import {
  RiFileTextLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from '@remixicon/react';
import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import { cn } from '@/lib/utils';
import type { NeedWorkflowStage } from '@/types/need';

export interface WorkflowStageConfig {
  label: string;
  tone: 'muted' | 'warning' | 'success' | 'destructive';
  icon: React.ElementType;
}

export const WORKFLOW_STAGE_MAP: Record<
  NeedWorkflowStage,
  WorkflowStageConfig
> = {
  draft: {
    label: 'Draft',
    tone: 'muted',
    icon: RiFileTextLine,
  },
  under_review: {
    label: 'Menunggu Review',
    tone: 'warning',
    icon: RiTimeLine,
  },
  approved: {
    label: 'Disetujui',
    tone: 'success',
    icon: RiCheckboxCircleLine,
  },
  rejected: {
    label: 'Ditolak',
    tone: 'destructive',
    icon: RiCloseCircleLine,
  },
};

export interface WorkflowStageBadgeProps extends BaseDomainBadgeProps {
  stage?: NeedWorkflowStage | string | null;
}

export function WorkflowStageBadge({
  stage,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: WorkflowStageBadgeProps) {
  const normalizedStage = (stage ?? 'draft') as NeedWorkflowStage;
  const config =
    WORKFLOW_STAGE_MAP[normalizedStage] ?? WORKFLOW_STAGE_MAP.draft;
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
