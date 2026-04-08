import type { ColumnDef } from '@tanstack/react-table';
import { Eye, PencilLine, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import renstraRoutes from '@/routes/renstras';
import type { Renstra } from '@/types';

export const getColumns = (
  onEdit: (renstra: Renstra) => void,
  onDelete: (renstra: Renstra) => void,
): ColumnDef<Renstra>[] => [
  {
    accessorKey: 'id',
    header: '#',
    enableSorting: false,
    meta: { cellClassName: 'font-mono text-muted-foreground w-[50px]' },
  },
  {
    accessorKey: 'name',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Nama Renstra" />
    ),
    meta: { cellClassName: 'font-medium' },
  },
  {
    id: 'period',
    header: 'Periode',
    cell: ({ row }) => `${row.original.year_start} - ${row.original.year_end}`,
    meta: { cellClassName: 'font-mono text-xs w-[100px]' },
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => (
      <div
        className="max-w-[300px] truncate text-muted-foreground"
        title={row.original.description ?? ''}
      >
        {row.original.description ?? '-'}
      </div>
    ),
  },
  {
    accessorKey: 'is_active',
    header: (props) => <DataTableColumnHeader {...props} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Aktif' : 'Tidak Aktif'}
      </Badge>
    ),
    meta: { cellClassName: 'w-[100px]' },
  },
  {
    accessorKey: 'created_at',
    header: (props) => <DataTableColumnHeader {...props} title="Dibuat Pada" />,
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString('id-ID'),
    meta: { cellClassName: 'font-mono text-xs w-[120px]' },
  },
  {
    id: 'actions',
    meta: { cellClassName: 'w-1' },
    cell: ({ row }) => {
      const renstra = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Lihat',
              icon: Eye,
              href: renstraRoutes.show.url({ renstra: renstra.id }),
            },
            {
              label: 'Edit',
              icon: PencilLine,
              onClick: () => onEdit(renstra),
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(renstra),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
