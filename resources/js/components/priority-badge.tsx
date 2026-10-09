import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PriorityLevel = 'high' | 'medium' | 'low' | string;

interface PriorityBadgeProps extends React.ComponentProps<typeof Badge> {
  level: PriorityLevel;
  fallback?: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
  High: 'Tinggi',
  Medium: 'Sedang',
  Low: 'Rendah',
};

/**
 * A shared component for displaying priority-based badges with soft colors.
 */
export function PriorityBadge({
  level,
  className,
  fallback = '-',
  ...props
}: PriorityBadgeProps) {
  const normalizedLevel = level?.toLowerCase();

  let customClasses = '';

  switch (normalizedLevel) {
    case 'high':
      // Warning
      customClasses =
        'border-warning/30 bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning';
      break;
    case 'medium':
      // Info
      customClasses =
        'border-info/30 bg-info/15 text-info dark:bg-info/20 dark:text-info';
      break;
    case 'low':
      // Muted
      customClasses = 'border-transparent bg-muted text-muted-foreground';
      break;
    case 'urgent':
    case 'extreme':
      // Destructive
      customClasses =
        'border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20';
      break;
    case 'normal':
    case 'safe':
      // Success
      customClasses =
        'border-success/30 bg-success/15 text-success-foreground dark:bg-success/20 dark:text-success';
      break;
    default:
      // Generic fallback
      customClasses =
        'border-transparent bg-secondary text-secondary-foreground';
  }

  const label = PRIORITY_LABELS[level] ?? level ?? fallback;

  return (
    <Badge
      variant="outline"
      className={cn(customClasses, className)}
      {...props}
    >
      {label}
    </Badge>
  );
}
