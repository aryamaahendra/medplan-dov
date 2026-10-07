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
      'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
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
    ? 'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
    : isMedium
      ? 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

  return { label, level, colorClass };
}
