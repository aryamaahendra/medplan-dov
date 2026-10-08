import { cva  } from 'class-variance-authority';
import type {VariantProps} from 'class-variance-authority';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const statusBadgeVariants = cva('font-medium transition-colors', {
  variants: {
    status: {
      success:
        'border-transparent bg-success/15 text-success-foreground dark:bg-success/20 dark:text-success',
      warning:
        'border-transparent bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning',
      info: 'border-transparent bg-info/15 text-info dark:bg-info/20 dark:text-info',
      destructive:
        'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',
      danger:
        'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',
      muted: 'border-transparent bg-muted text-muted-foreground',
    },
  },
  defaultVariants: {
    status: 'muted',
  },
});

export interface StatusBadgeProps
  extends
    Omit<React.ComponentProps<typeof Badge>, 'variant'>,
    VariantProps<typeof statusBadgeVariants> {
  variant?: React.ComponentProps<typeof Badge>['variant'];
}

/**
 * A non-primitive badge wrapper specifically for status indicators,
 * utilizing standardized semantic OKLCH color tokens without touching shadcn primitives.
 */
export function StatusBadge({
  status,
  className,
  variant = 'outline',
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    />
  );
}
