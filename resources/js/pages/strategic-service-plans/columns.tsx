import type { ColumnDef } from '@tanstack/react-table';
import { PencilLine, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { StrategicServicePlan } from '@/types';

export const getColumns = (
  onEdit: (plan: StrategicServicePlan) => void,
  onDelete: (plan: StrategicServicePlan) => void,
): ColumnDef<StrategicServicePlan>[] => [
  {
    accessorKey: 'year',
    header: (props) => <DataTableColumnHeader {...props} title="Tahun" />,
    meta: {
      cellClassName: 'w-[80px] font-medium text-center',
    },
  },
  {
    accessorKey: 'strategic_program',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Program Strategis" />
    ),
    meta: {
      cellClassName: 'min-w-[200px]',
    },
  },
  {
    accessorKey: 'service_plan',
    header: (props) => (
      <DataTableColumnHeader {...props} title="Rencana Pelayanan" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('service_plan') as string;

      return <div className="max-w-[300px] truncate">{value}</div>;
    },
  },
  {
    accessorKey: 'target',
    header: (props) => <DataTableColumnHeader {...props} title="Target" />,
    cell: ({ row }) => {
      const value = row.getValue('target') as string;

      return <div className="max-w-[300px] truncate">{value}</div>;
    },
  },
  {
    id: 'actions',
    meta: {
      cellClassName: 'w-1',
    },
    cell: ({ row }) => {
      const plan = row.original;

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Edit Rencana',
              icon: PencilLine,
              onClick: () => onEdit(plan),
            },
            'separator',
            {
              label: 'Hapus Rencana',
              icon: Trash2,
              onClick: () => onDelete(plan),
              variant: 'destructive',
            },
          ]}
        />
      );
    },
  },
];
