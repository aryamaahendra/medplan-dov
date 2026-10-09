import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { KpiIndicatorTree } from '@/components/kpis/kpi-indicator-tree';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { KpiGroupInfo } from '@/features/kpi-group/components/kpi-group-info';
import { KpiIndicatorDialog } from '@/features/kpi-group/components/kpi-indicator-dialog';
import { useKpiGroupShow } from '@/features/kpi-group/hooks/use-kpi-group-show';
import { usePermission } from '@/hooks/use-permission';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup } from '@/types';

interface KpiGroupShowProps {
  group: KpiGroup;
}

export default function KpiGroupShow({ group }: KpiGroupShowProps) {
  const { hasPermission } = usePermission();
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

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Struktur Indikator
              </h2>
              <p className="text-xs text-muted-foreground italic">
                {indicators.length} indikator/kategori ditemukan.
              </p>
            </div>
            {hasPermission('create kpi-indicators') && (
              <Button onClick={handlers.onCreateIndicator}>
                <RiAddLine data-icon="inline-start" />
                Tambah Indikator Utama
              </Button>
            )}
          </div>

          <KpiIndicatorTree
            indicators={indicators}
            yearStart={group.start_year}
            yearEnd={group.end_year}
            onEdit={
              hasPermission('update kpi-indicators')
                ? handlers.onEditIndicator
                : undefined
            }
            onCreateChild={
              hasPermission('create kpi-indicators')
                ? handlers.onCreateChildIndicator
                : undefined
            }
            onCreateFirst={
              hasPermission('create kpi-indicators')
                ? handlers.onCreateIndicator
                : undefined
            }
            emptyMessage="Belum ada indikator atau kategori untuk periode ini."
          />
        </div>
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
