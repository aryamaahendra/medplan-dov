import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  FileText,
  MoreHorizontal,
  PencilLine,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { PriorityBadge } from '@/components/priority-badge';
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
import needRoutes from '@/routes/needs';
import type {
  KpiIndicator,
  StrategicServicePlan as BaseStrategicServicePlan,
} from '@/types';

export interface Sasaran {
  id: number;
  name: string;
  tujuan_id: number;
  tujuan?: { id: number; name: string };
  indicators?: Indicator[];
}

export interface Indicator {
  id: number;
  name: string;
  baseline: string | null;
  sasaran_id: number;
  sasaran?: { id: number; name: string };
  targets?: { id: number; year: number; target: string }[];
}

export interface Tujuan {
  id: number;
  name: string;
  sasarans: Sasaran[];
}

export type StrategicServicePlan = BaseStrategicServicePlan;

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
  urgency: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  is_priority: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  organizational_unit?: { id: number; name: string };
  need_type?: { id: number; name: string };
  sasarans?: Sasaran[];
  indicators?: Indicator[];
  kpi_indicators?: KpiIndicator[];
  strategic_service_plans?: StrategicServicePlan[];
  sasarans_count?: number;
  indicators_count?: number;
  kpi_indicators_count?: number;
  strategic_service_plans_count?: number;
}

export const STATUS_LABELS: Record<Need['status'], string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export const STATUS_VARIANTS: Record<
  Need['status'],
  'secondary' | 'default' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
};

export const STATUS_ICONS: Record<Need['status'], React.ElementType> = {
  draft: FileText,
  submitted: Send,
  approved: CheckCircle2,
  rejected: XCircle,
};

export const PRIORITY_LABELS: Record<string, string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
  High: 'Tinggi',
  Medium: 'Sedang',
  Low: 'Rendah',
};

export const PRIORITY_VARIANTS: Record<
  string,
  'destructive' | 'default' | 'outline' | 'secondary'
> = {
  high: 'destructive',
  medium: 'default',
  low: 'outline',
  High: 'destructive',
  Medium: 'default',
  Low: 'outline',
};

export const formatCurrency = (value: string | number) =>
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
    cell: ({ row }) => (
      <p className="w-[36ch] whitespace-normal">{row.original.title}</p>
    ),
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
    meta: { cellClassName: 'tabular-nums font-mono' },
  },
  {
    accessorKey: 'total_price',
    header: (props) => <DataTableColumnHeader {...props} title="Total Harga" />,
    cell: ({ row }) => formatCurrency(row.original.total_price),
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
            <DropdownMenuItem className="text-sm/relaxed" asChild>
              <Link href={needRoutes.show.url({ need: need.id })}>
                <FileText className="h-4 w-4" />
                Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-sm/relaxed"
              onClick={() => onEdit(need)}
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(need)}
            >
              <Trash2 />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
