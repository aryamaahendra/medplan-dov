import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: '#',
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: (props) => <DataTableColumnHeader {...props} title="Name" />,
  },
  {
    accessorKey: 'email',
    header: (props) => <DataTableColumnHeader {...props} title="Email" />,
  },
  {
    accessorKey: 'created_at',
    header: (props) => <DataTableColumnHeader {...props} title="Joined" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
  },
];
