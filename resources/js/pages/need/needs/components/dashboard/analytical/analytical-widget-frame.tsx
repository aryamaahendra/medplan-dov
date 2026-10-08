import { Link } from '@inertiajs/react';
import {
  RiTableLine,
  RiBarChartLine,
  RiArrowRightUpLine,
  RiInformationLine,
} from '@remixicon/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AnalyticalWidgetFrameProps {
  title: string;
  subtitle?: string;
  infoTooltip?: string;
  badge?: ReactNode;
  listHref?: string;
  listActionLabel?: string;
  children: ReactNode;
  tableView?: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  defaultShowTable?: boolean;
}

export function AnalyticalWidgetFrame({
  title,
  subtitle,
  infoTooltip,
  badge,
  listHref,
  listActionLabel = 'Buka di daftar',
  children,
  tableView,
  className,
  headerActions,
  defaultShowTable = false,
}: AnalyticalWidgetFrameProps) {
  const [showTable, setShowTable] = useState(defaultShowTable);

  return (
    <Card
      className={cn(
        'flex flex-col border-border/70 bg-card shadow-xs transition-shadow hover:shadow-sm',
        className,
      )}
    >
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {badge}
            {infoTooltip && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="inline-flex cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Info: ${title}`}
                    >
                      <RiInformationLine className="size-3.5" />
                    </button>
                  }
                />
                <TooltipContent className="max-w-xs text-xs">
                  {infoTooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>

        <CardAction>
          <div className="flex flex-wrap items-center gap-1.5 self-start">
            {headerActions}

            {tableView && (
              <Button
                type="button"
                variant={showTable ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowTable(!showTable)}
                aria-label={
                  showTable
                    ? 'Tampilkan grafik visual'
                    : 'Tampilkan sebagai tabel'
                }
              >
                {showTable ? (
                  <>
                    <RiBarChartLine
                      data-icon="inline-start"
                      className="text-primary"
                    />
                    <span>Grafik</span>
                  </>
                ) : (
                  <>
                    <RiTableLine
                      data-icon="inline-start"
                      className="text-muted-foreground"
                    />
                    <span>Tabel</span>
                  </>
                )}
              </Button>
            )}

            {listHref && (
              <Link
                href={listHref}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'text-primary hover:text-primary/90',
                )}
              >
                <span>{listActionLabel}</span>
                <RiArrowRightUpLine data-icon="inline-end" />
              </Link>
            )}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        {showTable && tableView ? (
          <div className="w-full overflow-x-auto rounded-lg border border-border/60">
            {tableView}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
