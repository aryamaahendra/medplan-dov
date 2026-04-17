import type { ColumnDef } from '@tanstack/react-table';
import { PencilLine, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';

export interface User {
  id: number;
  name: string;
  nip?: string;
  email: string;
  created_at: string;
}

export const getColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
): ColumnDef<User>[] => [
  getIndexColumn(),
  {
    accessorKey: 'name',
    header: (props) => <DataTableColumnHeader {...props} title="Name" />,
  },
  {
    accessorKey: 'nip',
    header: (props) => <DataTableColumnHeader {...props} title="NIP" />,
    meta: {
      cellClassName: 'font-mono text-xs',
    },
  },
  {
    accessorKey: 'email',
    header: (props) => <DataTableColumnHeader {...props} title="Email" />,
    meta: {
      cellClassName: 'text-blue-500 font-medium',
    },
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
  {
    id: 'actions',
    meta: {
      cellClassName: 'w-1',
    },
    cell: ({ row }) => {
      const user = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Edit User',
              icon: PencilLine,
              onClick: () => onEdit(user),
            },
            'separator',
            {
              label: 'Delete User',
              icon: Trash2,
              onClick: () => onDelete(user),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
