import { Target, TrendingUp } from 'lucide-react';

import { PriorityBadge } from '@/components/priority-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
            <Badge variant={STATUS_VARIANTS[need.status]}>
              {STATUS_LABELS[need.status]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
