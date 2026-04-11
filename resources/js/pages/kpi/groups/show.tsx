import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { KpiIndicatorTree } from '@/components/kpis/kpi-indicator-tree';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup, KpiIndicator } from '@/types';

import { KpiGroupInfo } from './components/kpi-group-info';
import { KpiIndicatorDialog } from './components/kpi-indicator-dialog';

interface KpiGroupShowProps {
  group: KpiGroup;
}

export default function KpiGroupShow({ group }: KpiGroupShowProps) {
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<KpiIndicator | null>(
    null,
  );
  const [parentIndicator, setParentIndicator] = useState<KpiIndicator | null>(
    null,
  );

  const onCreateIndicator = () => {
    setParentIndicator(null);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onCreateChildIndicator = (parent: KpiIndicator) => {
    setParentIndicator(parent);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onEditIndicator = (indicator: KpiIndicator) => {
    setParentIndicator(null);
    setEditingIndicator(indicator);
    setIndicatorDialogOpen(true);
  };

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
            <Button onClick={onCreateIndicator}>
              <Plus />
              Tambah Indikator Utama
            </Button>
          </div>

          <KpiIndicatorTree
            indicators={indicators}
            yearStart={group.start_year}
            yearEnd={group.end_year}
            onEdit={onEditIndicator}
            onCreateChild={onCreateChildIndicator}
            onCreateFirst={onCreateIndicator}
            emptyMessage="Belum ada indikator atau kategori untuk periode ini."
          />
        </div>
      </div>

      <KpiIndicatorDialog
        open={indicatorDialogOpen}
        onOpenChange={setIndicatorDialogOpen}
        group={group}
        parentIndicator={parentIndicator}
        indicator={editingIndicator}
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
