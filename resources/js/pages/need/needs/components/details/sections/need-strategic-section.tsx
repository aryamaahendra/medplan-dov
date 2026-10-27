import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Need, Sasaran, StrategicServicePlan, Tujuan } from '@/types';

import { NeedIkkTable } from '../need-ikk-table';
import { NeedRenstraTable } from '../need-renstra-table';

interface NeedStrategicSectionProps {
  need: Need;
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
}

export function NeedStrategicSection({
  need,
  groupedRenstra,
}: NeedStrategicSectionProps) {
  const kpiIndicators = need.kpi_indicators || [];
  const rlsPlans = need.strategic_service_plans || [];

  const isEmpty =
    groupedRenstra.length === 0 &&
    kpiIndicators.length === 0 &&
    rlsPlans.length === 0;

  if (isEmpty) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground italic">
        Belum ada data penyelarasan Renstra, IKK, atau RLS pada usulan ini.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Rencana Strategis (Renstra) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Rencana Strategis (Renstra)
            </h4>
            <p className="text-xs text-muted-foreground">
              Tujuan, sasaran, dan indikator kinerja Renstra yang diselaraskan
              dengan usulan ini.
            </p>
          </div>
          {groupedRenstra.length > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              {groupedRenstra.length} Tujuan Terkait
            </span>
          )}
        </div>

        <NeedRenstraTable
          groupedRenstra={groupedRenstra}
          needYear={need.year}
        />
      </div>

      {/* 2. Indikator Kinerja Kunci (IKK) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Indikator Kinerja Kunci (IKK)
            </h4>
            <p className="text-xs text-muted-foreground">
              Target indikator kinerja utama periode berjalan yang didukung oleh
              usulan ini.
            </p>
          </div>
          {kpiIndicators.length > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              {kpiIndicators.length} Indikator Terkait
            </span>
          )}
        </div>

        <NeedIkkTable kpiIndicators={kpiIndicators} needYear={need.year} />
      </div>

      {/* 3. Rencana Layanan Strategis (RLS) */}
      {rlsPlans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Rencana Layanan Strategis (RLS)
              </h4>
              <p className="text-xs text-muted-foreground">
                Keterkaitan program strategis dan rencana pengembangan layanan.
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {rlsPlans.length} Rencana Terkait
            </span>
          </div>

          <RlsTable rlsPlans={rlsPlans} />
        </div>
      )}
    </div>
  );
}

function RlsTable({ rlsPlans }: { rlsPlans: StrategicServicePlan[] }) {
  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse [&_td]:border [&_td]:p-2.5 [&_td:first-child]:border-l-0 [&_td:last-child]:border-r-0 [&_th]:border [&_th]:p-2.5 [&_th:first-child]:border-l-0 [&_th:last-child]:border-r-0">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50px] border-r text-center font-semibold">
              No
            </TableHead>
            <TableHead className="min-w-[240px] border-r font-semibold">
              Program Strategis
            </TableHead>
            <TableHead className="min-w-[240px] border-r font-semibold">
              Rencana Layanan
            </TableHead>
            <TableHead className="w-[100px] border-r text-center font-semibold">
              Tahun
            </TableHead>
            <TableHead className="w-[120px] border-r text-center font-semibold">
              Target
            </TableHead>
            <TableHead className="min-w-[200px] font-semibold">
              Arah Kebijakan
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rlsPlans.map((plan, index) => (
            <TableRow
              key={plan.id}
              className="transition-colors hover:bg-muted/30"
            >
              <TableCell className="border-r text-center font-mono text-xs text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="border-r text-xs font-medium sm:text-sm">
                {plan.strategic_program}
              </TableCell>
              <TableCell className="border-r text-xs text-muted-foreground sm:text-sm">
                {plan.service_plan}
              </TableCell>
              <TableCell className="border-r text-center font-mono text-xs sm:text-sm">
                {plan.year}
              </TableCell>
              <TableCell className="border-r text-center font-mono text-xs sm:text-sm">
                {plan.target || '-'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground sm:text-sm">
                {plan.policy_direction || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
