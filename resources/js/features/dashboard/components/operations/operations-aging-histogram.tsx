import {
  RiTimeLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiInformationLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  AgingBucketItem,
  OperationsAgingData,
} from '@/types/needs-dashboard';

interface OperationsAgingHistogramProps {
  aging?: OperationsAgingData;
}

export function OperationsAgingHistogram({
  aging,
}: OperationsAgingHistogramProps) {
  const [selectedStage, setSelectedStage] = useState<
    'draft' | 'under_review' | 'rejected'
  >('draft');

  const draftBuckets = aging?.draft ?? [];
  const reviewBuckets = aging?.under_review ?? [];
  const rejectedBuckets = aging?.rejected ?? [];

  const activeBuckets: AgingBucketItem[] =
    selectedStage === 'draft'
      ? draftBuckets
      : selectedStage === 'under_review'
        ? reviewBuckets
        : rejectedBuckets;

  const totalStageCount = activeBuckets.reduce((sum, b) => sum + b.count, 0);
  const maxCount = Math.max(1, ...activeBuckets.map((b) => b.count));

  return (
    <Card className="flex flex-col border-border/80">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <RiTimeLine className="size-4 text-foreground" />
            <span>Distribusi Ketidakaktifan Usulan (Aging Histogram)</span>
          </span>
        </CardTitle>
        <CardDescription>
          Berapa lama usulan tidak disentuh atau tidak mengalami perubahan data
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Stage tab selectors moved to CardContent */}
          <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setSelectedStage('draft')}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                selectedStage === 'draft'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <RiFileTextLine className="size-3" />
              <span>Draf</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStage('under_review')}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                selectedStage === 'under_review'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <RiCheckboxCircleLine className="size-3" />
              <span>Menunggu Review</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStage('rejected')}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                selectedStage === 'rejected'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <RiCloseCircleLine className="size-3" />
              <span>Ditolak</span>
            </button>
          </div>

          {/* Metric disclaimer banner */}
          <div className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xss text-muted-foreground">
            <RiInformationLine className="size-4 shrink-0 text-muted-foreground" />
            <span>
              Metrik diukur berdasarkan{' '}
              <strong>&quot;tidak aktif X hari&quot;</strong> dari tanggal
              pembaruan terakhir dokumen (proxy <code>updated_at</code>).
            </span>
          </div>

          {/* Histogram Bars */}
          <div className="flex flex-col gap-3">
            {activeBuckets.length === 0 || totalStageCount === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 text-center">
                <p className="text-xs text-muted-foreground">
                  Tidak ada data usulan pada tahapan ini.
                </p>
              </div>
            ) : (
              activeBuckets.map((bucket) => {
                const countPct = Math.round((bucket.count / maxCount) * 100);
                const sharePct =
                  totalStageCount > 0
                    ? Math.round((bucket.count / totalStageCount) * 100)
                    : 0;

                return (
                  <div
                    key={bucket.key}
                    className="flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {bucket.label}
                        </span>
                        <span className="text-xss text-muted-foreground">
                          ({bucket.description})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-muted-foreground">
                          {formatCompactIDR(bucket.budget)}
                        </span>
                        <Badge
                          variant={
                            bucket.key === 'stuck'
                              ? 'destructive'
                              : bucket.key === 'delayed'
                                ? 'outline'
                                : 'secondary'
                          }
                          className="font-mono"
                        >
                          {formatNumber(bucket.count)} usulan ({sharePct}%)
                        </Badge>
                      </div>
                    </div>

                    {/* Visual Bar (Pure CSS) */}
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted/70">
                      <div
                        style={{
                          width: `${Math.max(countPct, bucket.count > 0 ? 3 : 0)}%`,
                        }}
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          bucket.key === 'fresh' && 'bg-success',
                          bucket.key === 'stale' && 'bg-warning',
                          bucket.key === 'delayed' && 'bg-warning/80',
                          bucket.key === 'stuck' && 'bg-destructive',
                        )}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
