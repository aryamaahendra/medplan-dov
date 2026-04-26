import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';

interface UnitData {
  name: string;
  count: number;
  total_budget: number;
  priority_count: number;
  approved_count: number;
}

interface DashboardData {
  needs_by_unit: UnitData[];
}

export function DashboardUnitCharts({ data }: { data: DashboardData }) {
  // Sort unit data appropriately or limit to top N.
  // For budget and count, sorting by value makes sense. Let's take top 10.
  const unitsByBudget = [...(data.needs_by_unit || [])]
    .sort((a, b) => b.total_budget - a.total_budget)
    .slice(0, 10);

  const unitsByCount = [...(data.needs_by_unit || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Priority vs Non-priority
  const stackedData = [...(data.needs_by_unit || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((unit) => ({
      name: unit.name,
      priority: unit.priority_count,
      non_priority: unit.count - unit.priority_count,
    }));

  const budgetConfig = {
    total_budget: { label: 'Anggaran', color: 'hsl(var(--chart-3))' },
  };

  const countConfig = {
    count: { label: 'Usulan', color: 'hsl(var(--chart-4))' },
  };

  const stackConfig = {
    priority: { label: 'Prioritas', color: 'hsl(var(--chart-5))' },
    non_priority: { label: 'Non-Prioritas', color: 'hsl(var(--chart-1))' },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top 10 Anggaran Berdasarkan Unit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer
                config={budgetConfig}
                className="h-[300px] w-full"
              >
                <BarChart
                  layout="vertical"
                  data={unitsByBudget}
                  margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value.length > 15 ? value.slice(0, 15) + '...' : value
                    }
                    style={{ fontSize: '11px' }}
                    width={100}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value: any) => formatCompactIDR(value)}
                  />
                  <Bar
                    dataKey="total_budget"
                    fill="var(--color-total_budget)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top 10 Jumlah Usulan Berdasarkan Unit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={countConfig} className="h-[300px] w-full">
                <BarChart
                  layout="vertical"
                  data={unitsByCount}
                  margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value.length > 15 ? value.slice(0, 15) + '...' : value
                    }
                    style={{ fontSize: '11px' }}
                    width={100}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value: any) => formatNumber(value)}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Prioritas vs Non-Prioritas per Unit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={stackConfig} className="h-[300px] w-full">
                <BarChart
                  layout="vertical"
                  data={stackedData}
                  margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value.length > 15 ? value.slice(0, 15) + '...' : value
                    }
                    style={{ fontSize: '11px' }}
                    width={100}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                  <Bar
                    dataKey="priority"
                    stackId="a"
                    fill="var(--color-priority)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="non_priority"
                    stackId="a"
                    fill="var(--color-non_priority)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
