import { type ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import type { DataTableFilters } from '@/hooks/use-data-table';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export function getUserColumns(
  filters: DataTableFilters,
  onSort: (column: string, direction: 'asc' | 'desc') => void,
): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'id',
      header: '#',
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
          currentSort={filters.sort ?? ''}
          currentDirection={filters.direction ?? ''}
          onSort={onSort}
        />
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Email"
          currentSort={filters.sort ?? ''}
          currentDirection={filters.direction ?? ''}
          onSort={onSort}
        />
      ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Joined"
          currentSort={filters.sort ?? ''}
          currentDirection={filters.direction ?? ''}
          onSort={onSort}
        />
      ),
      cell: ({ row }) =>
        new Date(row.getValue('created_at')).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
  ];
}
