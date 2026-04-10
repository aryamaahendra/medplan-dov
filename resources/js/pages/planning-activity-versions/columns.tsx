import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { cn } from '@/lib/utils';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';
import { YearlyDataCell } from './yearly-data-cell';

const typeIndentation: Record<PlanningActivityVersion['type'], string> = {
  program: 'pl-0 font-bold bg-muted/30',
  activity: 'pl-6 font-semibold',
  sub_activity: 'pl-12 font-medium',
  output: 'pl-16 text-muted-foreground',
};

const typeLabels: Record<PlanningActivityVersion['type'], string> = {
  program: 'P',
  activity: 'K',
  sub_activity: 'S',
  output: 'O',
};

export const getColumns = (
  version: PlanningVersion,
  activities: PlanningActivityVersion[],
): ColumnDef<PlanningActivityVersion>[] => {
  const startYear = version.fiscal_year;
  const years = Array.from({ length: 5 }, (_, i) => startYear + i);

  const baseColumns: ColumnDef<PlanningActivityVersion>[] = [
    {
      accessorKey: 'code',
      header: (props) => <DataTableColumnHeader {...props} title="Kode" />,
      cell: ({ row }) => {
        const activity = row.original;

        return (
          <div
            className={cn(
              'font-mono text-xs whitespace-nowrap',
              typeIndentation[activity.type],
            )}
          >
            <span className="mr-2 opacity-50">
              [{typeLabels[activity.type]}]
            </span>
            {activity.code}
          </div>
        );
      },
      meta: {
        cellClassName: 'w-[180px] p-0',
      },
    },
    {
      accessorKey: 'name',
      header: (props) => (
        <DataTableColumnHeader {...props} title="Nomenklatur" />
      ),
      cell: ({ row }) => {
        const activity = row.original;

        return (
          <div
            className={cn(
              'py-1 text-sm',
              typeIndentation[activity.type],
              'pl-2',
            )}
          >
            {activity.name}
          </div>
        );
      },
      meta: {
        cellClassName: 'min-w-[300px] p-0',
      },
    },
  ];

  const targetColumns: ColumnDef<PlanningActivityVersion>[] = years.map(
    (year) => ({
      id: `target-${year}`,
      header: () => (
        <div className="text-center text-[10px] font-bold uppercase">
          {year} Target
        </div>
      ),
      cell: ({ row }) => (
        <YearlyDataCell
          activity={row.original}
          year={year}
          field="target"
          activities={activities}
        />
      ),
      meta: {
        cellClassName: 'w-[120px] px-1',
      },
    }),
  );

  const budgetColumns: ColumnDef<PlanningActivityVersion>[] = years.map(
    (year) => ({
      id: `budget-${year}`,
      header: () => (
        <div className="text-center text-[10px] font-bold uppercase">
          {year} Anggaran
        </div>
      ),
      cell: ({ row }) => (
        <YearlyDataCell
          activity={row.original}
          year={year}
          field="budget"
          activities={activities}
        />
      ),
      meta: {
        cellClassName: 'w-[140px] px-1',
      },
    }),
  );

  return [...baseColumns, ...targetColumns, ...budgetColumns];
};
