import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: ReactNode;
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
        'relative flex flex-col gap-2 p-4 transition-all hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground/60">{title}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight">{value}</h2>
        {description && (
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </div>

      <Icon
        className={cn(
          'absolute -right-4 -bottom-6 size-20 opacity-15',
          iconClassName,
        )}
      />
    </Card>
  );
}
