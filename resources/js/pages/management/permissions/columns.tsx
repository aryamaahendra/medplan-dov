import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
}

export const columns: ColumnDef<Permission>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'guard_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guard Name" />
    ),
    cell: ({ row }) => <div>{row.getValue('guard_name')}</div>,
  },
];
