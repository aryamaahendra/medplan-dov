import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type * as React from 'react';

export type BadgeSemanticTone =
  'success' | 'warning' | 'info' | 'destructive' | 'muted';

export const domainBadgeVariants = cva(
  'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors select-none [&>svg]:pointer-events-none',
  {
    variants: {
      tone: {
        success:
          'border-success/30 bg-success/15 text-success-foreground dark:bg-success/20 dark:text-success',
        warning:
          'border-warning/30 bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning',
        info: 'border-info/30 bg-info/15 text-info dark:bg-info/20 dark:text-info',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20',
        muted:
          'border-border/60 bg-muted/60 text-muted-foreground dark:border-border/80 dark:bg-muted/40',
      },
      size: {
        sm: 'h-5 gap-1 rounded-full border px-2 py-0 text-[11px] [&>svg]:size-3!',
        default:
          'h-6 gap-1.5 rounded-full border px-2.5 py-0.5 text-xs [&>svg]:size-3.5!',
      },
    },
    defaultVariants: {
      tone: 'muted',
      size: 'sm',
    },
  },
);

export interface BaseDomainBadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof domainBadgeVariants> {
  showIcon?: boolean;
}
