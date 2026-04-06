import { Edit, Trash2 } from 'lucide-react';
import * as React from 'react';
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
import { cn } from '@/lib/utils';

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
}

export function NeedCard({ need, onEdit, onDelete }: NeedCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="max-w-[65ch]">{need.title}</CardTitle>
        <CardDescription className="max-w-[75ch]">
          {need.description}
        </CardDescription>
        <CardAction className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(need)}>
            <Edit />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(need)}
          >
            <Trash2 />
            Hapus
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="">
        <div className="-mx-4 grid grid-cols-3 gap-px overflow-hidden border-y bg-border">
          <InfoItem label="Unit Kerja">
            {need.organizational_unit?.name}
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
      className={cn('flex items-center justify-between bg-card p-4', className)}
    >
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
