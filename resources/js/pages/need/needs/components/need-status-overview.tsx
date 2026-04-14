import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { PriorityBadge } from '@/components/priority-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EditorRenderer } from '@/components/ui/editor-renderer';

import { STATUS_ICONS, STATUS_LABELS, STATUS_VARIANTS } from '../columns';
import type { Need } from '../columns';

interface NeedStatusOverviewProps {
  need: Need;
}

export function NeedStatusOverview({ need }: NeedStatusOverviewProps) {
  const StatusIcon = STATUS_ICONS[need.status];

  return (
    <div className="">
      <Card className="p-0">
        <CardContent className="divide-y p-0">
          <div className="bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Overview Usulan
          </div>
          <div className="flex justify-between px-4 py-3">
            <div className="">Urgensi</div>
            <PriorityBadge level={need.urgency} />
          </div>
          <div className="flex justify-between px-4 py-3">
            <div className="">Dampak</div>
            <PriorityBadge level={need.impact} />
          </div>
          <div className="flex justify-between px-4 py-3">
            <div className="">Prioritas</div>
            {need.is_priority ? (
              <PriorityBadge level="Urgent" fallback="Prioritas" />
            ) : (
              <PriorityBadge level="Normal" fallback="Biasa" />
            )}
          </div>
          <div className="flex justify-between px-4 py-3">
            <div className="">Status</div>
            <Badge
              variant={STATUS_VARIANTS[need.status]}
              className="flex items-center gap-1"
            >
              {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
              {STATUS_LABELS[need.status]}
            </Badge>
          </div>
          <div className="flex justify-between px-4 py-3">
            <div className="">Review Direktur</div>
            <Badge
              variant={need.approved_by_director_at ? 'default' : 'secondary'}
              className="flex items-center gap-1.5"
            >
              {need.approved_by_director_at ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {need.approved_by_director_at ? 'Disetujui' : 'Belum'}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Skor Checklist</span>
              <span className="text-sm font-bold tabular-nums">
                {Number(need.checklist_percentage || 0)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${need.checklist_percentage || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {need.notes && (
        <Card className="mt-4 border-primary/20 bg-primary/5">
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
              <ShieldCheck className="h-4 w-4" />
              Catatan Direktur
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              <EditorRenderer value={need.notes} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
