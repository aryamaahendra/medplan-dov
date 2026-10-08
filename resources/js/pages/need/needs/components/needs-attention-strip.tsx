import {
  RiErrorWarningLine,
  RiTimeLine,
  RiCalendarLine,
  RiChat1Line,
  RiStarFill,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

export type AttentionFilterKey =
  | 'low_checklist'
  | 'revision_closing'
  | 'submission_closing'
  | 'has_notes'
  | 'priority_only';

interface NeedsAttentionStripProps {
  needs: Need[];
  activeFilter: AttentionFilterKey | null;
  onFilterChange: (filter: AttentionFilterKey | null) => void;
}

export function NeedsAttentionStrip({
  needs,
  activeFilter,
  onFilterChange,
}: NeedsAttentionStripProps) {
  // Compute attention counts from current page data
  const now = new Date().getTime();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  const lowChecklistCount = needs.filter((n) => {
    const pct = Number(n.checklist_percentage || 0);

    return pct > 0 && pct < 85;
  }).length;

  const revisionClosingCount = needs.filter((n) => {
    if (!n.unlocked_until) {
      return false;
    }

    const diff = new Date(n.unlocked_until).getTime() - now;

    return diff > 0 && diff <= threeDaysMs;
  }).length;

  const submissionClosingCount = needs.filter((n) => {
    if (!n.group_submission_end_at) {
      return false;
    }

    const diff = new Date(n.group_submission_end_at).getTime() - now;

    return diff > 0 && diff <= threeDaysMs;
  }).length;

  const hasNotesCount = needs.filter((n) => !!n.notes).length;
  const priorityCount = needs.filter((n) => !!n.is_priority).length;

  const chips: Array<{
    key: AttentionFilterKey;
    label: string;
    count: number;
    icon: React.ElementType;
    badgeVariant: 'destructive' | 'secondary' | 'outline';
  }> = [
    {
      key: 'low_checklist',
      label: 'Checklist < 85%',
      count: lowChecklistCount,
      icon: RiErrorWarningLine,
      badgeVariant: 'outline',
    },
    {
      key: 'revision_closing',
      label: 'Revisi Berakhir Segera',
      count: revisionClosingCount,
      icon: RiTimeLine,
      badgeVariant: 'outline',
    },
    {
      key: 'submission_closing',
      label: 'Periode Segera Ditutup',
      count: submissionClosingCount,
      icon: RiCalendarLine,
      badgeVariant: 'outline',
    },
    {
      key: 'has_notes',
      label: 'Catatan Direktur',
      count: hasNotesCount,
      icon: RiChat1Line,
      badgeVariant: 'outline',
    },
    {
      key: 'priority_only',
      label: 'Prioritas Saja',
      count: priorityCount,
      icon: RiStarFill,
      badgeVariant: 'destructive',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 px-3.5 py-2 text-xs">
      <span className="mr-1 font-medium text-muted-foreground">Perhatian:</span>

      {chips.map((chip) => {
        const Icon = chip.icon;
        const isActive = activeFilter === chip.key;

        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onFilterChange(isActive ? null : chip.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
              isActive
                ? 'border-primary bg-primary font-semibold text-primary-foreground shadow-xs'
                : 'border-border/80 bg-background text-foreground/80 hover:bg-accent/40',
            )}
          >
            <Icon className="size-3 shrink-0" />
            <span>{chip.label}</span>
            <span
              className={cn(
                'py-0.2 ml-0.5 rounded-full px-1.5 font-mono text-[10px]',
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {chip.count}
            </span>
          </button>
        );
      })}

      {activeFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => onFilterChange(null)}
        >
          Reset Filter Cepat
        </Button>
      )}
    </div>
  );
}
