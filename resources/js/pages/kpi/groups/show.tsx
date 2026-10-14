import { Head } from '@inertiajs/react';

import { Separator } from '@/components/ui/separator';
import { KpiGroupInfo } from '@/features/kpi-group/components/kpi-group-info';
import { KpiIndicatorDialog } from '@/features/kpi-group/components/kpi-indicator-dialog';
import { KpiIndicatorsSection } from '@/features/kpi-group/components/kpi-indicators-section';
import { useKpiGroupShow } from '@/features/kpi-group/hooks/use-kpi-group-show';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup } from '@/types';

interface KpiGroupShowProps {
  group: KpiGroup;
}

export default function KpiGroupShow({ group }: KpiGroupShowProps) {
  const { state, handlers } = useKpiGroupShow();
  const indicators = group.indicators || [];

  return (
    <>
      <Head title={`Detail Periode KPI: ${group.name}`} />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Detail Periode KPI
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola struktur indikator dan target tahunan untuk periode ini.
            </p>
          </div>
        </div>

        <KpiGroupInfo group={group} />

        <Separator />

        <KpiIndicatorsSection
          group={group}
          indicators={indicators}
          view={state.view}
          onViewChange={handlers.setView}
          onCreateIndicator={handlers.onCreateIndicator}
          onEditIndicator={handlers.onEditIndicator}
          onCreateChildIndicator={handlers.onCreateChildIndicator}
        />
      </div>

      <KpiIndicatorDialog
        open={state.indicatorDialogOpen}
        onOpenChange={handlers.setIndicatorDialogOpen}
        group={group}
        parentIndicator={state.parentIndicator}
        indicator={state.editingIndicator}
      />
    </>
  );
}

KpiGroupShow.layout = {
  breadcrumbs: [
    {
      title: 'Manajemen KPI',
    },
    {
      title: 'Periode',
      href: groupRoutes.index.url(),
    },
    {
      title: 'Detail',
    },
  ],
};
