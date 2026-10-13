import {
  RiCheckboxCircleLine,
  RiFeedbackLine,
  RiTimeLine,
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
import type { Need } from '@/types/need';

export type DirectorReviewState =
  'approved' | 'needs_revision' | 'awaiting_review' | 'none';

export interface DirectorReviewConfig {
  label: string;
  tone: 'success' | 'destructive' | 'warning' | 'muted';
  icon: React.ElementType;
}

export const DIRECTOR_REVIEW_MAP: Record<
  Exclude<DirectorReviewState, 'none'>,
  DirectorReviewConfig
> = {
  approved: {
    label: 'Disetujui Direktur',
    tone: 'success',
    icon: RiCheckboxCircleLine,
  },
  needs_revision: {
    label: 'Perlu Revisi',
    tone: 'destructive',
    icon: RiFeedbackLine,
  },
  awaiting_review: {
    label: 'Menunggu Review',
    tone: 'warning',
    icon: RiTimeLine,
  },
};

export function getDirectorReviewState(
  need: Pick<Need, 'status' | 'approved_by_director_at' | 'notes'>,
): DirectorReviewState {
  if (need.approved_by_director_at) {
    return 'approved';
  }

  const hasNotes =
    typeof need.notes === 'string' &&
    need.notes.trim() !== '' &&
    need.notes.trim() !== '<p></p>';

  if (hasNotes) {
    return 'needs_revision';
  }

  if (need.status === 'approved') {
    return 'awaiting_review';
  }

  return 'none';
}

export interface DirectorReviewBadgeProps extends BaseDomainBadgeProps {
  need?: Pick<Need, 'status' | 'approved_by_director_at' | 'notes'> | null;
  state?: DirectorReviewState | null;
  notes?: string | null;
}

export function DirectorReviewBadge({
  need,
  state: stateProp,
  notes: notesProp,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: DirectorReviewBadgeProps) {
  const effectiveState =
    stateProp ?? (need ? getDirectorReviewState(need) : 'none');
  const effectiveNotes = notesProp ?? need?.notes ?? null;

  if (effectiveState === 'none') {
    return null;
  }

  const config = DIRECTOR_REVIEW_MAP[effectiveState];
  const Icon = config.icon;

  const badgeElement = (
    <span
      className={cn(
        domainBadgeVariants({ tone: config.tone, size }),
        effectiveNotes && 'cursor-help',
        className,
      )}
      {...props}
    >
      {showIcon && <Icon data-icon="inline-start" className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );

  // If there are revision notes, wrap in tooltip for quick peek
  if (effectiveState === 'needs_revision' && effectiveNotes) {
    // Strip simple HTML tags for tooltip display
    const cleanNotes = effectiveNotes.replace(/<[^>]*>?/gm, '').trim();

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={badgeElement} />
          <TooltipContent className="max-w-xs text-xs">
            <p className="font-semibold text-destructive">Catatan Direktur:</p>
            <p className="mt-1 line-clamp-3 text-muted-foreground">
              {cleanNotes || 'Ada catatan revisi dari direktur.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeElement;
}
