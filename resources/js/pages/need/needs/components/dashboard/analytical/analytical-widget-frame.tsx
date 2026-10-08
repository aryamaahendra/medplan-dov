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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <CardHeader className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              {title}
            </CardTitle>
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
          {subtitle && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-start">
          {headerActions}

          {tableView && (
            <Button
              type="button"
              variant={showTable ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowTable(!showTable)}
              className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-normal"
              aria-label={
                showTable
                  ? 'Tampilkan grafik visual'
                  : 'Tampilkan sebagai tabel'
              }
            >
              {showTable ? (
                <>
                  <RiBarChartLine className="size-3.5 text-primary" />
                  <span>Grafik</span>
                </>
              ) : (
                <>
                  <RiTableLine className="size-3.5 text-muted-foreground" />
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
                'h-7 gap-1 px-2 text-xs text-primary hover:text-primary/90',
              )}
            >
              <span>{listActionLabel}</span>
              <RiArrowRightUpLine className="size-3.5" />
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-4 pt-0 sm:p-5 sm:pt-0">
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
