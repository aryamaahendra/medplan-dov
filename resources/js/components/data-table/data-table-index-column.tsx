import type { ColumnDef, RowData } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/table';

export function getIndexColumn<TData extends RowData>(
  header: string = '#',
  className?: string,
): ColumnDef<TData> {
  return {
    id: 'index',
    header,
    cell: ({ row, table }) => {
      const meta = table.options.meta as { pagination?: PaginationMeta };
      const pagination = meta?.pagination;

      if (!pagination) {
        return row.index + 1;
      }

      return (
        (pagination.current_page - 1) * pagination.per_page + row.index + 1
      );
    },
    enableSorting: false,
    enableHiding: false,
    meta: {
      cellClassName: cn('w-[50px] font-mono text-muted-foreground', className),
    },
  };
}
