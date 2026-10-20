import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiFeedbackLine,
  RiFileTextLine,
  RiSendPlaneLine,
} from '@remixicon/react';
import type { ElementType } from 'react';

import type { NeedStatus } from '@/types/need';

export const STATUS_LABELS: Record<NeedStatus, string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  revision: 'Perlu Revisi',
};

export const STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Usulan masih dalam tahap pengerjaan dan belum diajukan.',
  },
  {
    value: 'submitted',
    label: 'Diajukan',
    description: 'Usulan telah diajukan dan menunggu review direktur.',
  },
  {
    value: 'approved',
    label: 'Disetujui',
    description: 'Usulan telah disetujui secara resmi oleh direktur.',
  },
  {
    value: 'rejected',
    label: 'Ditolak',
    description: 'Usulan tidak disetujui oleh direktur.',
  },
  {
    value: 'revision',
    label: 'Perlu Revisi',
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
