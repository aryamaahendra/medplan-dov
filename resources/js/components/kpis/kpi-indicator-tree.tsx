import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildIndicatorTree, classifyIndicators } from '@/lib/kpi-utils';
import type { KpiIndicator } from '@/types';
import { IndicatorCard } from './indicator-card';
import { IndicatorTable } from './indicator-table';

interface KpiIndicatorTreeProps {
  indicators: KpiIndicator[];
  yearStart?: number;
  yearEnd?: number;
  emptyMessage?: string;
  onEdit?: (indicator: KpiIndicator) => void;
  onDelete?: (indicator: KpiIndicator) => void;
  onCreateChild?: (parent: KpiIndicator) => void;
  onCreateFirst?: () => void;
}

export function KpiIndicatorTree({
  indicators,
  yearStart,
  yearEnd,
  emptyMessage = 'Belum ada indikator atau kategori.',
  onEdit,
  onDelete,
  onCreateChild,
  onCreateFirst,
}: KpiIndicatorTreeProps) {
  const { categories, standaloneIndicators, treeLength } = useMemo(() => {
    const tree = buildIndicatorTree(indicators);
    const { categories, standaloneIndicators } = classifyIndicators(tree);

    return { categories, standaloneIndicators, treeLength: tree.length };
  }, [indicators]);

  if (treeLength === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
        {onCreateFirst && (
          <Button variant="link" onClick={onCreateFirst} className="mt-2">
            Buat indikator pertama
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {standaloneIndicators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Indikator</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="border-y">
              <IndicatorTable
                indicators={standaloneIndicators}
                onEdit={onEdit}
                onDelete={onDelete}
                yearStart={yearStart}
                yearEnd={yearEnd}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {categories.map((indicator) => (
        <IndicatorCard
          key={indicator.id}
          indicator={indicator}
          yearStart={yearStart}
          yearEnd={yearEnd}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateChild={onCreateChild}
        />
      ))}
    </div>
  );
}
