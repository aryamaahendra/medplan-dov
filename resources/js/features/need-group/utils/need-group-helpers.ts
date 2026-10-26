import {
  RiListCheck3,
  RiEdit2Line,
  RiDeleteBinLine,
  RiHistoryLine,
} from '@remixicon/react';

import type { ActionItem } from '@/components/action-dropdown';
import { formatCompactIDR, formatDateTime } from '@/lib/formatters';
import groupRoutes from '@/routes/need-groups';
import type { NeedGroup } from '../types/need-group.types';

export type SubmissionStatusType =
  'open' | 'upcoming' | 'closed' | 'indefinite';

export interface SubmissionStatusInfo {
  status: SubmissionStatusType;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export function getSubmissionStatus(group: NeedGroup): SubmissionStatusInfo {
  if (!group.submission_start_at && !group.submission_end_at) {
    return {
      status: 'indefinite',
      label: 'Tanpa Batas Waktu',
      badgeClass: 'border-transparent bg-muted text-muted-foreground',
      dotClass: 'bg-muted-foreground',
    };
  }

  const now = new Date();

  if (group.submission_start_at && new Date(group.submission_start_at) > now) {
    return {
      status: 'upcoming',
      label: 'Akan Datang',
      badgeClass:
        'border-info/30 bg-info/15 text-info dark:bg-info/20 dark:text-info',
      dotClass: 'bg-info',
    };
  }

  if (group.submission_end_at && new Date(group.submission_end_at) < now) {
    return {
      status: 'closed',
      label: 'Pengajuan Ditutup',
      badgeClass:
        'border-muted-foreground/20 bg-muted/60 text-muted-foreground',
      dotClass: 'bg-muted-foreground/60',
    };
  }

  return {
    status: 'open',
    label: 'Pengajuan Dibuka',
    badgeClass:
      'border-success/30 bg-success/15 text-success-foreground dark:bg-success/20 dark:text-success',
    dotClass: 'bg-success animate-pulse',
  };
}

export interface TimelineTelemetry {
  percentage: number;
  status: SubmissionStatusType;
  humanDiffText: string;
  totalDurationDays: number | null;
  daysRemaining: number | null;
  startDateFormatted: string;
  endDateFormatted: string;
}

export function getTimelineTelemetry(group: NeedGroup): TimelineTelemetry {
  const windowStatus = getSubmissionStatus(group);
  const now = Date.now();

  const startDateFormatted = group.submission_start_at
    ? formatDateTime(group.submission_start_at)
    : '-';
  const endDateFormatted = group.submission_end_at
    ? formatDateTime(group.submission_end_at)
    : '-';

  if (!group.submission_start_at || !group.submission_end_at) {
    return {
      percentage: 100,
      status: windowStatus.status,
      humanDiffText: 'Jadwal fleksibel tanpa batasan',
      totalDurationDays: null,
      daysRemaining: null,
      startDateFormatted,
      endDateFormatted,
    };
  }

  const startMs = new Date(group.submission_start_at).getTime();
  const endMs = new Date(group.submission_end_at).getTime();
  const totalDurationDays = Math.max(
    1,
    Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)),
  );

  let percentage = 0;
  let humanDiffText = '';
  let daysRemaining: number | null = null;

  if (now <= startMs) {
    percentage = 0;
    const diffDays = Math.ceil((startMs - now) / (1000 * 60 * 60 * 24));
    humanDiffText = `Mulai dalam ${diffDays} hari`;
    daysRemaining = diffDays;
  } else if (now >= endMs) {
    percentage = 100;
    const diffDays = Math.floor((now - endMs) / (1000 * 60 * 60 * 24));
    humanDiffText = `Berakhir ${diffDays === 0 ? 'hari ini' : `${diffDays} hari lalu`}`;
    daysRemaining = 0;
  } else {
    percentage = Math.round(((now - startMs) / (endMs - startMs)) * 100);
    const diffDays = Math.ceil((endMs - now) / (1000 * 60 * 60 * 24));
    humanDiffText = `Tersisa ${diffDays} hari lagi`;
    daysRemaining = diffDays;
  }

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    status: windowStatus.status,
    humanDiffText,
    totalDurationDays,
    daysRemaining,
    startDateFormatted,
    endDateFormatted,
  };
}

export interface MetricsTelemetry {
  totalBudget: number;
  avgBudgetPerNeed: number;
  avgBudgetFormatted: string;
  needCount: number;
  approvedCount: number;
  priorityCount: number;
  pendingCount: number;
  approvalRate: number;
  priorityRate: number;
  pendingRate: number;
}

export function getMetricsTelemetry(group: NeedGroup): MetricsTelemetry {
  const totalBudget = Number(group.total_budget) || 0;
  const needCount = group.need_count || 0;
  const approvedCount = group.approved_count || 0;
  const priorityCount = group.priority_count || 0;
  const pendingCount = Math.max(0, needCount - approvedCount);

  const avgBudgetPerNeed = needCount > 0 ? totalBudget / needCount : 0;
  const approvalRate =
    needCount > 0 ? Math.round((approvedCount / needCount) * 100) : 0;
  const priorityRate =
    needCount > 0 ? Math.round((priorityCount / needCount) * 100) : 0;
  const pendingRate =
    needCount > 0 ? Math.round((pendingCount / needCount) * 100) : 0;

  return {
    totalBudget,
    avgBudgetPerNeed,
    avgBudgetFormatted:
      avgBudgetPerNeed > 0 ? formatCompactIDR(avgBudgetPerNeed) : 'Rp 0',
    needCount,
    approvedCount,
    priorityCount,
    pendingCount,
    approvalRate,
    priorityRate,
    pendingRate,
  };
}

export function getGroupActions(
  group: NeedGroup,
  onEdit: (group: NeedGroup) => void,
  onDelete: (group: NeedGroup) => void,
  hasPermission: (permission: string) => boolean,
  onRollover?: (group: NeedGroup) => void,
): (ActionItem | 'separator')[] {
  const actions: (ActionItem | 'separator')[] = [];

  if (hasPermission('update need-groups')) {
    actions.push({
      label: 'Kelola Checklist',
      icon: RiListCheck3,
      href: groupRoutes.checklists.index.url({ need_group: group.id }),
    });
  }

  if (onRollover && hasPermission('update need-groups')) {
    actions.push({
      label: 'Tarik Usulan Lama',
      icon: RiHistoryLine,
      onClick: () => onRollover(group),
    });
  }

  if (hasPermission('update need-groups')) {
    actions.push({
      label: 'Edit Kelompok',
      icon: RiEdit2Line,
      onClick: () => onEdit(group),
    });
  }

  if (hasPermission('delete need-groups')) {
    actions.push('separator');
    actions.push({
      label: 'Hapus Kelompok',
      icon: RiDeleteBinLine,
      onClick: () => onDelete(group),
      variant: 'destructive',
    });
  }

  return actions;
}
