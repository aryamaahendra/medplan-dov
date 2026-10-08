import { Link } from '@inertiajs/react';
import {
  RiFileTextLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiAlertLine,
  RiArrowRightLine,
} from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import needRoutes from '@/routes/needs';
import type {
  OperationsPayload,
  StageDistributionItem,
} from '@/types/needs-dashboard';

interface OperationsStageStripProps {
  groupId?: number;
  stageDistribution: Record<
    'draft' | 'under_review' | 'approved' | 'rejected',
    StageDistributionItem
  >;
  operations?: OperationsPayload;
}

export function OperationsStageStrip({
  groupId,
  stageDistribution,
  operations,
}: OperationsStageStripProps) {
  const tiles = operations?.stage_tiles;

  const stageItems = [
    {
      key: 'draft' as const,
      number: '1',
      title: 'DRAF USULAN',
      count: tiles?.draft.count ?? stageDistribution.draft.count,
      budget: tiles?.draft.budget ?? stageDistribution.draft.budget,
      percentage: stageDistribution.draft.percentage,
      holder: tiles?.draft.holder ?? 'Unit Kerja',
      exceptionsCount: tiles?.draft.exceptions_count ?? 0,
      icon: RiFileTextLine,
      colorClasses: {
        card: 'border-border/70 hover:border-primary/50',
        title: 'text-muted-foreground',
        number: 'text-foreground',
        icon: 'text-muted-foreground group-hover:text-primary',
      },
      linkQuery: { stage: ['draft'], need_group_id: groupId },
    },
    {
      key: 'under_review' as const,
      number: '2',
      title: 'MENUNGGU REVIEW',
      count: tiles?.under_review.count ?? stageDistribution.under_review.count,
      budget:
        tiles?.under_review.budget ?? stageDistribution.under_review.budget,
      percentage: stageDistribution.under_review.percentage,
      holder: tiles?.under_review.holder ?? 'Tim Perencana / Direktur',
      exceptionsCount: tiles?.under_review.exceptions_count ?? 0,
      icon: RiTimeLine,
      colorClasses: {
        card: 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 dark:bg-amber-500/10',
        title: 'text-amber-800 dark:text-amber-300 font-semibold',
        number: 'text-amber-800 dark:text-amber-300',
        icon: 'text-amber-600 dark:text-amber-400',
      },
      linkQuery: { stage: ['under_review'], need_group_id: groupId },
    },
    {
      key: 'approved' as const,
      number: '3',
      title: 'DISETUJUI DIREKTUR',
      count: tiles?.approved.count ?? stageDistribution.approved.count,
      budget: tiles?.approved.budget ?? stageDistribution.approved.budget,
      percentage: stageDistribution.approved.percentage,
      holder: tiles?.approved.holder ?? 'Selesai',
      exceptionsCount: 0,
      icon: RiCheckboxCircleLine,
      colorClasses: {
        card: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 dark:bg-emerald-500/10',
        title: 'text-emerald-800 dark:text-emerald-300 font-semibold',
        number: 'text-emerald-800 dark:text-emerald-300',
        icon: 'text-emerald-600 dark:text-emerald-400',
      },
      linkQuery: { stage: ['approved'], need_group_id: groupId },
    },
    {
      key: 'rejected' as const,
      number: '4',
      title: 'DITOLAK / REVISI',
      count: tiles?.rejected.count ?? stageDistribution.rejected.count,
      budget: tiles?.rejected.budget ?? stageDistribution.rejected.budget,
      percentage: stageDistribution.rejected.percentage,
      holder: tiles?.rejected.holder ?? 'Unit Kerja (Revisi)',
      exceptionsCount: tiles?.rejected.exceptions_count ?? 0,
      icon: RiCloseCircleLine,
      colorClasses: {
        card: 'border-border/70 hover:border-destructive/50',
        title: 'text-destructive font-medium',
        number: 'text-destructive',
        icon: 'text-destructive',
      },
      linkQuery: { stage: ['rejected'], need_group_id: groupId },
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stageItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.key}
            href={needRoutes.index.url({ query: item.linkQuery })}
            className="group block"
            title={`Buka daftar usulan dengan status ${item.title}`}
          >
            <Card
              className={`h-full transition-all duration-150 hover:shadow-xs ${item.colorClasses.card}`}
            >
              <CardHeader className="flex flex-row items-center justify-between px-4 pt-3.5 pb-1">
                <span
                  className={`text-[11px] tracking-wide ${item.colorClasses.title}`}
                >
                  {item.number}. {item.title}
                </span>
                <Icon
                  className={`size-4 transition-transform group-hover:scale-110 ${item.colorClasses.icon}`}
                />
              </CardHeader>

              <CardContent className="flex flex-col justify-between px-4 pt-0 pb-3">
                <div>
                  <div
                    className={`font-mono text-2xl font-bold tracking-tight ${item.colorClasses.number}`}
                  >
                    {formatNumber(item.count)}
                  </div>

                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {formatCompactIDR(item.budget)} ({item.percentage}%)
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-border/50 pt-2 text-[10px]">
                  <span className="truncate text-muted-foreground">
                    Aksi:{' '}
                    <strong className="text-foreground">{item.holder}</strong>
                  </span>

                  {item.exceptionsCount > 0 ? (
                    <Badge
                      variant="destructive"
                      className="h-4 gap-0.5 px-1 font-mono text-[9px]"
                      title={`${item.exceptionsCount} usulan memerlukan perhatian pada tahapan ini`}
                    >
                      <RiAlertLine className="size-2.5" />
                      {item.exceptionsCount} macet
                    </Badge>
                  ) : (
                    <span className="flex items-center gap-0.5 text-muted-foreground group-hover:text-primary">
                      <span>Buka</span>
                      <RiArrowRightLine className="size-2.5" />
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
