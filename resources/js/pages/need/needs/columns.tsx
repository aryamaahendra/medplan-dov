import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  FileText,
  Paperclip,
  PencilLine,
  Send,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { PriorityBadge } from '@/components/priority-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type {
  KpiIndicator,
  StrategicServicePlan as BaseStrategicServicePlan,
} from '@/types';

export type { KpiIndicator, BaseStrategicServicePlan };

export interface Attachment {
  id: number;
  need_id: number;
  display_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  extension: string;
  created_at: string;
}

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

export interface NeedDetail {
  id?: number;
  need_id?: number;
  background: string | null;
  purpose_and_objectives: string | null;
  target_objective: string | null;
  procurement_organization_name: string | null;
  funding_source_and_estimated_cost: string | null;
  implementation_period: string | null;
  expert_or_skilled_personnel: string | null;
  technical_specifications: string | null;
  training: string | null;
}

export interface Need {
  id: number;
  need_group_id: number;
  needGroup?: {
    id: number;
    name: string;
  };
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
  detail?: NeedDetail | null;
  checklist_percentage?: number | string;
  attachments?: Attachment[];
  notes?: string | null;
  approved_by_director_at?: string | null;
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
  onReview: (need: Need) => void,
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
    cell: ({ row }) => row.original.organizational_unit?.name ?? '-',
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

      return (
        <ActionDropdown
          actions={[
            {
              label: 'Detail',
              icon: FileText,
              href: needRoutes.show.url({ need: need.id }),
            },
            {
              label: 'Edit',
              icon: PencilLine,
              onClick: () => onEdit(need),
            },
            {
              label: 'Lampiran',
              icon: Paperclip,
              href: NeedAttachmentController.index.url({ need: need.id }),
            },
            'separator',
            {
              label: 'Hapus',
              icon: Trash2,
              onClick: () => onDelete(need),
              variant: 'destructive',
            },
            'separator',
            {
              label: 'Review Direktur',
              icon: ShieldCheck,
              onClick: () => onReview(need),
            },
          ]}
        />
      );
    },
  },
];
