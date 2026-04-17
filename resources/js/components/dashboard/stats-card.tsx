import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col gap-1 p-6 transition-all hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('rounded-md bg-primary/10 p-2', iconClassName)}>
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
        {description && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
