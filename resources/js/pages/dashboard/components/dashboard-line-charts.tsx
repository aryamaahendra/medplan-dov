import { Area, AreaChart, XAxis } from 'recharts';
import {
  Card,
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
import { formatCompactIDR, formatNumber } from '@/lib/formatters';

interface DashboardData {
  id: number;
  name: string;
  year: number;
  total_needs: number;
  total_budget: number;
  priority_needs: number;
  approved_by_director: number;
  avg_completeness: number;
}

export function DashboardLineCharts({ data }: { data: DashboardData[] }) {
  const chartData = [...data].reverse();

  const renderChart = (
    title: string,
    description: string,
    dataKey: keyof DashboardData,
    formatter: (v: any) => string,
    color: string,
  ) => {
    const config = {
      [dataKey]: {
        label: title,
        color,
      },
    };

    return (
      <Card className="overflow-hidden pt-3 pb-0">
        <CardHeader className="px-3 pt-0">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="text-xs leading-tight">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer config={config} className="h-[80px] w-full">
            <AreaChart
              data={chartData}
              margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`fill-${dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${dataKey as string})`}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${dataKey as string})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value: any) => formatter(value)}
              />
              <Area
                dataKey={dataKey as string}
                type="natural"
                fill={`url(#fill-${dataKey})`}
                fillOpacity={1}
                stroke={`var(--color-${dataKey as string})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {renderChart(
        'Total Usulan',
        'Jumlah item usulan dari seluruh unit',
        'total_needs',
        formatNumber,
        'hsl(var(--chart-1))',
      )}
      {renderChart(
        'Total Anggaran',
        'Total nilai rupiah rencana belanja',
        'total_budget',
        formatCompactIDR,
        'hsl(var(--chart-2))',
      )}
      {renderChart(
        'Usulan Prioritas',
        'Item yang ditandai mendesak/penting',
        'priority_needs',
        formatNumber,
        'hsl(var(--chart-3))',
      )}
      {renderChart(
        'Disetujui Direktur',
        'Usulan yang sudah diverifikasi pimpinan',
        'approved_by_director',
        formatNumber,
        'hsl(var(--chart-4))',
      )}
      {renderChart(
        'Rata-rata Kelengkapan',
        'Persentase pengisian checklist instrumen',
        'avg_completeness',
        (v) => `${Math.round(v)}%`,
        'hsl(var(--chart-5))',
      )}
    </div>
  );
}
