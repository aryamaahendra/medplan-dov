import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export const getColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
): ColumnDef<User>[] => [
  {
    accessorKey: 'id',
    header: '#',
    enableSorting: false,
    meta: {
      cellClassName: 'font-mono text-muted-foreground w-[50px]',
    },
  },
  {
    accessorKey: 'name',
    header: (props) => <DataTableColumnHeader {...props} title="Name" />,
    meta: {
      cellClassName: (row) =>
        row.original.id === 1 ? 'font-bold text-primary' : '',
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only font-normal">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-sm/relaxed"
              onClick={() => onEdit(user)}
            >
              <PencilLine />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(user)}
            >
              <Trash2 />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
