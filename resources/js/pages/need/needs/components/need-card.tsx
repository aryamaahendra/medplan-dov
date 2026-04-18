import { Link } from '@inertiajs/react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Paperclip,
  PencilLine,
  Signature,
  Trash2,
  XCircle,
} from 'lucide-react';
import * as React from 'react';
import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { PriorityBadge } from '@/components/priority-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';

import {
  formatCurrency,
  STATUS_ICONS,
  STATUS_LABELS,
  STATUS_VARIANTS,
} from '../columns';
import type { Need } from '../columns';

interface NeedCardProps {
  need: Need;
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
}

export function NeedCard({ need, onEdit, onDelete, onReview }: NeedCardProps) {
  const { hasPermission } = usePermission();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="max-w-[65ch]">{need.title}</CardTitle>
        <CardDescription className="max-w-[75ch]">
          {need.description}
        </CardDescription>
        <CardAction className="space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={needRoutes.show.url({ need: need.id })}>
              <FileText />
              Detail
            </Link>
          </Button>

          {hasPermission('update needs') && (
            <>
              <Button variant="outline" size="sm" onClick={() => onEdit(need)}>
                <PencilLine />
                Edit
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={NeedAttachmentController.index.url({ need: need.id })}
                >
                  <Paperclip />
                  Lampiran
                </Link>
              </Button>
            </>
          )}

          {hasPermission('delete needs') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(need)}
            >
              <Trash2 />
              Hapus
            </Button>
          )}

          {hasPermission('approve needs') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReview(need)}
              className="relative"
            >
              <Signature />
              Review Direktur
              {need.notes && (
                <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
                  <AlertCircle />
                </span>
              )}
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="">
        <div className="-mx-4 grid grid-cols-3 gap-px overflow-hidden border-y bg-border">
          <InfoItem label="Unit Kerja">
            <span className="text-right!">
              {need.organizational_unit?.name}
            </span>
          </InfoItem>

          <InfoItem label="Jenis">{need.need_type?.name}</InfoItem>

          <InfoItem label="Tahun">
            <span className="font-mono">{need.year}</span>
          </InfoItem>

          <InfoItem label="Volume">
            {Number(need.volume).toLocaleString('id-ID')} {need.unit}
          </InfoItem>

          <InfoItem label="Total Harga">
            <span className="font-mono font-semibold">
              {formatCurrency(need.total_price)}
            </span>
          </InfoItem>

          <InfoItem label="Status">
            <Badge
              variant={STATUS_VARIANTS[need.status] || 'outline'}
              className="flex w-fit items-center gap-1"
            >
              {(() => {
                const Icon = STATUS_ICONS[need.status];

                return Icon ? <Icon className="h-3.5 w-3.5" /> : null;
              })()}
              {STATUS_LABELS[need.status] || need.status}
            </Badge>
          </InfoItem>

          <InfoItem label="Urgensi">
            <PriorityBadge level={need.urgency} />
          </InfoItem>

          <InfoItem label="Dampak">
            <PriorityBadge level={need.impact} />
          </InfoItem>

          <InfoItem label="Prioritas">
            {need.is_priority ? (
              <PriorityBadge level="Urgent" fallback="Prioritas" />
            ) : (
              <PriorityBadge level="Normal" fallback="Biasa" />
            )}
          </InfoItem>

          <InfoItem label="Review Direktur" className="col-span-full border-t">
            <div className="flex items-center gap-2">
              <Badge
                variant={need.approved_by_director_at ? 'default' : 'secondary'}
                className="flex items-center gap-1.5"
              >
                {need.approved_by_director_at ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {need.approved_by_director_at
                  ? 'Disetujui Direktur'
                  : 'Belum Review'}
              </Badge>
              {need.approved_by_director_at && (
                <span className="text-xs text-muted-foreground">
                  pada{' '}
                  {new Date(need.approved_by_director_at).toLocaleDateString(
                    'id-ID',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
                </span>
              )}
            </div>
          </InfoItem>
        </div>
      </CardContent>
    </Card>
  );
}
interface InfoItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function InfoItem({ label, children, className }: InfoItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-6 bg-card p-4',
        className,
      )}
    >
      <div className="text-sm whitespace-nowrap text-muted-foreground">
        {label}
      </div>
      <div className="text-right text-sm">{children}</div>
    </div>
  );
}
