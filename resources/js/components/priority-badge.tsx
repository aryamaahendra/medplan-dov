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
      // Orange (Soft)
      customClasses =
        'bg-orange-50 text-orange-700 border-orange-200/50 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 px-2.5 py-0.5';
      break;
    case 'medium':
      // Blue (Soft)
      customClasses =
        'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-2.5 py-0.5';
      break;
    case 'low':
      // Gray (Soft)
      customClasses =
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 px-2.5 py-0.5';
      break;
    case 'urgent':
    case 'extreme':
      // Red (Soft)
      customClasses =
        'bg-red-50 text-red-700 border-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 px-2.5 py-0.5';
      break;
    case 'normal':
    case 'safe':
      // Green (Soft)
      customClasses =
        'bg-green-50 text-green-700 border-green-200/50 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 px-2.5 py-0.5';
      break;
    default:
      // Generic gray fallback
      customClasses =
        'bg-secondary/50 text-secondary-foreground border-transparent px-2.5 py-0.5';
  }

  const label = PRIORITY_LABELS[level] ?? level ?? fallback;

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full font-semibold', customClasses, className)}
      {...props}
    >
      {label}
    </Badge>
  );
}
