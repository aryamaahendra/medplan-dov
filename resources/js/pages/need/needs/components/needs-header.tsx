import {
  RiClipboardLine,
  RiMoreFill,
  RiFileDownloadLine,
  RiEdit2Line,
  RiAddLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
} from '@remixicon/react';

import needGroupChecklistActions from '@/actions/App/Http/Controllers/Need/NeedGroupChecklistController';
import { ActionDropdown } from '@/components/action-dropdown';
import type { ActionItem } from '@/components/action-dropdown';
import { SubmissionWindowBadge } from '@/components/badges';
import { Button } from '@/components/ui/button';
import type { NeedGroup } from '@/features/need-group/types/need-group.types';
import {
  getSubmissionStatus,
  getTimelineTelemetry,
} from '@/features/need-group/utils/need-group-helpers';
import { usePermission } from '@/hooks/use-permission';
import { formatDateTime, formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface NeedsHeaderProps {
  currentGroup: NeedGroup;
  onCreate: () => void;
  onExport: () => void;
  onEditGroup?: () => void;
  onDeleteGroup?: () => void;
}

export function NeedsHeader({
  currentGroup,
  onCreate,
  onExport,
  onEditGroup,
  onDeleteGroup,
}: NeedsHeaderProps) {
  const { hasPermission, hasAnyPermission } = usePermission();
  const windowStatus = getSubmissionStatus(currentGroup);
  const timeline = getTimelineTelemetry(currentGroup);
  const totalBudget = Number(currentGroup.total_budget) || 0;

  const groupActions: (ActionItem | 'separator')[] = [];

  if (hasPermission('update need-groups')) {
    groupActions.push({
      label: 'Edit',
      icon: RiEdit2Line,
      onClick: onEditGroup,
    });
    groupActions.push({
      label: 'Checklist',
      icon: RiClipboardLine,
      href: needGroupChecklistActions.index.url({
        need_group: currentGroup.id,
      }),
    });
  }

  groupActions.push({
    label: 'Export Excel',
    icon: RiFileDownloadLine,
    onClick: onExport,
  });

  if (hasPermission('delete need-groups')) {
    if (groupActions.length > 0) {
      groupActions.push('separator');
    }

    groupActions.push({
      label: 'Hapus',
      icon: RiDeleteBinLine,
      onClick: onDeleteGroup,
      variant: 'destructive',
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-foreground">
            {currentGroup.name}
          </h1>
          <SubmissionWindowBadge status={windowStatus.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>Tahun Anggaran {currentGroup.year}</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1">
            <RiMoneyDollarCircleLine className="size-3.5 shrink-0 text-muted-foreground" />
            <span>Total Anggaran:</span>
            <strong className="font-mono font-bold text-foreground">
              {formatIDR(totalBudget)}
            </strong>
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1">
            <RiTimeLine className="size-3.5 shrink-0 text-muted-foreground" />
            {currentGroup.submission_end_at ? (
              <span>
                Batas Pengajuan:{' '}
                <strong className="font-medium text-foreground">
                  {formatDateTime(currentGroup.submission_end_at)}
                </strong>
                {timeline.daysRemaining !== null && (
                  <span
                    className={cn(
                      'text-xss!',
                      timeline.status === 'closed'
                        ? 'text-muted-foreground'
                        : timeline.daysRemaining <= 3
                          ? 'font-semibold text-destructive'
                          : timeline.daysRemaining <= 7
                            ? 'font-medium text-warning-foreground dark:text-warning'
                            : 'text-muted-foreground',
                    )}
                  >
                    {'  ('}
                    {timeline.humanDiffText}
                    {')'}
                  </span>
                )}
              </span>
            ) : (
              <span>Batas Pengajuan: Tanpa Batas Waktu</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-start">
        {groupActions.length > 0 && (
          <ActionDropdown
            trigger={
              <Button variant={'outline'} size={'icon'}>
                <RiMoreFill />
              </Button>
            }
            actions={groupActions}
          />
        )}

        {hasAnyPermission([
          'create needs',
          'create descendant needs',
          'create any needs',
        ]) && (
          <Button onClick={onCreate}>
            <RiAddLine data-icon="inline-start" />
            Tambah Usulan
          </Button>
        )}
      </div>
    </div>
  );
}
