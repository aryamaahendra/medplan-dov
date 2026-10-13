import { RiCheckLine, RiCloseLine, RiSubtractLine } from '@remixicon/react';
import type * as React from 'react';

import type { BaseDomainBadgeProps } from '@/components/badges/badge-types';
import { domainBadgeVariants } from '@/components/badges/badge-types';
import { cn } from '@/lib/utils';

export type ChecklistAnswerValue = 'yes' | 'no' | 'skip';

export interface ChecklistAnswerConfig {
  label: string;
  tone: 'success' | 'destructive' | 'muted';
  icon: React.ElementType;
}

export const CHECKLIST_ANSWER_MAP: Record<
  ChecklistAnswerValue,
  ChecklistAnswerConfig
> = {
  yes: {
    label: 'Sesuai',
    tone: 'success',
    icon: RiCheckLine,
  },
  no: {
    label: 'Belum Sesuai',
    tone: 'destructive',
    icon: RiCloseLine,
  },
  skip: {
    label: 'Tidak Relevan',
    tone: 'muted',
    icon: RiSubtractLine,
  },
};

export interface ChecklistAnswerBadgeProps extends BaseDomainBadgeProps {
  answer?: ChecklistAnswerValue | string | null;
}

export function ChecklistAnswerBadge({
  answer,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: ChecklistAnswerBadgeProps) {
  const normAnswer = (answer ?? 'skip') as ChecklistAnswerValue;
  const config = CHECKLIST_ANSWER_MAP[normAnswer] ?? CHECKLIST_ANSWER_MAP.skip;
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
