import {
  RiFolderChartLine,
  RiFileList3Line,
  RiCoinsLine,
} from '@remixicon/react';
import type { ReactNode } from 'react';
import { Area, AreaChart } from 'recharts';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
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

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}

function StatCard({
  title,
  value,
  subtitle,
  badge,
  icon,
  children,
}: StatCardProps) {
  return (
    <Card className="justify-between py-0">
      <CardHeader className="px-4 pt-4">
        <CardDescription className="text-xs font-semibold tracking-wider uppercase">
          {title}
        </CardDescription>
        {icon ? (
          <CardAction>{icon}</CardAction>
        ) : badge ? (
          <CardAction>{badge}</CardAction>
        ) : null}
        <CardTitle className="flex items-baseline justify-between gap-2 pt-1 font-heading text-3xl font-extrabold tracking-tight">
          <div className="flex items-baseline gap-1.5">
            <span>{value}</span>
            {subtitle ? (
              <span className="text-xs font-normal text-muted-foreground">
                {subtitle}
              </span>
            ) : null}
          </div>
          {icon && badge ? badge : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

export function NeedGroupsSummaryStats({ stats }: NeedGroupsSummaryStatsProps) {
  const groupTrends = stats.group_trends ?? stats.yearly_trends ?? [];
  const latestTrend = groupTrends[groupTrends.length - 1];

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
      <StatCard
        title="Kelompok Usulan"
        value={formatNumber(stats.total_groups)}
        subtitle="Total Kelompok"
        icon={
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <RiFolderChartLine className="size-4" />
          </div>
        }
      >
        <div className="flex flex-col gap-2 border-t border-border/60 px-4 py-4">
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
      </StatCard>

      {/* Stat 2: Area Chart 5 Tahun Usulan */}
      <StatCard
        title="Tren Usulan Kebutuhan"
        value={formatNumber(latestNeeds)}
        subtitle={
          latestTrend?.name
            ? `(${latestTrend.name})`
            : latestTrend?.year
              ? `(TA ${latestTrend.year})`
              : undefined
        }
        icon={
          <div className="flex size-8 items-center justify-center rounded-lg bg-info/10 text-info">
            <RiFileList3Line className="size-4" />
          </div>
        }
      >
        <div className="h-20 w-full">
          {groupTrends.length > 0 ? (
            <ChartContainer
              config={needsChartConfig}
              className="aspect-auto h-20 w-full"
            >
              <AreaChart
                data={groupTrends}
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
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload as
                          (typeof groupTrends)[number] | undefined;

                        if (!item) {
return '';
}

                        return item.year
                          ? `${item.name ?? 'Kelompok Usulan'} (TA ${item.year})`
                          : (item.name ?? '');
                      }}
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
      </StatCard>

      {/* Stat 3: Area Chart 5 Tahun Anggaran */}
      <StatCard
        title="Tren Anggaran Usulan"
        value={
          <span className="text-2xl">{formatCompactIDR(latestBudget)}</span>
        }
        subtitle={
          latestTrend?.name
            ? `(${latestTrend.name})`
            : latestTrend?.year
              ? `(TA ${latestTrend.year})`
              : undefined
        }
        icon={
          <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <RiCoinsLine className="size-4" />
          </div>
        }
      >
        <div className="h-20 w-full">
          {groupTrends.length > 0 ? (
            <ChartContainer
              config={budgetChartConfig}
              className="aspect-auto h-20 w-full"
            >
              <AreaChart
                data={groupTrends}
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
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload as
                          (typeof groupTrends)[number] | undefined;

                        if (!item) {
return '';
}

                        return item.year
                          ? `${item.name ?? 'Kelompok Usulan'} (TA ${item.year})`
                          : (item.name ?? '');
                      }}
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
      </StatCard>
    </div>
  );
}
