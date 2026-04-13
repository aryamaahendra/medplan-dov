import type { ColumnDef } from '@tanstack/react-table';
import { PencilLine, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Badge } from '@/components/ui/badge';

export interface NeedType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  order_column: number;
  created_at: string;
}

export const getColumns = (
  onEdit: (needType: NeedType) => void,
  onDelete: (needType: NeedType) => void,
): ColumnDef<NeedType>[] => [
  getIndexColumn(),
  {
    accessorKey: 'name',
    header: (props) => <DataTableColumnHeader {...props} title="Nama" />,
    meta: {
      cellClassName: 'font-medium',
    },
  },
  {
    accessorKey: 'code',
    header: (props) => <DataTableColumnHeader {...props} title="Kode" />,
    meta: {
      cellClassName: 'font-mono text-sm',
    },
  },
  {
    accessorKey: 'description',
    header: (props) => <DataTableColumnHeader {...props} title="Deskripsi" />,
    cell: ({ row }) => row.original.description || '-',
  },
  {
    accessorKey: 'is_active',
    header: (props) => <DataTableColumnHeader {...props} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Aktif' : 'Nonaktif'}
      </Badge>
    ),
  },
  {
    accessorKey: 'order_column',
    header: (props) => <DataTableColumnHeader {...props} title="Urutan" />,
    meta: {
      cellClassName: 'text-center',
    },
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
      const needType = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
              icon: PencilLine,
              onClick: () => onEdit(needType),
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(needType),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
