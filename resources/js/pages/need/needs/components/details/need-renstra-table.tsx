import { useMemo } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Indicator, Sasaran, Tujuan } from '@/types';

interface NeedRenstraTableProps {
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  needYear?: number;
}

export function NeedRenstraTable({
  groupedRenstra,
  needYear,
}: NeedRenstraTableProps) {
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const set = new Set<number>();
    groupedRenstra.forEach((tujuan) => {
      tujuan.sasarans?.forEach((sasaran) => {
        sasaran.indicators?.forEach((ind) => {
          ind.targets?.forEach((tgt) => {
            if (tgt.year) {
              set.add(tgt.year);
            }
          });
        });
      });
    });

    if (needYear) {
      set.add(needYear);
    }

    if (set.size === 0) {
      set.add(currentYear);
    }

    return Array.from(set).sort((a, b) => a - b);
  }, [groupedRenstra, needYear, currentYear]);

  if (groupedRenstra.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground italic sm:text-sm">
        Belum ada indikator Renstra yang diselaraskan dengan usulan ini.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 sm:p-2">
        <div className="overflow-x-auto">
          <Table className="border-collapse [&_td]:border [&_td]:p-2.5 [&_td:first-child]:border-l-0 [&_td:last-child]:border-r-0 [&_th]:border [&_th]:p-2.5 [&_th:first-child]:border-l-0 [&_th:last-child]:border-r-0">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead
                  rowSpan={2}
                  className="min-w-[200px] border-r font-semibold"
                >
                  Tujuan Renstra
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="min-w-[220px] border-r font-semibold"
                >
                  Sasaran
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="min-w-[240px] border-r font-semibold"
                >
                  Indikator Kinerja
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
                          'w-[80px] border-r text-center transition-colors',
                          isCurrent &&
                            'bg-primary/15 font-bold text-primary ring-1 ring-primary/30 ring-inset',
                        )}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{year}</span>
                          {isCurrent && (
                            <span className="py-0.2 rounded-full bg-primary/20 px-1.5 text-[9px] font-semibold text-primary">
                              Saat ini
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {groupedRenstra.map((tujuan) => (
                <TujuanTableRows
                  key={tujuan.id}
                  tujuan={tujuan}
                  years={years}
                  currentYear={currentYear}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function TujuanTableRows({
  tujuan,
  years,
  currentYear,
}: {
  tujuan: Tujuan & { sasarans: Sasaran[] };
  years: number[];
  currentYear: number;
}) {
  const sasarans = tujuan.sasarans || [];

  // Calculate total rows for this Tujuan
  const totalRows = Math.max(
    1,
    sasarans.reduce(
      (total, sasaran) =>
        total + Math.max(1, (sasaran.indicators || []).length),
      0,
    ),
  );

  const renderTujuanCell = (currentRowCount: number) => {
    if (currentRowCount > 0) {
      return null;
    }

    return (
      <TableCell rowSpan={totalRows} className="border-r align-top font-medium">
        <p className="w-[30ch] max-w-[30ch] leading-snug whitespace-normal">
          {tujuan.name}
        </p>
      </TableCell>
    );
  };

  if (sasarans.length === 0) {
    return (
      <TableRow className="hover:bg-muted/30">
        {renderTujuanCell(0)}
        <TableCell className="border-r text-muted-foreground italic">
          -
        </TableCell>
        <TableCell className="border-r text-muted-foreground italic">
          -
        </TableCell>
        <TableCell className="border-r text-center text-muted-foreground italic">
          -
        </TableCell>
        {years.map((y) => (
          <TableCell
            key={y}
            className={cn(
              'border-r text-center text-muted-foreground italic',
              y === currentYear && 'bg-primary/10 text-primary',
            )}
          >
            -
          </TableCell>
        ))}
      </TableRow>
    );
  }

  const rows: React.ReactNode[] = [];

  sasarans.forEach((sasaran) => {
    const indicators = sasaran.indicators || [];
    const sasaranRows = Math.max(1, indicators.length);

    if (indicators.length === 0) {
      rows.push(
        <TableRow
          key={`sasaran-empty-${sasaran.id}`}
          className="hover:bg-muted/30"
        >
          {renderTujuanCell(rows.length)}
          <TableCell className="border-r align-top">
            <p className="w-[35ch] text-xs leading-snug whitespace-normal text-foreground sm:text-sm">
              {sasaran.name}
            </p>
          </TableCell>
          <TableCell className="border-r text-muted-foreground italic">
            -
          </TableCell>
          <TableCell className="border-r text-center text-muted-foreground italic">
            -
          </TableCell>
          {years.map((y) => (
            <TableCell
              key={y}
              className={cn(
                'border-r text-center text-muted-foreground italic',
                y === currentYear && 'bg-primary/10 text-primary',
              )}
            >
              -
            </TableCell>
          ))}
        </TableRow>,
      );
    } else {
      indicators.forEach((indicator, idx) => {
        rows.push(
          <TableRow
            key={`sasaran-ind-${indicator.id}`}
            className="hover:bg-muted/30"
          >
            {renderTujuanCell(rows.length)}
            {idx === 0 && (
              <TableCell rowSpan={sasaranRows} className="border-r align-top">
                <p className="w-[35ch] text-xs leading-snug whitespace-normal text-foreground sm:text-sm">
                  {sasaran.name}
                </p>
              </TableCell>
            )}
            <RenstraIndicatorColumns
              indicator={indicator}
              years={years}
              currentYear={currentYear}
            />
          </TableRow>,
        );
      });
    }
  });

  return <>{rows}</>;
}

function RenstraIndicatorColumns({
  indicator,
  years,
  currentYear,
}: {
  indicator: Indicator;
  years: number[];
  currentYear: number;
}) {
  return (
    <>
      <TableCell className="border-r align-top">
        <p className="min-w-[35ch] text-xs leading-snug whitespace-normal text-foreground sm:text-sm">
          {indicator.name}
        </p>
      </TableCell>
      <TableCell className="border-r text-center align-top font-mono text-xs sm:text-sm">
        {indicator.baseline || '-'}
      </TableCell>
      {years.map((year) => {
        const target = indicator.targets?.find((t) => t.year === year);
        const isCurrent = year === currentYear;

        return (
          <TableCell
            key={year}
            className={cn(
              'border-r text-center align-top font-mono text-xs whitespace-nowrap transition-colors sm:text-sm',
              isCurrent &&
                'bg-primary/10 font-bold text-primary ring-1 ring-primary/20 ring-inset',
            )}
          >
            {target?.target ? (
              <span
                className={cn(
                  isCurrent &&
                    'inline-block rounded bg-primary/20 px-1.5 py-0.5 font-semibold text-primary',
                )}
              >
                {target.target}
              </span>
            ) : (
              '-'
            )}
          </TableCell>
        );
      })}
    </>
  );
}
