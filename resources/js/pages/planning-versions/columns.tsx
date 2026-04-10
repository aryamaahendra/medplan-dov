import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, Trash2, CheckCircle2, List, Edit } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import planningVersions from '@/routes/planning-versions';
import type { PlanningVersion } from '@/types/planning-version';

const statusLabels: Record<PlanningVersion['status'], string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  approved: 'Disetujui',
  archived: 'Arsip',
};

const statusVariants: Record<
  PlanningVersion['status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  draft: 'secondary',
  submitted: 'default',
  approved: 'outline', // Usually success/green but shadcn default doesn't have it
  archived: 'destructive',
};

export const getColumns = (
  onEdit: (version: PlanningVersion) => void,
  onCreateRevision: (version: PlanningVersion) => void,
  onSetCurrent: (version: PlanningVersion) => void,
  onDelete: (version: PlanningVersion) => void,
): ColumnDef<PlanningVersion>[] => [
  {
    accessorKey: 'name',
    header: (props) => <DataTableColumnHeader {...props} title="Nama Versi" />,
    cell: ({ row }) => {
      const version = row.original;

      return (
        <div className="flex flex-col">
          <Link
            href={planningVersions.activities.index.url({
              planning_version: version.id,
            })}
            className="font-medium text-primary hover:underline"
          >
            {version.name}
          </Link>
          {version.notes && (
            <span className="max-w-[300px] truncate text-xs text-muted-foreground">
              {version.notes}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'fiscal_year',
    header: (props) => <DataTableColumnHeader {...props} title="Tahun" />,
    meta: {
      cellClassName: 'w-[100px]',
    },
  },
  {
    accessorKey: 'revision_no',
    header: (props) => <DataTableColumnHeader {...props} title="Revisi" />,
    cell: ({ row }) => {
      const value = row.getValue('revision_no') as number;

      return <Badge variant="outline">v{value}</Badge>;
    },
    meta: {
      cellClassName: 'w-[100px] text-center',
    },
  },
  {
    accessorKey: 'status',
    header: (props) => <DataTableColumnHeader {...props} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as PlanningVersion['status'];

      return (
        <Badge variant={statusVariants[status] ?? 'outline'}>
          {statusLabels[status] ?? status}
        </Badge>
      );
    },
    meta: {
      cellClassName: 'w-[120px]',
    },
  },
  {
    accessorKey: 'is_current',
    header: (props) => <DataTableColumnHeader {...props} title="Berlaku" />,
    cell: ({ row }) => {
      const isCurrent = row.getValue('is_current') as boolean;

      return isCurrent ? (
        <Badge
          variant="default"
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Ya
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Tidak</span>
      );
    },
    meta: {
      cellClassName: 'w-[100px] text-center',
    },
  },
  {
    id: 'actions',
    meta: {
      cellClassName: 'w-1',
    },
    cell: ({ row }) => {
      const version = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Lihat Snapshot',
              icon: List,
              onClick: () => {
                window.location.href = planningVersions.activities.index.url({
                  planning_version: version.id,
                });
              },
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => onEdit(version),
            },
            {
              label: 'Buat Revisi',
              icon: Copy,
              onClick: () => onCreateRevision(version),
            },
            {
              label: 'Jadikan Utama',
              icon: CheckCircle2,
              onClick: () => onSetCurrent(version),
              disabled: version.is_current,
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(version),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
