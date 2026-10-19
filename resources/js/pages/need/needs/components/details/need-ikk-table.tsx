import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { KpiIndicator } from '@/types';

interface NeedIkkTableProps {
  kpiIndicators: KpiIndicator[];
  needYear?: number;
}

export function NeedIkkTable({ kpiIndicators, needYear }: NeedIkkTableProps) {
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const set = new Set<number>();
    kpiIndicators.forEach((kpi) => {
      if (kpi.group?.start_year && kpi.group?.end_year) {
        for (let y = kpi.group.start_year; y <= kpi.group.end_year; y++) {
          set.add(y);
        }
      }

      kpi.annual_targets?.forEach((at) => {
        if (at.year) {
          set.add(at.year);
        }
      });
    });

    if (needYear) {
      set.add(needYear);
    }

    if (set.size === 0) {
      set.add(currentYear);
    }

    return Array.from(set).sort((a, b) => a - b);
  }, [kpiIndicators, needYear, currentYear]);

  // Group indicators by parent category or standalone
  const organizedItems = useMemo(() => {
    const categoriesMap = new Map<
      number | string,
      {
        id: number | string;
        name: string;
        isCategory: boolean;
        indicators: KpiIndicator[];
      }
    >();

    kpiIndicators.forEach((kpi) => {
      const parent = kpi.parent_indicator || kpi.parentIndicator;
      const parentId = kpi.parent_indicator_id;

      if (parentId && parent) {
        if (!categoriesMap.has(parentId)) {
          categoriesMap.set(parentId, {
            id: parentId,
            name: parent.name,
            isCategory: true,
            indicators: [],
          });
        }

        categoriesMap.get(parentId)!.indicators.push(kpi);
      } else if (kpi.is_category) {
        if (!categoriesMap.has(kpi.id)) {
          categoriesMap.set(kpi.id, {
            id: kpi.id,
            name: kpi.name,
            isCategory: true,
            indicators: [],
          });
        }
      } else {
        const standaloneKey = `standalone-${kpi.id}`;
        categoriesMap.set(standaloneKey, {
          id: standaloneKey,
          name: '',
          isCategory: false,
          indicators: [kpi],
        });
      }
    });

    return Array.from(categoriesMap.values());
  }, [kpiIndicators]);

  if (kpiIndicators.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground italic sm:text-sm">
        Belum ada Indikator Kinerja Kunci (IKK) yang diselaraskan dengan usulan
        ini.
      </div>
    );
  }

  let globalIndex = 0;

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse [&_td]:border [&_td]:p-2.5 [&_td:first-child]:border-l-0 [&_td:last-child]:border-r-0 [&_th]:border [&_th]:p-2.5 [&_th:first-child]:border-l-0 [&_th:last-child]:border-r-0">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead
              rowSpan={2}
              className="w-[60px] border-r text-center font-semibold"
            >
              No
            </TableHead>
            <TableHead
              rowSpan={2}
              className="min-w-[280px] border-r font-semibold"
            >
              Kategori & Indikator Kunci (IKK)
            </TableHead>
            <TableHead
              rowSpan={2}
              className="w-[100px] border-r text-center font-semibold"
            >
              Satuan
            </TableHead>
            <TableHead
              rowSpan={2}
              className="w-[100px] border-r text-center font-semibold"
            >
              Baseline
            </TableHead>
            {years.length > 0 && (
              <TableHead
                colSpan={years.length}
                className="border-r border-b text-center font-semibold"
              >
                Target Tahunan
              </TableHead>
            )}
          </TableRow>
          {years.length > 0 && (
            <TableRow>
              {years.map((year) => {
                const isCurrent = year === currentYear;

                return (
                  <TableHead
                    key={year}
                    className={cn(
                      'w-20 border-r text-center transition-colors',
                      isCurrent &&
                        'bg-primary/5 font-bold text-primary-foreground',
                    )}
                  >
                    {year}
                  </TableHead>
                );
              })}
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {organizedItems.map((group) => {
            const isGroupHeader = group.isCategory && group.name;

            return (
              <React.Fragment key={group.id}>
                {isGroupHeader && (
                  <TableRow className="bg-muted/40 font-medium">
                    <TableCell className="border-r text-center font-mono text-xs text-muted-foreground">
                      -
                    </TableCell>
                    <TableCell colSpan={3 + years.length} className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground sm:text-sm">
                          {group.name}
                        </span>
                        <Badge variant="secondary" className="text-xss">
                          Kategori
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {group.indicators.map((kpi) => {
                  globalIndex += 1;
                  const hasParentCategory = isGroupHeader;

                  return (
                    <TableRow
                      key={kpi.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="border-r text-center font-mono text-xs text-muted-foreground">
                        {globalIndex}
                      </TableCell>

                      <TableCell className="border-r">
                        <div
                          className={cn(
                            'flex items-center gap-2',
                            hasParentCategory && 'pl-4',
                          )}
                        >
                          <span className="text-xs leading-snug text-foreground sm:text-sm">
                            {kpi.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="border-r text-center font-mono text-xs sm:text-sm">
                        {kpi.unit || '-'}
                      </TableCell>

                      <TableCell className="border-r text-center font-mono text-xs sm:text-sm">
                        {kpi.baseline_value || '-'}
                      </TableCell>

                      {years.map((year) => {
                        const target = kpi.annual_targets?.find(
                          (t) => t.year === year,
                        );
                        const isCurrent = year === currentYear;

                        return (
                          <TableCell
                            key={year}
                            className={cn(
                              'border-r text-center font-mono text-xs whitespace-nowrap transition-colors sm:text-sm',
                              isCurrent &&
                                'bg-primary/5 font-bold text-primary-foreground',
                            )}
                          >
                            {target?.target_value ? (
                              <span
                                className={cn(
                                  isCurrent &&
                                    'inline-block rounded bg-primary/5 px-1.5 py-0.5 font-semibold text-primary-foreground',
                                )}
                              >
                                {target.target_value}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
