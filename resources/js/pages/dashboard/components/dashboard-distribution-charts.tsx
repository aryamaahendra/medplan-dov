import {
  Pie,
  PieChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface DashboardData {
  status_distribution: Record<string, number>;
  needs_by_type: { name: string; count: number }[];
}

export function DashboardDistributionCharts({ data }: { data: DashboardData }) {
  // Process status data for bar chart
  const statusData = Object.entries(data.status_distribution || {}).map(
    ([status, count]) => ({
      status,
      count,
    }),
  );

  const statusConfig = {
    count: {
      label: 'Jumlah',
      color: 'hsl(var(--chart-2))',
    },
  };

  // Process needs by type for pie chart
  const typesData = (data.needs_by_type || []).map((type, i) => ({
    name: type.name,
    count: type.count,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  const typesConfig = {
    count: { label: 'Jumlah', color: 'hsl(var(--chart-1))' },
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Distribusi Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer
                config={statusConfig}
                className="h-[250px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={statusData}
                  margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    style={{ fontSize: '11px', textTransform: 'capitalize' }}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
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
            Kebutuhan Berdasarkan Jenis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={typesConfig} className="h-[250px] w-full">
                <PieChart margin={{ top: 10, bottom: 10 }}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={typesData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {typesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
