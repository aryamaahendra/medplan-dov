import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCompactIDR } from '@/lib/formatters';

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

export function DashboardCrossGroupCharts({ data }: { data: DashboardData[] }) {
  // Chart 12: Radar Chart (Latest group normalized)
  // Recharts Radar needs multiple metrics mapped onto axis.
  // We'll compare the latest 3 groups across 4 normalized metrics (0-100 scale).

  const latestGroups = [...data].slice(0, 3);

  // Find max values to normalize
  const maxNeeds = Math.max(1, ...latestGroups.map((g) => g.total_needs));
  const maxBudget = Math.max(1, ...latestGroups.map((g) => g.total_budget));

  const radarData = [
    {
      subject: 'Volume Usulan',
      ...latestGroups.reduce(
        (acc, g) => ({ ...acc, [g.name]: (g.total_needs / maxNeeds) * 100 }),
        {},
      ),
    },
    {
      subject: 'Anggaran',
      ...latestGroups.reduce(
        (acc, g) => ({ ...acc, [g.name]: (g.total_budget / maxBudget) * 100 }),
        {},
      ),
    },
    {
      subject: 'Rasio Prioritas',
      ...latestGroups.reduce(
        (acc, g) => ({
          ...acc,
          [g.name]: g.total_needs
            ? (g.priority_needs / g.total_needs) * 100
            : 0,
        }),
        {},
      ),
    },
    {
      subject: 'Kelengkapan',
      ...latestGroups.reduce(
        (acc, g) => ({ ...acc, [g.name]: g.avg_completeness }),
        {},
      ),
    },
    {
      subject: 'Tingkat Persetujuan',
      ...latestGroups.reduce(
        (acc, g) => ({
          ...acc,
          [g.name]: g.total_needs
            ? (g.approved_by_director / g.total_needs) * 100
            : 0,
        }),
        {},
      ),
    },
  ];

  const radarConfig = latestGroups.reduce(
    (acc, g, i) => {
      return {
        ...acc,
        [g.name]: { label: g.name, color: `hsl(var(--chart-${i + 1}))` },
      };
    },
    {} as Record<string, any>,
  );

  // Chart 14: Scatter — Budget vs Priority Rate
  // We'll plot each group as a dot.
  const scatterData = data.map((g) => ({
    name: g.name,
    budget: g.total_budget,
    priorityRate: g.total_needs ? (g.priority_needs / g.total_needs) * 100 : 0,
    z: g.total_needs, // Size of bubble
  }));

  const scatterConfig = {
    budget: { label: 'Anggaran', color: 'hsl(var(--chart-1))' },
    priorityRate: { label: 'Prioritas (%)', color: 'hsl(var(--chart-2))' },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Analisis Multi-Dimensi (Top 3 Kelompok)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={radarConfig} className="h-[300px] w-full">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={radarData}
                >
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="subject"
                    style={{ fontSize: '10px' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {latestGroups.map((g) => (
                    <Radar
                      key={g.id}
                      name={g.name}
                      dataKey={g.name}
                      stroke={`var(--color-${g.name.replace(/\s+/g, '')})`}
                      fill={`var(--color-${g.name.replace(/\s+/g, '')})`}
                      fillOpacity={0.3}
                    />
                  ))}
                </RadarChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Korelasi Anggaran & Tingkat Prioritas (Semua Kelompok)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer
                config={scatterConfig}
                className="h-[300px] w-full"
              >
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="budget"
                    name="Anggaran"
                    tickFormatter={formatCompactIDR}
                    style={{ fontSize: '10px' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="priorityRate"
                    name="Rasio Prioritas"
                    unit="%"
                    style={{ fontSize: '10px' }}
                  />
                  <ZAxis
                    type="number"
                    dataKey="z"
                    range={[50, 400]}
                    name="Volume Usulan"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;

                        return (
                          <div className="rounded-lg border bg-background p-2 text-xs shadow-sm">
                            <div className="font-semibold">{data.name}</div>
                            <div>Anggaran: {formatCompactIDR(data.budget)}</div>
                            <div>
                              Prioritas: {Math.round(data.priorityRate)}%
                            </div>
                            <div>Usulan: {data.z}</div>
                          </div>
                        );
                      }

                      return null;
                    }}
                  />
                  <Scatter
                    name="Kelompok"
                    data={scatterData}
                    fill="hsl(var(--chart-1))"
                  />
                </ScatterChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
