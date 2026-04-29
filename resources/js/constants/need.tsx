import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import type { ElementType } from 'react';

import type { NeedStatus } from '@/types/need';

export const STATUS_LABELS: Record<NeedStatus, string> = {
  draft: 'Draft',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export const STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Usulan masih dalam tahap pengerjaan.',
  },
  {
    value: 'approved',
    label: 'Disetujui',
    description: 'Usulan telah disetujui untuk diproses.',
  },
  {
    value: 'rejected',
    label: 'Ditolak',
    description: 'Usulan tidak dapat dilanjutkan.',
  },
] as const;

export const STATUS_VARIANTS: Record<
  NeedStatus,
  'secondary' | 'default' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

export const STATUS_ICONS: Record<NeedStatus, ElementType> = {
  draft: FileText,
  approved: CheckCircle2,
  rejected: XCircle,
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
  high: 'bg-orange-50 text-orange-700 border-orange-200/50 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  medium:
    'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  low: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
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
