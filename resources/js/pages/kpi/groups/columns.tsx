import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Eye, PencilLine, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import type { ActionItem } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Badge } from '@/components/ui/badge';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup } from '@/types';

export const getColumns = (
  onEdit: (group: KpiGroup) => void,
  onDelete: (group: KpiGroup) => void,
  onActivate: (group: KpiGroup) => void,
  isActivating: boolean,
  hasPermission: (permission: string) => boolean,
): ColumnDef<KpiGroup>[] => [
  getIndexColumn(),
  {
    accessorKey: 'name',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Nama Periode KPI" />
    ),
    meta: { cellClassName: 'font-medium' },
  },
  {
    id: 'period',
    header: 'Periode',
    cell: ({ row }) => `${row.original.start_year} - ${row.original.end_year}`,
    meta: { cellClassName: 'font-mono w-[100px]' },
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
    meta: { cellClassName: 'font-mono w-[120px]' },
  },
  {
    id: 'actions',
    meta: { cellClassName: 'w-1' },
    cell: ({ row }) => {
      const group = row.original;

      const actions: (ActionItem | 'separator')[] = [
        {
          label: 'Detail',
          icon: Eye,
          href: groupRoutes.show.url({ group: group.id }),
        },
      ];

      if (!group.is_active && hasPermission('update kpi-groups')) {
        actions.push({
          label: isActivating ? 'Mengaktifkan...' : 'Aktifkan',
          icon: CheckCircle2,
          onClick: () => onActivate(group),
          disabled: isActivating,
        });
      }

      if (hasPermission('update kpi-groups')) {
        actions.push({
          label: 'Edit',
          icon: PencilLine,
          onClick: () => onEdit(group),
        });
      }

      if (hasPermission('delete kpi-groups')) {
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
