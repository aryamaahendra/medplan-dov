import { RiEyeLine, RiEdit2Line, RiDeleteBinLine } from '@remixicon/react';
import type { ColumnDef } from '@tanstack/react-table';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatters';
import renstraRoutes from '@/routes/renstras';
import type { Renstra } from '@/types';

export const getColumns = (
  onEdit: (renstra: Renstra) => void,
  onDelete: (renstra: Renstra) => void,
  hasPermission: (permission: string) => boolean,
): ColumnDef<Renstra>[] => [
  getIndexColumn(),
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
    cell: ({ row }) => formatDate(row.original.created_at),
    meta: { cellClassName: 'font-mono text-xs w-[120px]' },
  },
  {
    id: 'actions',
    meta: { cellClassName: 'w-1' },
    cell: ({ row }) => {
      const renstra = row.original;

      const actions: any[] = [
        {
          label: 'Lihat',
          icon: RiEyeLine,
          href: renstraRoutes.show.url({ renstra: renstra.id }),
        },
      ];

      if (hasPermission('update renstras')) {
        actions.push({
          label: 'Edit',
          icon: RiEdit2Line,
          onClick: () => onEdit(renstra),
        });
      }

      if (hasPermission('delete renstras')) {
        actions.push('separator');
        actions.push({
          label: 'Hapus',
          icon: RiDeleteBinLine,
          onClick: () => onDelete(renstra),
          variant: 'destructive',
        });
      }

      return <ActionDropdown actions={actions} />;
    },
  },
];
