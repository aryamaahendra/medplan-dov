import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
} from 'lucide-react';

import { StatsCard } from '@/components/dashboard/stats-card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIDR, formatNumber, formatPercent } from '@/lib/formatters';

interface NeedsStatsProps {
  stats?: {
    total_needs: number;
    total_budget: number;
    priority_needs: number;
    avg_completeness: number;
  };
}

export function NeedsStats({ stats }: NeedsStatsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
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
  );
}
