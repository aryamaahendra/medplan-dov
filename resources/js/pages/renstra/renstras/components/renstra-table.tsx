import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Renstra, Tujuan, Indicator } from '@/types';

interface RenstraTableProps {
  renstra: Renstra;
}

export function RenstraTable({ renstra }: RenstraTableProps) {
  const years = Array.from(
    { length: renstra.year_end - renstra.year_start },
    (_, i) => renstra.year_start + 1 + i,
  );

  return (
    <Card>
      <CardContent>
        <div className="-mx-4 overflow-x-auto">
          <Table className="border-collapse [&_td]:border [&_td]:p-2 [&_td:first-child]:border-l-0 [&_td:last-child]:border-r-0 [&_th]:border [&_th]:p-2 [&_th:first-child]:border-l-0 [&_th:last-child]:border-r-0">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead rowSpan={2}>Tujuan</TableHead>
                <TableHead rowSpan={2}>Sasaran</TableHead>
                <TableHead rowSpan={2}>Indikator</TableHead>
                <TableHead rowSpan={2} className="text-center">
                  Baseline ({renstra.year_start})
                </TableHead>
                <TableHead colSpan={years.length} className="text-center">
                  Target Tahunan
                </TableHead>
                <TableHead rowSpan={2}>Keterangan</TableHead>
              </TableRow>
              <TableRow>
                {years.map((year) => (
                  <TableHead key={year} className="w-1 text-center">
                    {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {renstra.tujuans?.map((tujuan) => (
                <TujuanRows key={tujuan.id} tujuan={tujuan} years={years} />
              ))}
              {!renstra.tujuans?.length && (
                <TableRow>
                  <TableCell
                    colSpan={years.length + 5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Belum ada data tujuan strategis.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function TujuanRows({ tujuan, years }: { tujuan: Tujuan; years: number[] }) {
  // Direct indicators of Tujuan
  const directIndicators = tujuan.indicators || [];
  // Indicators from sasarans
  const sasarans = tujuan.sasarans || [];

  // Calculate total rows for this Tujuan
  const totalRows = Math.max(
    1,
    directIndicators.length +
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
      <TableCell rowSpan={totalRows}>
        <p className="w-[35ch] max-w-[35ch] whitespace-normal">{tujuan.name}</p>
      </TableCell>
    );
  };

  const rows: React.ReactNode[] = [];

  // 1. Direct indicators
  directIndicators.forEach((indicator) => {
    rows.push(
      <TableRow key={`direct-${indicator.id}`} className="hover:bg-background">
        {renderTujuanCell(rows.length)}
        <TableCell className="bg-muted/10 text-muted-foreground italic">
          -
        </TableCell>
        <IndicatorColumns indicator={indicator} years={years} />
      </TableRow>,
    );
  });

  // 2. Sasarans
  sasarans.forEach((sasaran) => {
    const indicators = sasaran.indicators || [];
    const sasaranRows = Math.max(1, indicators.length);

    if (indicators.length === 0) {
      rows.push(
        <TableRow
          key={`sasaran-empty-${sasaran.id}`}
          className="hover:bg-background"
        >
          {renderTujuanCell(rows.length)}
          <TableCell>
            <p className="w-[45ch] whitespace-normal">{sasaran.name}</p>
          </TableCell>
          <TableCell className="text-muted-foreground italic">-</TableCell>
          <TableCell className="text-muted-foreground italic">-</TableCell>
          {years.map((y) => (
            <TableCell
              key={y}
              className="text-center text-muted-foreground italic"
            >
              -
            </TableCell>
          ))}
          <TableCell className="text-muted-foreground italic">-</TableCell>
        </TableRow>,
      );
    } else {
      indicators.forEach((indicator, idx) => {
        rows.push(
          <TableRow
            key={`sasaran-ind-${indicator.id}`}
            className="hover:bg-background"
          >
            {renderTujuanCell(rows.length)}
            {idx === 0 && (
              <TableCell rowSpan={sasaranRows}>
                <p className="w-[45ch] whitespace-normal">{sasaran.name}</p>
              </TableCell>
            )}
            <IndicatorColumns indicator={indicator} years={years} />
          </TableRow>,
        );
      });
    }
  });

  // 3. Fallback if both are empty
  if (directIndicators.length === 0 && sasarans.length === 0) {
    rows.push(
      <TableRow key={`empty-${tujuan.id}`}>
        {renderTujuanCell(rows.length)}
        <TableCell className="text-muted-foreground italic">-</TableCell>
        <TableCell className="text-muted-foreground italic">-</TableCell>
        <TableCell className="text-muted-foreground italic">-</TableCell>
        {years.map((y) => (
          <TableCell
            key={y}
            className="text-center text-muted-foreground italic"
          >
            -
          </TableCell>
        ))}
        <TableCell className="text-muted-foreground italic">-</TableCell>
      </TableRow>,
    );
  }

  return <>{rows}</>;
}

function IndicatorColumns({
  indicator,
  years,
}: {
  indicator: Indicator;
  years: number[];
}) {
  return (
    <>
      <TableCell>
        <p className="min-w-[45ch] whitespace-normal">{indicator.name}</p>
      </TableCell>
      <TableCell className="text-center font-mono">
        {indicator.baseline || '-'}
      </TableCell>
      {years.map((year) => {
        const target = indicator.targets?.find((t) => t.year === year);

        return (
          <TableCell
            key={year}
            className="text-center font-mono whitespace-nowrap"
          >
            {target?.target || '-'}
          </TableCell>
        );
      })}
      <TableCell className="max-w-[200px] align-top text-sm text-muted-foreground">
        {indicator.description || '-'}
      </TableCell>
    </>
  );
}
