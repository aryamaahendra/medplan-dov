import type { ColumnDef } from '@tanstack/react-table';
import { PencilLine, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import type { PlanningActivity } from '@/types/planning-activity';

const typeLabels: Record<PlanningActivity['type'], string> = {
  program: 'Program',
  activity: 'Kegiatan',
  sub_activity: 'Sub Kegiatan',
  output: 'Output',
};

const typeVariants: Record<
  PlanningActivity['type'],
  'default' | 'outline' | 'secondary' | 'destructive'
> = {
  program: 'default',
  activity: 'secondary',
  sub_activity: 'outline',
  output: 'destructive', // Just to make it distinct
};

export const getColumns = (
  onEdit: (activity: PlanningActivity) => void,
  onDelete: (activity: PlanningActivity) => void,
): ColumnDef<PlanningActivity>[] => [
  {
    accessorKey: 'code',
    header: (props) => <DataTableColumnHeader {...props} title="Kode" />,
    cell: ({ row }) => {
      const value = row.getValue('code') as string;

      return <div className="font-mono text-xs">{value || '-'}</div>;
    },
    meta: {
      cellClassName: 'w-[120px]',
    },
  },
  {
    accessorKey: 'type',
    header: (props) => <DataTableColumnHeader {...props} title="Tipe" />,
    cell: ({ row }) => {
      const type = row.getValue('type') as PlanningActivity['type'];

      return (
        <Badge variant={typeVariants[type] ?? 'outline'}>
          {typeLabels[type] ?? type}
        </Badge>
      );
    },
    meta: {
      cellClassName: 'w-[100px]',
    },
  },
  {
    accessorKey: 'name',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Nama Nomenklatur" />
    ),
    meta: {
      cellClassName: 'min-w-[300px]',
    },
  },
  {
    id: 'actions',
    meta: {
      cellClassName: 'w-1',
    },
    cell: ({ row }) => {
      const activity = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
              icon: PencilLine,
              onClick: () => onEdit(activity),
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(activity),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
