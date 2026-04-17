import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataItem {
  name: string;
  count: number;
}

interface DistributionChartProps {
  title: string;
  data: Record<string, number> | DataItem[];
  className?: string;
  color?: string;
}

export function DistributionChart({
  title,
  data,
  className,
  color = 'bg-primary',
}: DistributionChartProps) {
  const normalizedData: DataItem[] = Array.isArray(data)
    ? data
    : Object.entries(data).map(([name, count]) => ({ name, count }));

  const max = Math.max(...normalizedData.map((d) => d.count), 1);

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="space-y-4">
        {normalizedData.length > 0 ? (
          normalizedData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="mr-2 truncate font-medium" title={item.name}>
                  {item.name}
                </span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn('h-full transition-all duration-500', color)}
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground italic">
            No data available
          </div>
        )}
      </div>
    </Card>
  );
}
