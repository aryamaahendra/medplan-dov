import { Link } from '@inertiajs/react';
import {
  RiTableLine,
  RiPieChartLine,
  RiArrowRightUpLine,
  RiInformationLine,
} from '@remixicon/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  borderless?: boolean;
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
  borderless = false,
}: AnalyticalWidgetFrameProps) {
  const [showTable, setShowTable] = useState(defaultShowTable);

  const headerContent = (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
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
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );

  const actionsContent = (
    <div className="flex flex-wrap items-center gap-1.5 self-start">
      {headerActions}

      {tableView && (
        <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/30 px-2 py-1 text-xs">
          <span
            onClick={() => setShowTable(false)}
            title="Tampilkan grafik visual"
            aria-label="Tampilkan grafik visual"
            className={cn(
              'flex cursor-pointer items-center transition-colors select-none',
              !showTable
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <RiPieChartLine className="size-4" />
          </span>
          <Switch
            size="sm"
            checked={showTable}
            onCheckedChange={setShowTable}
            aria-label={
              showTable ? 'Tampilkan grafik visual' : 'Tampilkan sebagai tabel'
            }
          />
          <span
            onClick={() => setShowTable(true)}
            title="Tampilkan sebagai tabel"
            aria-label="Tampilkan sebagai tabel"
            className={cn(
              'flex cursor-pointer items-center transition-colors select-none',
              showTable
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <RiTableLine className="size-4" />
          </span>
        </div>
      )}

      {listHref && (
        <Link
          href={listHref}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'font-semibold text-foreground hover:underline',
          )}
        >
          <span>{listActionLabel}</span>
          <RiArrowRightUpLine data-icon="inline-end" />
        </Link>
      )}
    </div>
  );

  const bodyContent =
    showTable && tableView ? (
      <div className="w-full overflow-x-auto rounded-lg border border-border/60">
        {tableView}
      </div>
    ) : (
      children
    );

  if (borderless) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2.5">
          {headerContent}
          {actionsContent}
        </div>
        <div>{bodyContent}</div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'flex flex-col border-border/70 bg-card shadow-xs transition-shadow hover:shadow-sm',
        className,
      )}
    >
      <CardHeader>
        {headerContent}
        <CardAction>{actionsContent}</CardAction>
      </CardHeader>

      <CardContent>{bodyContent}</CardContent>
    </Card>
  );
}
