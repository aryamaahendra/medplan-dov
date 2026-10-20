import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiFeedbackLine,
  RiFileTextLine,
  RiSendPlaneLine,
} from '@remixicon/react';
import type { ElementType } from 'react';

import type { NeedStatus } from '@/types/need';

export interface NeedStatusConfig {
  label: string;
  tone: 'muted' | 'info' | 'success' | 'destructive' | 'warning';
  icon: ElementType;
  defaultTooltip: string;
}

export const NEED_STATUS_CONFIG: Record<NeedStatus, NeedStatusConfig> = {
  draft: {
    label: 'Draft',
    tone: 'muted',
    icon: RiFileTextLine,
    defaultTooltip: 'Draft usulan belum diajukan',
  },
  submitted: {
    label: 'Diajukan',
    tone: 'info',
    icon: RiSendPlaneLine,
    defaultTooltip: 'Menunggu Review Direktur',
  },
  approved: {
    label: 'Disetujui Direktur',
    tone: 'success',
    icon: RiCheckboxCircleLine,
    defaultTooltip: 'Telah disetujui Direktur',
  },
  rejected: {
    label: 'Ditolak Direktur',
    tone: 'destructive',
    icon: RiCloseCircleLine,
    defaultTooltip: 'Ditolak oleh Direktur',
  },
  revision: {
    label: 'Perlu Revisi',
    tone: 'warning',
    icon: RiFeedbackLine,
    defaultTooltip: 'Perlu revisi berdasarkan catatan telaah Direktur',
  },
};

export const STATUS_LABELS: Record<NeedStatus, string> = {
  draft: NEED_STATUS_CONFIG.draft.label,
  submitted: NEED_STATUS_CONFIG.submitted.label,
  approved: NEED_STATUS_CONFIG.approved.label,
  rejected: NEED_STATUS_CONFIG.rejected.label,
  revision: NEED_STATUS_CONFIG.revision.label,
};

export const STATUS_OPTIONS = [
  {
    value: 'draft',
    label: NEED_STATUS_CONFIG.draft.label,
    description: 'Usulan masih dalam tahap pengerjaan dan belum diajukan.',
  },
  {
    value: 'submitted',
    label: NEED_STATUS_CONFIG.submitted.label,
    description: 'Usulan telah diajukan dan menunggu review direktur.',
  },
  {
    value: 'approved',
    label: NEED_STATUS_CONFIG.approved.label,
    description: 'Usulan telah disetujui secara resmi oleh direktur.',
  },
  {
    value: 'rejected',
    label: NEED_STATUS_CONFIG.rejected.label,
    description: 'Usulan tidak disetujui oleh direktur.',
  },
  {
    value: 'revision',
    label: NEED_STATUS_CONFIG.revision.label,
    description: 'Usulan dikembalikan oleh direktur untuk perbaikan.',
  },
] as const;

export const STATUS_VARIANTS: Record<
  NeedStatus,
  'secondary' | 'default' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
  revision: 'outline',
};

export const STATUS_ICONS: Record<NeedStatus, ElementType> = {
  draft: RiFileTextLine,
  submitted: RiSendPlaneLine,
  approved: RiCheckboxCircleLine,
  rejected: RiCloseCircleLine,
  revision: RiFeedbackLine,
};

export const PRIORITY_LABELS: Record<string, string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
  High: 'Tinggi',
  Medium: 'Sedang',
  Low: 'Rendah',
};

export const LABELED_PRIORITY_LABELS: Record<string, string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
};

export const LABELED_PRIORITY_CLASSES: Record<string, string> = {
  high: 'border-warning/30 bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning',
  medium: 'border-info/30 bg-info/15 text-info dark:bg-info/20 dark:text-info',
  low: 'border-transparent bg-muted text-muted-foreground',
};

export const PRIORITY_LEVELS = [
  {
    value: 'high',
    label: 'Tinggi',
    description: {
      urgency: 'Butuh penanganan segera dan mendesak.',
      impact: 'Berpengaruh besar terhadap operasional utama.',
    },
  },
  {
    value: 'medium',
    label: 'Sedang',
    description: {
      urgency: 'Dibutuhkan namun masih bisa dijadwalkan.',
      impact: 'Berpengaruh pada efisiensi kerja tim.',
    },
  },
  {
    value: 'low',
    label: 'Rendah',
    description: {
      urgency: 'Dapat dipenuhi sesuai ketersediaan sumber daya.',
      impact: 'Dampak minimal terhadap keseluruhan sistem.',
    },
  },
] as const;
