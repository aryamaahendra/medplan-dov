import type { ColumnDef } from '@tanstack/react-table';
import { ListChecks, PencilLine, Trash2 } from 'lucide-react';
import type { ActionItem } from '@/components/action-dropdown';
import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Badge } from '@/components/ui/badge';
import { formatIDR } from '@/lib/formatters';
import groupRoutes from '@/routes/need-groups';

export interface NeedGroup {
  id: number;
  name: string;
  description: string | null;
  year: number;
  is_active: boolean;
  need_count: number;
  total_budget: number | null;
  approved_count: number;
  priority_count: number;
  created_at: string;
}

export const getColumns = (
  onEdit: (group: NeedGroup) => void,
  onDelete: (group: NeedGroup) => void,
  hasPermission: (permission: string) => boolean,
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
      <DataTableColumnHeader column={column} title="Usulan" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue('need_count')} Item</Badge>
    ),
  },
  {
    accessorKey: 'approved_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Disetujui" />
    ),
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
      >
        {row.getValue('approved_count')} Item
      </Badge>
    ),
  },
  {
    accessorKey: 'priority_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioritas" />
    ),
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="border-amber-600/20 bg-amber-600/5 text-amber-600"
      >
        {row.getValue('priority_count')} Item
      </Badge>
    ),
  },
  {
    accessorKey: 'total_budget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Anggaran" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total_budget') || '0');

      return <div className="font-medium">{formatIDR(amount)}</div>;
    },
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

      const actions: (ActionItem | 'separator')[] = [
        {
          label: 'Kelola Checklist',
          icon: ListChecks,
          href: groupRoutes.checklists.index.url({ need_group: group.id }),
        },
      ];

      if (hasPermission('update need-groups')) {
        actions.push({
          label: 'Edit',
          icon: PencilLine,
          onClick: () => onEdit(group),
        });
      }

      if (hasPermission('delete need-groups')) {
        actions.push('separator');
        actions.push({
          label: 'Hapus',
          icon: Trash2,
          onClick: () => onDelete(group),
          variant: 'destructive',
        });
      }

      return <ActionDropdown actions={actions} />;
    },
  },
];
