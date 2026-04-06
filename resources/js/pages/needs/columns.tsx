import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Component,
  Edit,
  FileText,
  MoreHorizontal,
  Send,
  Tag,
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

export interface KpiIndicator {
  id: number;
  name: string;
  unit: string | null;
  is_category: boolean;
  parent_indicator_id: number | null;
}

export interface StrategicServicePlan {
  id: number;
  strategic_program: string;
  service_plan: string;
  year: number;
}

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
  onShowDetails: (need: Need) => void,
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
        <PriorityBadge level="urgent" fallback="Prioritas" />
      ) : (
        <PriorityBadge level="normal" fallback="Biasa" />
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
          className="flex w-fit items-center gap-1"
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    id: 'alignment',
    header: 'Penyelarasan Strategis',
    cell: ({ row }) => {
      const {
        sasarans_count,
        indicators_count,
        kpi_indicators_count,
        strategic_service_plans_count,
      } = row.original;

      if (
        !sasarans_count &&
        !kpi_indicators_count &&
        !strategic_service_plans_count
      ) {
        return (
          <span className="text-xs text-muted-foreground italic">
            Belum ada penyelarasan
          </span>
        );
      }

      return (
        <div
          className="group flex cursor-pointer flex-wrap items-center gap-1"
          onClick={() => onShowDetails(row.original)}
        >
          {sasarans_count ? (
            <Badge
              variant="outline"
              className="h-6 transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
            >
              <Component className="h-3.5 w-3.5" />
              {sasarans_count} Sasaran
            </Badge>
          ) : null}
          {indicators_count ? (
            <Badge
              variant="outline"
              className="h-6 transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
            >
              <Tag className="h-3.5 w-3.5" />
              {indicators_count} Indikator
            </Badge>
          ) : null}
          {kpi_indicators_count ? (
            <Badge
              variant="outline"
              className="h-6 transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {kpi_indicators_count} KPI
            </Badge>
          ) : null}
          {strategic_service_plans_count ? (
            <Badge
              variant="outline"
              className="h-6 transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
            >
              <FileText className="h-3.5 w-3.5" />
              {strategic_service_plans_count} Plan
            </Badge>
          ) : null}
        </div>
      );
    },
    enableSorting: false,
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
