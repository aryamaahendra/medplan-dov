import type { ColumnDef } from '@tanstack/react-table';
import { PencilLine, Trash2 } from 'lucide-react';
import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Badge } from '@/components/ui/badge';

export interface ChecklistQuestion {
  id: number;
  question: string;
  description: string | null;
  is_active: boolean;
  order_column: number;
  created_at: string;
}

export const getColumns = (
  onEdit: (question: ChecklistQuestion) => void,
  onDelete: (question: ChecklistQuestion) => void,
): ColumnDef<ChecklistQuestion>[] => [
  getIndexColumn('#', 'w-1 text-center'),
  {
    accessorKey: 'question',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pertanyaan" />
    ),
    cell: ({ row }) => (
      <p
        className="max-w-[400px] font-medium whitespace-normal"
        title={row.getValue('question')}
      >
        {row.getValue('question')}
      </p>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deskripsi" />
    ),
    cell: ({ row }) => (
      <p
        className="line-clamp-2 max-w-[400px] whitespace-normal text-muted-foreground"
        title={row.getValue('description')}
      >
        {row.getValue('description')}
      </p>
    ),
  },
  {
    accessorKey: 'order_column',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Urutan" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('order_column')}</div>
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
      const question = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
              icon: PencilLine,
              onClick: () => onEdit(question),
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(question),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
