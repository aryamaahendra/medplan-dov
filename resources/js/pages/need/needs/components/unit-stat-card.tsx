import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface UnitStatCardProps {
  name: string;
  parents: string[];
  count: number;
  total: number;
  totalBudget: number;
  priorityCount: number;
  approvedCount: number;
}

export function UnitStatCard({
  name,
  parents,
  count,
  total,
  totalBudget,
  priorityCount,
  approvedCount,
}: UnitStatCardProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  const formattedBudget = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalBudget);

  return (
    <Card size="sm" className="py-0! transition-all hover:shadow-md">
      <CardHeader className="flex min-h-12 flex-col justify-center gap-0.5 py-2!">
        {parents.length > 0 && (
          <CardDescription className="truncate text-[11px] text-muted-foreground/70">
            {parents.join(' / ')}
          </CardDescription>
        )}

        <CardTitle className="text-xs! leading-tight" title={name}>
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex shrink grow flex-col justify-end divide-y px-0! py-2">
        <div className="flex items-center justify-between border-t px-4 py-2 text-base">
          <span className="font-mono text-xl font-bold">{formattedBudget}</span>
        </div>

        <div className="px-4 py-2">
          <div>
            <div className="flex items-end gap-2">
              <div className="font-mono text-base font-semibold">{count}</div>
              <div className="mb-1 text-xs text-muted-foreground/80">
                / ITEMS
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs opacity-70">
              <div className="text-orange-600">{priorityCount} PRIORITY</div>
              <div>|</div>
              <div className="text-green-700">{approvedCount} APPROVED</div>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Usulan</span>
          <span className="font-medium">{count}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1">
            <span className="text-muted-foreground">Prioritas</span>
            <span className="font-medium text-orange-600">{priorityCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1">
            <span className="text-muted-foreground">Disetujui</span>
            <span className="font-medium text-green-600">{approvedCount}</span>
          </div>
        </div> */}

        <div className="px-4 py-2">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Kontribusi: {pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
