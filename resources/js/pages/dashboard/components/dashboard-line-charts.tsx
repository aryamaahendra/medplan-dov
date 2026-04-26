import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  // Recharts renders data left-to-right, so we should reverse the data if it's descending order by year
  // Let's assume data is sorted by latest year first, we reverse it for chart to show chronological progression.
  const chartData = [...data].reverse();

  const chartConfig = {
    value: {
      label: 'Value',
      color: 'hsl(var(--primary))',
    },
  };

  const renderChart = (
    title: string,
    dataKey: keyof DashboardData,
    formatter: (v: any) => string,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    value.length > 10 ? value.slice(0, 10) + '...' : value
                  }
                  style={{ fontSize: '10px' }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value: any) => formatter(value)}
                />
                <Line
                  dataKey={dataKey}
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {renderChart('Total Usulan', 'total_needs', formatNumber)}
      {renderChart('Total Anggaran', 'total_budget', formatCompactIDR)}
      {renderChart('Usulan Prioritas', 'priority_needs', formatNumber)}
      {renderChart('Disetujui Direktur', 'approved_by_director', formatNumber)}
      {renderChart(
        'Rata-rata Kelengkapan',
        'avg_completeness',
        (v) => `${Math.round(v)}%`,
      )}
    </div>
  );
}
