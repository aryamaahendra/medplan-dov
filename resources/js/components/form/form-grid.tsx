import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridDensity = 'compact' | 'default' | 'comfortable' | 'dense';

const colsClassMap: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
  7: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-7',
  8: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-8',
  9: 'grid-cols-3 sm:grid-cols-5 md:grid-cols-9',
  10: 'grid-cols-2 sm:grid-cols-5 md:grid-cols-10',
  11: 'grid-cols-2 sm:grid-cols-6 md:grid-cols-11',
  12: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
};

const densityGapMap: Record<GridDensity, string> = {
  compact: 'gap-2',
  default: 'gap-4',
  comfortable: 'gap-6',
  dense: 'gap-1.5',
};

export interface FormGridProps extends ComponentProps<'div'> {
  cols?: GridCols;
  density?: GridDensity;
  children: ReactNode;
}

export function FormGrid({
  cols = 1,
  density = 'default',
  className,
  children,
  ...props
}: FormGridProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        colsClassMap[cols] || 'grid-cols-1',
        densityGapMap[density] || 'gap-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';

const colSpanClassMap: Record<ColSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-1 sm:col-span-2',
  3: 'col-span-1 sm:col-span-3',
  4: 'col-span-1 sm:col-span-4',
  5: 'col-span-1 sm:col-span-5',
  6: 'col-span-1 sm:col-span-6',
  7: 'col-span-1 sm:col-span-7',
  8: 'col-span-1 sm:col-span-8',
  9: 'col-span-1 sm:col-span-9',
  10: 'col-span-1 sm:col-span-10',
  11: 'col-span-1 sm:col-span-11',
  12: 'col-span-full',
  full: 'col-span-full',
};

export interface FormColProps extends ComponentProps<'div'> {
  span?: ColSpan;
  children: ReactNode;
}

export function FormCol({
  span = 1,
  className,
  children,
  ...props
}: FormColProps) {
  return (
    <div
      className={cn(colSpanClassMap[span] || 'col-span-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}
