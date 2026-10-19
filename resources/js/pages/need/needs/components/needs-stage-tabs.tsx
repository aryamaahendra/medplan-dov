import {
  RiInbox2Fill,
  RiTimeFill,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiLockFill,
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

interface TabConfig {
  key: StageTabKey;
  label: string;
  count: number;
  icon: React.ElementType;
  description: string;
  accentBg: string;
  accentText: string;
  accentRing: string;
  activeBorder: string;
  dotColor: string;
}

export function NeedsStageTabs({
  currentTab,
  onTabChange,
  counts,
}: NeedsStageTabsProps) {
  const tabs: TabConfig[] = [
    {
      key: 'all',
      label: 'Semua',
      count: counts.all,
      icon: RiInbox2Fill,
      description: 'Total usulan',
      accentBg: 'bg-primary/5',
      accentText: 'text-primary-foreground',
      accentRing: 'ring-primary/20',
      activeBorder: 'border-primary',
      dotColor: 'bg-primary',
    },
    {
      key: 'draft',
      label: 'Draft',
      count: counts.draft,
      icon: RiTimeFill,
      description: 'Usulan baru',
      accentBg: 'bg-muted/50',
      accentText: 'text-muted-foreground',
      accentRing: 'ring-muted-foreground/20',
      activeBorder: 'border-muted-foreground',
      dotColor: 'bg-muted-foreground',
    },
    {
      key: 'under_review',
      label: 'Menunggu Review',
      count: counts.under_review,
      icon: RiTimeFill,
      description: 'Menunggu telaah',
      accentBg: 'bg-warning/10',
      accentText: 'text-warning-foreground dark:text-warning',
      accentRing: 'ring-warning/20',
      activeBorder: 'border-warning',
      dotColor: 'bg-warning',
    },
    {
      key: 'approved',
      label: 'Disetujui',
      count: counts.approved,
      icon: RiCheckboxCircleFill,
      description: 'Disetujui direktur',
      accentBg: 'bg-success/10',
      accentText: 'text-success-foreground dark:text-success',
      accentRing: 'ring-success/20',
      activeBorder: 'border-success',
      dotColor: 'bg-success',
    },
    {
      key: 'rejected',
      label: 'Ditolak',
      count: counts.rejected,
      icon: RiCloseCircleFill,
      description: 'Perlu perbaikan',
      accentBg: 'bg-destructive/10',
      accentText: 'text-destructive',
      accentRing: 'ring-destructive/20',
      activeBorder: 'border-destructive',
      dotColor: 'bg-destructive',
    },
    {
      key: 'locked',
      label: 'Terkunci',
      count: counts.locked,
      icon: RiLockFill,
      description: 'Data final',
      accentBg: 'bg-info/10',
      accentText: 'text-info',
      accentRing: 'ring-info/20',
      activeBorder: 'border-info',
      dotColor: 'bg-info',
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter tahapan usulan"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'group relative flex flex-col justify-between rounded-xl border bg-card p-3.5 text-left transition-all',
              'hover:border-foreground/25 hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive
                ? cn(
                    'shadow-xs ring-2',
                    tab.activeBorder,
                    tab.accentBg,
                    tab.accentRing,
                  )
                : 'border-border/80',
            )}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className={cn('size-2 shrink-0 rounded-full', tab.dotColor)}
                />
                <span
                  className={cn(
                    'truncate text-xs font-semibold transition-colors',
                    isActive ? tab.accentText : 'text-foreground/90',
                  )}
                >
                  {tab.label}
                </span>
              </div>
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors',
                  isActive
                    ? tab.accentText
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
            </div>

            <div className="mt-2.5 flex items-baseline justify-between gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {tab.count}
              </span>
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 font-mono text-xss font-medium',
                  isActive
                    ? 'bg-background/80 font-semibold shadow-2xs'
                    : 'text-muted-foreground',
                )}
              >
                {counts.all > 0
                  ? `${Math.round((tab.count / counts.all) * 100)}%`
                  : '0%'}
              </span>
            </div>

            <div className="mt-1 truncate text-xss text-muted-foreground">
              {tab.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
