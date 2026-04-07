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

export interface OrganizationalUnit {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  parent?: OrganizationalUnit | null;
  created_at: string;
}

export const getColumns = (
  onEdit: (unit: OrganizationalUnit) => void,
  onDelete: (unit: OrganizationalUnit) => void,
): ColumnDef<OrganizationalUnit>[] => [
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
    header: (props) => <DataTableColumnHeader {...props} title="Nama Unit" />,
    meta: {
      cellClassName: 'font-medium',
    },
  },
  {
    accessorKey: 'code',
    header: (props) => <DataTableColumnHeader {...props} title="Kode Resmi" />,
    meta: {
      cellClassName: 'font-mono text-sm',
    },
  },
  {
    accessorKey: 'parent.name',
    header: (props) => <DataTableColumnHeader {...props} title="Unit Induk" />,
    cell: ({ row }) => row.original.parent?.name || '-',
  },
  {
    accessorKey: 'created_at',
    header: (props) => <DataTableColumnHeader {...props} title="Dibuat" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));

      return date.toLocaleDateString('id-ID', {
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
      const unit = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only font-normal">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-sm/relaxed"
              onClick={() => onEdit(unit)}
            >
              <PencilLine />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(unit)}
            >
              <Trash2 />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
