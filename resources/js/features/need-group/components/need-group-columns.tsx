import {
  RiListCheck3,
  RiEdit2Line,
  RiDeleteBinLine,
  RiHistoryLine,
} from '@remixicon/react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ActionItem } from '@/components/action-dropdown';
import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatIDR } from '@/lib/formatters';
import groupRoutes from '@/routes/need-groups';
import type { NeedGroup } from '../types/need-group.types';

export const getNeedGroupColumns = (
  onEdit: (group: NeedGroup) => void,
  onDelete: (group: NeedGroup) => void,
  hasPermission: (permission: string) => boolean,
  onRollover?: (group: NeedGroup) => void,
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
      <StatusBadge status="success">
        {row.getValue('approved_count')} Item
      </StatusBadge>
    ),
  },
  {
    accessorKey: 'priority_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioritas" />
    ),
    cell: ({ row }) => (
      <StatusBadge status="warning">
        {row.getValue('priority_count')} Item
      </StatusBadge>
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
    accessorKey: 'submission_start_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mulai Pengajuan" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs whitespace-nowrap">
        {formatDateTime(row.getValue('submission_start_at'))}
      </div>
    ),
  },
  {
    accessorKey: 'submission_end_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batas Pengajuan" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs whitespace-nowrap">
        {formatDateTime(row.getValue('submission_end_at'))}
      </div>
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

      const actions: (ActionItem | 'separator')[] = [];

      if (hasPermission('update need-groups')) {
        actions.push({
          label: 'Kelola Checklist',
          icon: RiListCheck3,
          href: groupRoutes.checklists.index.url({ need_group: group.id }),
        });
      }

      if (onRollover && hasPermission('update need-groups')) {
        actions.push({
          label: 'Tarik Usulan Lama',
          icon: RiHistoryLine,
          onClick: () => onRollover(group),
        });
      }

      if (hasPermission('update need-groups')) {
        actions.push({
          label: 'Edit',
          icon: RiEdit2Line,
          onClick: () => onEdit(group),
        });
      }

      if (hasPermission('delete need-groups')) {
        actions.push('separator');
        actions.push({
          label: 'Hapus',
          icon: RiDeleteBinLine,
          onClick: () => onDelete(group),
          variant: 'destructive',
        });
      }

      return <ActionDropdown actions={actions} />;
    },
  },
];
