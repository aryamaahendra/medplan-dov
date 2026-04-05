import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup, KpiIndicator } from '@/types';

import { IndicatorCard } from './components/indicator-card';
import { IndicatorTable } from './components/indicator-table';
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

  // Build Indicator Tree from flat list
  const indicatorTree = useMemo(() => {
    const indicators = group.indicators || [];
    const map = new Map<number, KpiIndicator>();
    const roots: KpiIndicator[] = [];

    // First pass: map all indicators
    indicators.forEach((indicator) => {
      map.set(indicator.id, { ...indicator, indicators: [] });
    });

    // Second pass: build tree
    indicators.forEach((indicator) => {
      const node = map.get(indicator.id)!;

      if (
        indicator.parent_indicator_id &&
        map.has(indicator.parent_indicator_id)
      ) {
        const parent = map.get(indicator.parent_indicator_id)!;
        parent.indicators = parent.indicators || [];
        parent.indicators.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [group.indicators]);

  const { categories, standaloneIndicators } = useMemo(() => {
    const categories: KpiIndicator[] = [];
    const standaloneIndicators: KpiIndicator[] = [];

    indicatorTree.forEach((node) => {
      if (node.is_category) {
        categories.push(node);
      } else {
        standaloneIndicators.push(node);
      }
    });

    return { categories, standaloneIndicators };
  }, [indicatorTree]);

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
                {indicatorTree.length} kategori/indikator utama ditemukan.
              </p>
            </div>
            <Button onClick={onCreateIndicator}>
              <Plus />
              Tambah Indikator Utama
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            {indicatorTree.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center text-muted-foreground">
                <p>Belum ada indikator atau kategori untuk periode ini.</p>
                <Button variant="link" onClick={onCreateIndicator}>
                  Buat indikator pertama
                </Button>
              </div>
            ) : (
              <>
                {standaloneIndicators.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Indikator</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <div className="border-y">
                        <IndicatorTable
                          indicators={standaloneIndicators}
                          onEdit={onEditIndicator}
                          yearStart={group.start_year}
                          yearEnd={group.end_year}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {categories.map((indicator) => (
                  <IndicatorCard
                    key={indicator.id}
                    group={group}
                    indicator={indicator}
                    onEdit={onEditIndicator}
                    onCreateChild={onCreateChildIndicator}
                  />
                ))}
              </>
            )}
          </div>
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
