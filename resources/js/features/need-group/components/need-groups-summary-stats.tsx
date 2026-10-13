import {
  RiFolderChartLine,
  RiFileList3Line,
  RiCoinsLine,
} from '@remixicon/react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
  
} from '@/components/ui/chart';
import type {ChartConfig} from '@/components/ui/chart';
import { formatCompactIDR, formatIDR, formatNumber } from '@/lib/formatters';
import type { NeedGroupsSummaryStatsData } from '../types/need-group.types';

interface NeedGroupsSummaryStatsProps {
  stats: NeedGroupsSummaryStatsData;
}

const needsChartConfig = {
  total_needs: {
    label: 'Usulan',
    color: 'var(--info)',
  },
} satisfies ChartConfig;

const budgetChartConfig = {
  total_budget: {
    label: 'Anggaran',
    color: 'var(--warning)',
  },
} satisfies ChartConfig;

export function NeedGroupsSummaryStats({ stats }: NeedGroupsSummaryStatsProps) {
  const yearlyTrends = stats.yearly_trends ?? [];
  const latestTrend = yearlyTrends[yearlyTrends.length - 1];

  const latestNeeds = latestTrend?.total_needs ?? stats.total_needs ?? 0;
  const latestBudget = latestTrend?.total_budget ?? stats.total_budget ?? 0;

  const activePercent =
    stats.total_groups > 0
      ? Math.min(
          100,
          Math.round((stats.active_groups / stats.total_groups) * 100),
        )
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Stat 1: Total Kelompok & Kelompok Aktif */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Kelompok Usulan
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <RiFolderChartLine className="size-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
              {formatNumber(stats.total_groups)}
            </span>
            <span className="text-xs text-muted-foreground">
              Total Kelompok
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-2 rounded-full bg-success" />
              Kelompok Aktif
            </span>
            <span className="font-mono font-semibold text-success">
              {formatNumber(stats.active_groups)} /{' '}
              {formatNumber(stats.total_groups)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${activePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stat 2: Area Chart 5 Tahun Usulan */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tren Usulan Kebutuhan
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-info/10 text-info">
              <RiFileList3Line className="size-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
                {formatNumber(latestNeeds)}
              </span>
              <span className="text-xs text-muted-foreground">
                Usulan {latestTrend ? `(TA ${latestTrend.year})` : ''}
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              5 Thn
            </span>
          </div>
        </div>

        <div className="mt-2 h-20 w-full">
          {yearlyTrends.length > 0 ? (
            <ChartContainer
              config={needsChartConfig}
              className="aspect-auto h-20 w-full"
            >
              <AreaChart
                data={yearlyTrends}
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillNeeds5Yr" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--info)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--info)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted/30"
                />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  className="fill-muted-foreground font-mono text-[10px]"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(val) => `Tahun Anggaran ${val}`}
                      formatter={(val) => (
                        <span className="font-mono font-medium text-foreground">
                          {formatNumber(Number(val))} Usulan
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="total_needs"
                  type="monotone"
                  fill="url(#fillNeeds5Yr)"
                  fillOpacity={1}
                  stroke="var(--info)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground italic">
              Tidak ada data tren
            </div>
          )}
        </div>
      </div>

      {/* Stat 3: Area Chart 5 Tahun Anggaran */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tren Anggaran Usulan
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <RiCoinsLine className="size-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {formatCompactIDR(latestBudget)}
              </span>
              <span className="text-xs text-muted-foreground">
                {latestTrend ? `(TA ${latestTrend.year})` : ''}
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              5 Thn
            </span>
          </div>
        </div>

        <div className="mt-2 h-20 w-full">
          {yearlyTrends.length > 0 ? (
            <ChartContainer
              config={budgetChartConfig}
              className="aspect-auto h-20 w-full"
            >
              <AreaChart
                data={yearlyTrends}
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="fillBudget5Yr"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--warning)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--warning)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted/30"
                />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  className="fill-muted-foreground font-mono text-[10px]"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(val) => `Tahun Anggaran ${val}`}
                      formatter={(val) => (
                        <span className="font-mono font-medium text-foreground">
                          {formatIDR(Number(val))}
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="total_budget"
                  type="monotone"
                  fill="url(#fillBudget5Yr)"
                  fillOpacity={1}
                  stroke="var(--warning)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground italic">
              Tidak ada data tren
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
