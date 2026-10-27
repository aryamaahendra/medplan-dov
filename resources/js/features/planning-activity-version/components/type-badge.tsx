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
      'border-destructive/30 bg-destructive/15 text-destructive dark:bg-destructive/20';
  } else if (type === 'program') {
    badgeClass =
      'border-info/30 bg-info/15 text-info dark:bg-info/20 dark:text-info';
  } else if (type === 'kegiatan') {
    badgeClass =
      'border-warning/30 bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning';
  } else if (type === 'subkegiatan') {
    badgeClass =
      'border-border/70 bg-muted/80 text-foreground dark:bg-muted/50';
  } else if (type === 'output') {
    if (parentType === 'subkegiatan') {
      variant = 'outline';
    } else if (parentType === 'kegiatan') {
      badgeClass =
        'border-border/70 bg-muted/60 text-foreground dark:bg-muted/40';
    }
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        'border px-2 tracking-wider uppercase',
        badgeClass,
        className,
      )}
    >
      {activity.type}
    </Badge>
  );
}
