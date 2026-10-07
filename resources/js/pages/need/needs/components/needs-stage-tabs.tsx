import {
  RiInboxLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiLockLine,
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import type { NeedWorkflowStage } from '@/types/need';

export type StageTabKey = 'all' | NeedWorkflowStage | 'locked';

interface NeedsStageTabsProps {
  currentTab: StageTabKey;
  onTabChange: (tab: StageTabKey) => void;
  counts: {
    all: number;
    draft: number;
    under_review: number;
    approved: number;
    rejected: number;
    locked: number;
  };
}

export function NeedsStageTabs({
  currentTab,
  onTabChange,
  counts,
}: NeedsStageTabsProps) {
  const tabs: Array<{
    key: StageTabKey;
    label: string;
    count: number;
    icon: React.ElementType;
  }> = [
    { key: 'all', label: 'Semua', count: counts.all, icon: RiInboxLine },
    { key: 'draft', label: 'Draft', count: counts.draft, icon: RiTimeLine },
    {
      key: 'under_review',
      label: 'Menunggu Review',
      count: counts.under_review,
      icon: RiTimeLine,
    },
    {
      key: 'approved',
      label: 'Disetujui',
      count: counts.approved,
      icon: RiCheckboxCircleLine,
    },
    {
      key: 'rejected',
      label: 'Ditolak',
      count: counts.rejected,
      icon: RiCloseCircleLine,
    },
    {
      key: 'locked',
      label: 'Terkunci',
      count: counts.locked,
      icon: RiLockLine,
    },
  ];

  return (
    <div className="flex w-full scrollbar-none items-center gap-1 overflow-x-auto border-b pb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'group flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-all sm:text-sm',
              isActive
                ? 'border-primary font-semibold text-foreground'
                : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'size-4 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            <span>{tab.label}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-mono text-xs',
                isActive
                  ? 'bg-primary/10 font-semibold text-primary dark:bg-primary/20'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
