import {
  DirectorReviewBadge,
  PriorityBadge,
  ProposalStatusBadge,
  ReadinessBadge,
  UrgencyImpactBadge,
} from '@/components/badges';
import { Card, CardContent } from '@/components/ui/card';
import type { Need } from '@/types';

interface NeedStatusOverviewProps {
  need: Need;
}

export function NeedStatusOverview({ need }: NeedStatusOverviewProps) {
  return (
    <div className="">
      <Card className="p-0">
        <CardContent className="divide-y p-0">
          <div className="bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Overview Usulan
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">Prioritas</div>
            {need.is_priority ? (
              <PriorityBadge isPriority={need.is_priority} />
            ) : (
              <span className="text-xs text-muted-foreground">Biasa</span>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">Urgensi & Dampak</div>
            <UrgencyImpactBadge urgency={need.urgency} impact={need.impact} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">Status Usulan</div>
            <ProposalStatusBadge status={need.status} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">Review Direktur</div>
            {need.approved_by_director_at ||
            need.notes ||
            need.status === 'approved' ? (
              <DirectorReviewBadge need={need} />
            ) : (
              <span className="text-xs text-muted-foreground">
                Belum ada review
              </span>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">Kesiapan Dokumen</div>
            <ReadinessBadge percentage={need.checklist_percentage} />
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
    </div>
  );
}
