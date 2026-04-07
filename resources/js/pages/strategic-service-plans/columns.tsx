import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(plan)}>
              <PencilLine />
              Edit Rencana
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(plan)}
            >
              <Trash2 />
              Hapus Rencana
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
