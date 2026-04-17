import { Head, router } from '@inertiajs/react';
import {
  ClipboardCheck,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DistributionChart } from '@/components/dashboard/distribution-chart';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatIDR, formatNumber, formatPercent } from '@/lib/formatters';
import { dashboard } from '@/routes';

interface NeedGroup {
  id: number;
  name: string;
  year: number;
}

interface Need {
  id: number;
  title: string;
  status: string;
  total_price: number;
  organizational_unit?: { name: string };
  need_type?: { name: string };
  created_at: string;
}

interface DashboardProps {
  stats: {
    total_needs: number;
    total_budget: number;
    priority_needs: number;
    avg_completeness: number;
  };
  statusDistribution: Record<string, number>;
  needsByUnit: { name: string; count: number }[];
  needsByType: { name: string; count: number }[];
  recentNeeds: Need[];
  needGroups: NeedGroup[];
  filters: {
    need_group_id: string | number | null;
  };
}

export default function Dashboard({
  stats,
  statusDistribution,
  needsByUnit,
  needsByType,
  recentNeeds,
  needGroups,
  filters,
}: DashboardProps) {
  const handleGroupChange = (value: string) => {
    router.get(dashboard(), { need_group_id: value }, { preserveState: true });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        {/* Header & Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard Ringkasan
            </h1>
            <p className="text-muted-foreground">
              Gambaran umum usulan kebutuhan dan status perencanaan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Tahun / Kelompok:
            </span>
            <Select
              value={filters.need_group_id?.toString() || ''}
              onValueChange={handleGroupChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Kelompok" />
              </SelectTrigger>
              <SelectContent>
                {needGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name} ({group.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Usulan"
            value={formatNumber(stats.total_needs)}
            icon={ClipboardCheck}
            description="Jumlah keseluruhan usulan kebutuhan"
          />
          <StatsCard
            title="Total Estimasi Anggaran"
            value={formatIDR(stats.total_budget)}
            icon={DollarSign}
            description="Total rencana anggaran yang diusulkan"
            iconClassName="bg-emerald-500/10"
          />
          <StatsCard
            title="Usulan Prioritas"
            value={formatNumber(stats.priority_needs)}
            icon={AlertCircle}
            description="Kebutuhan dengan tingkat urgensi tinggi"
            iconClassName="bg-amber-500/10"
          />
          <StatsCard
            title="Rata-rata Kelengkapan"
            value={formatPercent(stats.avg_completeness)}
            icon={CheckCircle2}
            description="Persentase pemenuhan checklist"
            iconClassName="bg-blue-500/10"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DistributionChart
            title="Distribusi Status"
            data={statusDistribution}
            color="bg-blue-500"
          />
          <DistributionChart
            title="Top 5 Unit Pengusul"
            data={needsByUnit.slice(0, 5)}
            color="bg-indigo-500"
          />
          <DistributionChart
            title="Berdasarkan Tipe"
            data={needsByType}
            color="bg-purple-500"
          />
        </div>

        {/* Recent Activity Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="size-5 text-muted-foreground" />
              Usulan Terbaru
            </h2>
          </div>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Usulan</TableHead>
                  <TableHead>Unit Kerja</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Total (IDR)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNeeds.length > 0 ? (
                  recentNeeds.map((need) => (
                    <TableRow key={need.id}>
                      <TableCell className="font-medium">
                        {need.title}
                      </TableCell>
                      <TableCell>
                        {need.organizational_unit?.name || '-'}
                      </TableCell>
                      <TableCell>{need.need_type?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        {formatIDR(need.total_price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(need.status)}>
                          {need.status.charAt(0).toUpperCase() +
                            need.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Belum ada data usulan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}

Dashboard.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: dashboard(),
    },
  ],
};
