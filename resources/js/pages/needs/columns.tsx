import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Need {
  id: number;
  organizational_unit_id: number;
  need_type_id: number;
  year: number;
  title: string;
  description: string | null;
  current_condition: string | null;
  required_condition: string | null;
  volume: string;
  unit: string;
  unit_price: string;
  total_price: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  organizational_unit?: { id: number; name: string };
  need_type?: { id: number; name: string };
}

const STATUS_LABELS: Record<Need['status'], string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

const STATUS_VARIANTS: Record<
  Need['status'],
  'secondary' | 'default' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
};

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value));

export const getColumns = (
  onEdit: (need: Need) => void,
  onDelete: (need: Need) => void,
): ColumnDef<Need>[] => [
  {
    accessorKey: 'id',
    header: '#',
    enableSorting: false,
    meta: { cellClassName: 'font-mono text-muted-foreground w-[50px]' },
  },
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
  },
  {
    id: 'organizational_unit',
    header: 'Unit Kerja',
    cell: ({ row }) => row.original.organizational_unit?.name ?? '-',
    enableSorting: false,
  },
  {
    id: 'need_type',
    header: 'Jenis Kebutuhan',
    cell: ({ row }) => row.original.need_type?.name ?? '-',
    enableSorting: false,
  },
  {
    id: 'volume_unit',
    header: 'Volume',
    cell: ({ row }) =>
      `${Number(row.original.volume).toLocaleString('id-ID')} ${row.original.unit}`,
    enableSorting: false,
    meta: { cellClassName: 'text-right tabular-nums' },
  },
  {
    accessorKey: 'total_price',
    header: (props) => <DataTableColumnHeader {...props} title="Total Harga" />,
    cell: ({ row }) => formatCurrency(row.original.total_price),
    meta: { cellClassName: 'text-right tabular-nums' },
  },
  {
    accessorKey: 'status',
    header: (props) => <DataTableColumnHeader {...props} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANTS[row.original.status]}>
        {STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    id: 'actions',
    meta: { cellClassName: 'w-1' },
    cell: ({ row }) => {
      const need = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only font-normal">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-sm/relaxed"
              onClick={() => onEdit(need)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(need)}
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
