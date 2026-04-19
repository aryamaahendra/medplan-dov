import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KpiIndicator } from '@/types';
import type { Need } from '@/types';

interface IkkAlignmentShowProps {
  need: Need;
}

export function IkkAlignmentShow({ need }: IkkAlignmentShowProps) {
  const groups = useMemo(() => {
    const kpis = need.kpi_indicators || [];

    if (kpis.length === 0) {
      return [];
    }

    // Group by KPI Group (Period)
    const groupMap = new Map<number, { group: any; categories: any[] }>();

    kpis.forEach((kpi) => {
      const groupId = kpi.group?.id || 0;

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          group: kpi.group,
          categories: [],
        });
      }

      const currentGroup = groupMap.get(groupId)!;
      const parentId = kpi.parent_indicator_id;
      const parentName = (kpi as any).parent_indicator?.name || 'Lainnya';

      let category = currentGroup.categories.find(
        (c) => c.parentId === parentId,
      );

      if (!category) {
        category = {
          parentId,
          parentName,
          indicators: [],
        };
        currentGroup.categories.push(category);
      }

      category.indicators.push(kpi);
    });

    return Array.from(groupMap.values());
  }, [need.kpi_indicators]);

  return (
    <div className="pt-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Penyelarasan KPI (IKK)</h2>
        <p className="text-sm text-muted-foreground">
          Hubungan usulan dengan Indikator Kinerja Kunci (IKK) organisasi.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((groupData) => (
              <Card
                key={groupData.group?.id || 0}
                className="gap-0 overflow-hidden p-0"
              >
                <CardHeader className="border-b bg-muted/30 p-4">
                  <CardTitle className="text-sm">
                    Periode KPI: {groupData.group?.name || 'Tidak Ada'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {groupData.categories.map((category) => (
                      <CategoryItem
                        key={category.parentId || 'standalone'}
                        category={category}
                        years={
                          groupData.group
                            ? Array.from(
                                {
                                  length:
                                    groupData.group.end_year -
                                    groupData.group.start_year +
                                    1,
                                },
                                (_, i) => groupData.group.start_year + i,
                              )
                            : []
                        }
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada Indikator KPI (IKK) yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CategoryItem({ category, years }: { category: any; years: number[] }) {
  return (
    <div>
      {category.parentId && (
        <div className="flex items-center gap-2.5 border-b bg-muted/10 px-4 py-3">
          <span className="text-sm">Kategori: {category.parentName}</span>
        </div>
      )}

      <div className="bg-muted pl-4">
        <div className="border-l bg-background">
          {category.indicators.map((indicator: KpiIndicator) => (
            <KpiIndicatorItem
              key={indicator.id}
              indicator={indicator}
              years={years}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiIndicatorItem({
  indicator,
  years,
}: {
  indicator: KpiIndicator;
  years: number[];
}) {
  return (
    <div className="group/indicator border-b last:border-b-0">
      <div className="border-b p-3">
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm font-medium">{indicator.name}</span>
          {indicator.unit && (
            <Badge variant={'outline'}>Unit: {indicator.unit}</Badge>
          )}
        </div>
      </div>

      <div className="no-scrollbar flex overflow-x-auto">
        <IndicatorMetric
          label="Baseline"
          value={indicator.baseline_value || '-'}
        />

        {years.length > 0 ? (
          years.map((year) => {
            const target = indicator.annual_targets?.find(
              (t) => t.year === year,
            );

            return (
              <IndicatorMetric
                key={year}
                label={year}
                value={target?.target_value || '-'}
                isPrimary
              />
            );
          })
        ) : (
          <div className="px-4 py-3 text-[10px] font-medium text-muted-foreground/60 italic">
            Belum ada target tahunan
          </div>
        )}
      </div>
    </div>
  );
}

function IndicatorMetric({
  label,
  value,
  isPrimary = false,
}: {
  label: string | number;
  value: string;
  isPrimary?: boolean;
}) {
  return (
    <div className="min-w-22 flex-1 border-r px-4 py-2 last:border-r-0">
      <p className="text-xs whitespace-nowrap text-muted-foreground/60">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-semibold whitespace-nowrap ${isPrimary ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </p>
    </div>
  );
}
