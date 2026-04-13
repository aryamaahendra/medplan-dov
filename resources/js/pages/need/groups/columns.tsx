import type { ColumnDef } from '@tanstack/react-table';
import { ClipboardList, PencilLine, Trash2 } from 'lucide-react';
import needGroupChecklistActions from '@/actions/App/Http/Controllers/Need/NeedGroupChecklistController';
import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Badge } from '@/components/ui/badge';

export interface NeedGroup {
  id: number;
  name: string;
  description: string | null;
  year: number;
  is_active: boolean;
  need_count: number;
  created_at: string;
}

export const getColumns = (
  onEdit: (group: NeedGroup) => void,
  onDelete: (group: NeedGroup) => void,
): ColumnDef<NeedGroup>[] => [
  getIndexColumn('#', 'w-1 text-center'),
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Kelompok" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'year',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tahun" />
    ),
  },
  {
    accessorKey: 'need_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah Usulan" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue('need_count')}</Badge>
    ),
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
        {row.getValue('is_active') ? 'Aktif' : 'Non-aktif'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    meta: { cellClassName: 'w-1' },
    cell: ({ row }) => {
      const group = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
              icon: PencilLine,
              onClick: () => onEdit(group),
            },
            {
              label: 'Checklist',
              icon: ClipboardList,
              href: needGroupChecklistActions.index.url({
                need_group: group.id,
              }),
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(group),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
