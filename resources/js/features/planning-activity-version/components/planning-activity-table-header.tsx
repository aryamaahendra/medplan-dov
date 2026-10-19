import { Fragment } from 'react';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PlanningActivityTableHeaderProps {
  baselineYear: number;
  years: number[];
}

export function PlanningActivityTableHeader({
  baselineYear,
  years,
}: PlanningActivityTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableHead rowSpan={2} className="w-[50px] border-r">
          Aksi
        </TableHead>
        <TableHead
          rowSpan={2}
          className="min-w-[300px] border-r text-foreground"
        >
          Nomenklatur
        </TableHead>
        <TableHead rowSpan={2} className="w-[200px] border-r text-foreground">
          Indikator
        </TableHead>
        <TableHead rowSpan={2} className="w-[150px] border-r">
          Baseline {baselineYear}
        </TableHead>
        {years.map((year) => (
          <TableHead
            key={year}
            colSpan={2}
            className="border-r text-center font-bold text-foreground"
          >
            {year}
          </TableHead>
        ))}
      </TableRow>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        {years.map((year) => (
          <Fragment key={year}>
            <TableHead className="w-[120px] border-r text-center text-xss font-bold">
              TARGET
            </TableHead>
            <TableHead className="w-[140px] border-r text-center text-xss font-bold">
              PAGU
            </TableHead>
          </Fragment>
        ))}
      </TableRow>
    </TableHeader>
  );
}
