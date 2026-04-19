import { Link } from '@inertiajs/react';
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
import { PriorityBadge } from '@/components/priority-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  LABELED_PRIORITY_CLASSES,
  LABELED_PRIORITY_LABELS,
  STATUS_ICONS,
  STATUS_LABELS,
  STATUS_VARIANTS,
} from '@/constants/need';
import { usePermission } from '@/hooks/use-permission';
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';

import type { Need } from '@/types';

interface NeedGridCardProps {
  need: Need;
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
}

export function NeedGridCard({
  need,
  onEdit,
  onDelete,
  onReview,
}: NeedGridCardProps) {
  const { hasPermission } = usePermission();

  const actions: Parameters<typeof ActionDropdown>[0]['actions'] = [
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

  const percentage = Number(need.checklist_percentage || 0);
  const StatusIcon = STATUS_ICONS[need.status];

  // Build unit path
  const unitPath: string[] = [];

  if (need.organizational_unit) {
    const traverse = (unit: typeof need.organizational_unit) => {
      if (!unit) {
        return;
      }

      if (unit.parents_recursive) {
        traverse(unit.parents_recursive);
      }

      unitPath.push(unit.name);
    };
    traverse(need.organizational_unit);
  }

  return (
    <Card className="flex flex-col overflow-hidden py-0">
      <CardContent className="flex flex-1 flex-col gap-0 p-0">
        <div className="">
          {/* Identity row */}
          <div className="flex items-start gap-2 p-3 pb-2">
            <div className="flex flex-1 flex-wrap gap-1.5">
              <Badge variant="outline">{need.year}</Badge>
              {need.need_type?.name && (
                <Badge variant="secondary">{need.need_type.name}</Badge>
              )}
            </div>
            <ActionDropdown actions={actions} align="end" />
          </div>

          {/* Title */}
          <div className="px-3 pb-1">
            <Link
              href={needRoutes.show.url({ need: need.id })}
              className="line-clamp-2 text-sm leading-snug font-semibold hover:underline"
            >
              {need.title}
            </Link>
          </div>

          {/* Unit path */}
          {unitPath.length > 0 && (
            <div className="px-3 pb-3">
              <span className="text-[12px] leading-tight text-muted-foreground">
                {unitPath.join(' › ')}
              </span>
            </div>
          )}

          {/* Financial */}
          <div className="border-t px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {Number(need.volume).toLocaleString('id-ID')} {need.unit} ×{' '}
                {formatIDR(need.unit_price)}
              </span>
            </div>
            <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
              {formatIDR(need.total_price)}
            </div>
          </div>

          {/* Priority signals */}
          <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2">
            <LabeledPriorityBadge prefix="Urgensi" level={need.urgency} />
            <LabeledPriorityBadge prefix="Dampak" level={need.impact} />
            <PriorityBadge
              level={need.is_priority ? 'Urgent' : 'Normal'}
              fallback={need.is_priority ? 'Prioritas' : 'Biasa'}
            />
          </div>

          {/* Status + Director */}
          <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2">
            <Badge
              variant={STATUS_VARIANTS[need.status]}
              className="flex items-center gap-1"
            >
              {StatusIcon && <StatusIcon className="h-3 w-3" />}
              {STATUS_LABELS[need.status]}
            </Badge>

            <Badge
              variant={need.approved_by_director_at ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {need.approved_by_director_at ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {need.approved_by_director_at ? 'Disetujui' : 'Belum Review'}
            </Badge>
          </div>
        </div>

        {/* Checklist score */}
        <div className="mt-auto flex shrink grow flex-col justify-end border-t px-3 py-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground tabular-nums">
              Checklist
            </span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                percentage >= 85
                  ? 'text-primary'
                  : percentage >= 50
                    ? 'text-amber-500'
                    : 'text-muted-foreground',
              )}
            >
              {percentage}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full transition-all duration-500',
                percentage >= 100
                  ? 'bg-primary'
                  : percentage >= 85
                    ? 'bg-primary/80'
                    : percentage > 50
                      ? 'bg-amber-400'
                      : 'bg-primary/30',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LabeledPriorityBadge({
  prefix,
  level,
}: {
  prefix: string;
  level: string;
}) {
  const key = level?.toLowerCase();
  const label = LABELED_PRIORITY_LABELS[key] ?? level ?? '-';
  const colorClass =
    LABELED_PRIORITY_CLASSES[key] ??
    'bg-secondary/50 text-secondary-foreground border-transparent';

  return (
    <Badge variant="outline" className={colorClass}>
      <span className="opacity-60">{prefix}:</span>&nbsp;{label}
    </Badge>
  );
}
