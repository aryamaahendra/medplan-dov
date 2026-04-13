import type { ColumnDef } from '@tanstack/react-table';
import { PencilLine, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';

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
  getIndexColumn(),
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
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
              icon: PencilLine,
              onClick: () => onEdit(unit),
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(unit),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
