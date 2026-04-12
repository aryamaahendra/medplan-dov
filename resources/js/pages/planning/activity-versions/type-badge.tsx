import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PlanningActivityVersion } from '@/types/planning-version';

interface TypeBadgeProps {
  activity: PlanningActivityVersion;
  className?: string;
}

export function TypeBadge({ activity, className }: TypeBadgeProps) {
  if (!activity.type) {
    return null;
  }

  const type = activity.type.toLowerCase();
  const parentType = activity.parent?.type?.toLowerCase();

  let badgeClass = '';
  let variant: 'default' | 'outline' | 'secondary' = 'secondary';

  if (type === 'outcome') {
    badgeClass =
      'bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
  } else if (type === 'program') {
    badgeClass =
      'bg-purple-100/50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
  } else if (type === 'kegiatan') {
    badgeClass =
      'bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
  } else if (type === 'subkegiatan') {
    badgeClass =
      'bg-pink-100/50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800';
  } else if (type === 'output') {
    if (parentType === 'subkegiatan') {
      variant = 'outline';
    } else if (parentType === 'kegiatan') {
      badgeClass =
        'bg-fuchsia-100/20 text-fuchsia-500 border-fuchsia-300 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800';
    }
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        'h-auto border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
        badgeClass,
        className,
      )}
    >
      {activity.type}
    </Badge>
  );
}
