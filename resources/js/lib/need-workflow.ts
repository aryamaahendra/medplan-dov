import {
  RiFileTextLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from '@remixicon/react';
import type { ElementType } from 'react';

import type { Need, NeedWorkflowStage } from '@/types/need';

export interface WorkflowStageMeta {
  label: string;
  variant: 'secondary' | 'default' | 'destructive' | 'outline';
  icon: ElementType;
  colorClass: string;
}

export const WORKFLOW_STAGES: Record<NeedWorkflowStage, WorkflowStageMeta> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    icon: RiFileTextLine,
    colorClass: 'bg-muted text-muted-foreground border-border',
  },
  under_review: {
    label: 'Menunggu Review',
    variant: 'outline',
    icon: RiTimeLine,
    colorClass:
      'border-warning/20 bg-warning/15 text-warning-foreground dark:text-warning',
  },
  approved: {
    label: 'Disetujui',
    variant: 'default',
    icon: RiCheckboxCircleLine,
    colorClass: 'bg-primary text-primary-foreground',
  },
  rejected: {
    label: 'Ditolak',
    variant: 'destructive',
    icon: RiCloseCircleLine,
    colorClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function getNeedWorkflowStage(need: Need): NeedWorkflowStage {
  if (need.stage) {
    return need.stage;
  }

  if (need.status === 'rejected') {
    return 'rejected';
  }

  if (need.approved_by_director_at) {
    return 'approved';
  }

  if (need.status === 'approved') {
    return 'under_review';
  }

  return 'draft';
}

export function getCombinedPriority(need: Need): {
  label: string;
  level: string;
  colorClass: string;
} {
  const urgencyNorm = String(need.urgency || '').toLowerCase();
  const impactNorm = String(need.impact || '').toLowerCase();

  const isHigh = urgencyNorm === 'high' || impactNorm === 'high';
  const isMedium = urgencyNorm === 'medium' || impactNorm === 'medium';

  const level = isHigh ? 'high' : isMedium ? 'medium' : 'low';
  const label = `Urgensi ${urgencyNorm === 'high' ? 'Tinggi' : urgencyNorm === 'medium' ? 'Sedang' : 'Rendah'} · Dampak ${impactNorm === 'high' ? 'Tinggi' : impactNorm === 'medium' ? 'Sedang' : 'Rendah'}`;

  const colorClass = isHigh
    ? 'border-warning/30 bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning'
    : isMedium
      ? 'border-info/30 bg-info/15 text-info dark:bg-info/20 dark:text-info'
      : 'border-transparent bg-muted text-muted-foreground';

  return { label, level, colorClass };
}
