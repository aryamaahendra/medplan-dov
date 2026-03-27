import type { Column } from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
} from 'lucide-react';

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
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {direction === 'desc' ? (
              <ArrowDownIcon className="ml-1 size-3.5" />
            ) : direction === 'asc' ? (
              <ArrowUpIcon className="ml-1 size-3.5" />
            ) : (
              <ChevronsUpDownIcon className="ml-1 size-3.5" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onSort?.(column.id, 'asc')}>
            <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort?.(column.id, 'desc')}>
            <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOffIcon className="mr-2 size-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
