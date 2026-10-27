import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiExpandUpDownLine,
  RiEyeOffLine,
} from '@remixicon/react';
import type { Column } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  /** Called when user clicks a sort option */
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  /** Current sort column from URL params */
  currentSort?: string;
  /** Current direction from URL params */
  currentDirection?: 'asc' | 'desc' | '';
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  onSort,
  currentSort,
  currentDirection,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isCurrentSort = currentSort === column.id;
  const direction = isCurrentSort ? currentDirection : undefined;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 data-open:bg-accent"
            />
          }
        >
          <span>{title}</span>
          {direction === 'desc' ? (
            <RiArrowDownLine data-icon="inline-end" />
          ) : direction === 'asc' ? (
            <RiArrowUpLine data-icon="inline-end" />
          ) : (
            <RiExpandUpDownLine data-icon="inline-end" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onSort?.(column.id, 'asc')}>
            <RiArrowUpLine />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort?.(column.id, 'desc')}>
            <RiArrowDownLine />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <RiEyeOffLine />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
