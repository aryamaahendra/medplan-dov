import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  FileText,
  Paperclip,
  PencilLine,
  Signature,
  Trash2,
  XCircle,
} from 'lucide-react';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { PriorityBadge } from '@/components/priority-badge';
import { Badge } from '@/components/ui/badge';
import { STATUS_ICONS, STATUS_LABELS, STATUS_VARIANTS } from '@/constants/need';
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

export const getColumns = (
  onEdit: (need: Need) => void,
  onDelete: (need: Need) => void,
  onReview: (need: Need) => void,
  hasPermission: (permission: string) => boolean,
): ColumnDef<Need>[] => [
  getIndexColumn(),
  {
    accessorKey: 'year',
    header: (props) => <DataTableColumnHeader {...props} title="Tahun" />,
    meta: { cellClassName: 'font-mono text-center w-[70px]' },
  },
  {
    accessorKey: 'title',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Usulan Kebutuhan" />
    ),
    meta: { cellClassName: 'font-medium' },
    cell: ({ row }) => (
      <p className="w-[36ch] whitespace-normal">{row.original.title}</p>
    ),
  },
  {
    id: 'organizational_unit',
    header: 'Unit Kerja',
    cell: ({ row }) => {
      const unit = row.original.organizational_unit;

      if (!unit) {
        return '-';
      }

      const path: string[] = [unit.name];
      let current = unit.parents_recursive;

      while (current) {
        path.unshift(current.name);
        current = current.parents_recursive;
      }

      if (path.length <= 1) {
        return path[0];
      }

      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">
            {path.slice(0, -1).join(' / ')}
          </span>
          <span className="font-medium">{path[path.length - 1]}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'need_type',
    header: 'Kategori Kebutuhan',
    cell: ({ row }) => row.original.need_type?.name ?? '-',
    enableSorting: false,
  },
  {
    id: 'volume_unit',
    header: 'Volume',
    cell: ({ row }) =>
      `${Number(row.original.volume).toLocaleString('id-ID')} ${row.original.unit}`,
    enableSorting: false,
    meta: { cellClassName: 'tabular-nums font-mono' },
  },
  {
    accessorKey: 'total_price',
    header: (props) => <DataTableColumnHeader {...props} title="Total Harga" />,
    cell: ({ row }) => formatIDR(row.original.total_price),
    meta: { cellClassName: 'tabular-nums font-mono' },
  },
  {
    accessorKey: 'urgency',
    header: (props) => <DataTableColumnHeader {...props} title="Urgensi" />,
    cell: ({ row }) => <PriorityBadge level={row.original.urgency} />,
  },
  {
    accessorKey: 'impact',
    header: (props) => <DataTableColumnHeader {...props} title="Dampak" />,
    cell: ({ row }) => <PriorityBadge level={row.original.impact} />,
  },
  {
    accessorKey: 'is_priority',
    header: (props) => <DataTableColumnHeader {...props} title="Prioritas" />,
    cell: ({ row }) =>
      row.original.is_priority ? (
        <PriorityBadge level="Urgent" fallback="Prioritas" />
      ) : (
        <PriorityBadge level="Normal" fallback="Biasa" />
      ),
  },
  {
    accessorKey: 'status',
    header: (props) => <DataTableColumnHeader {...props} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const Icon = STATUS_ICONS[status];

      return (
        <Badge
          variant={STATUS_VARIANTS[status]}
          className="flex w-fit items-center gap-1 capitalize"
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'approved_by_director_at',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Persetujuan Direktur" />
    ),
    cell: ({ row }) => {
      const isApproved = !!row.original.approved_by_director_at;

      return (
        <Badge
          variant={isApproved ? 'default' : 'secondary'}
          className="flex w-fit items-center gap-1.5"
        >
          {isApproved ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {isApproved ? 'Disetujui' : 'Belum'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'checklist_percentage',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Skor Checklist" />
    ),
    cell: ({ row }) => {
      const percentage = Number(row.original.checklist_percentage || 0);

      return (
        <div className="flex w-[100px] flex-col gap-1">
          <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full transition-all duration-500',
                percentage >= 100
                  ? 'bg-primary'
                  : percentage > 50
                    ? 'bg-primary/80'
                    : 'bg-primary/40',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    meta: { cellClassName: 'w-1' },
    cell: ({ row }) => {
      const need = row.original;

      const actions: any[] = [
        {
          label: 'Detail',
          icon: FileText,
          href: needRoutes.show.url({ need: need.id }),
        },
      ];

      if (hasPermission('update needs')) {
        actions.push({
          label: 'Edit',
          icon: PencilLine,
          onClick: () => onEdit(need),
        });
        actions.push({
          label: 'Lampiran',
          icon: Paperclip,
          href: NeedAttachmentController.index.url({ need: need.id }),
        });
      }

      if (hasPermission('delete needs')) {
        actions.push('separator');
        actions.push({
          label: 'Hapus',
          icon: Trash2,
          onClick: () => onDelete(need),
          variant: 'destructive',
        });
      }

      if (hasPermission('approve needs')) {
        actions.push('separator');
        actions.push({
          label: 'Review Direktur',
          icon: Signature,
          onClick: () => onReview(need),
          indicator: !!need.notes,
        });
      }

      return <ActionDropdown actions={actions} />;
    },
  },
];
