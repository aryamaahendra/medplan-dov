import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { cn } from '@/lib/utils';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';
import { YearlyDataCell } from './yearly-data-cell';

const typeIndentation: Record<PlanningActivityVersion['type'], string> = {
  program: '',
  activity: '',
  sub_activity: '',
  output: '',
};

const typeLabels: Record<PlanningActivityVersion['type'], string> = {
  program: 'P',
  activity: 'K',
  sub_activity: 'S',
  output: 'O',
};

export const getColumns = (
  version: PlanningVersion,
  onEdit: (activity: PlanningActivityVersion) => void,
  onDelete: (activity: PlanningActivityVersion) => void,
): ColumnDef<PlanningActivityVersion>[] => {
  const startYear = version.year_start;
  const years = Array.from({ length: 5 }, (_, i) => startYear + i);

  const baseColumns: ColumnDef<PlanningActivityVersion>[] = [
    {
      id: 'actions',
      cell: ({ row }) => {
        const activity = row.original;

        return (
          <ActionDropdown
            actions={[
              {
                label: 'Edit',
                icon: Pencil,
                onClick: () => onEdit(activity),
              },
              'separator',
              {
                label: 'Hapus',
                icon: Trash2,
                onClick: () => onDelete(activity),
                variant: 'destructive',
              },
            ]}
          />
        );
      },
      meta: {
        cellClassName: 'w-[50px] border-r',
      },
    },
    {
      accessorKey: 'code',
      header: (props) => <DataTableColumnHeader {...props} title="Kode" />,
      cell: ({ row }) => {
        const activity = row.original;

        return (
          <div
            className={cn(
              'font-mono whitespace-nowrap',
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
        cellClassName: 'w-px border-r',
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
        cellClassName: 'min-w-[300px] border-r align-top',
      },
    },
    {
      id: 'indicator',
      header: (props) => <DataTableColumnHeader {...props} title="Indikator" />,
      cell: ({ row }) => {
        const activity = row.original;

        return (
          <div className="flex flex-col gap-2 py-1 text-sm">
            {activity.indicators?.map((ind) => (
              <div key={ind.id} className="flex min-h-10 items-center">
                {ind.name}
              </div>
            ))}
            {(!activity.indicators || activity.indicators.length === 0) && (
              <div className="text-muted-foreground italic">-</div>
            )}
          </div>
        );
      },
      meta: {
        cellClassName: 'w-[200px] border-r align-top',
      },
    },
    {
      id: 'baseline',
      header: (props) => (
        <DataTableColumnHeader
          {...props}
          title={`Baseline ${version.year_start - 1}`}
        />
      ),
      cell: ({ row }) => {
        const activity = row.original;

        return (
          <div className="flex flex-col gap-2 py-1 text-sm">
            {activity.indicators?.map((ind) => (
              <div key={ind.id} className="flex min-h-10 items-center">
                {ind.baseline || '-'}
                {ind.unit && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {ind.unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      },
      meta: {
        cellClassName: 'w-[150px] border-r align-top',
      },
    },
  ];

  const yearlyColumns: ColumnDef<PlanningActivityVersion>[] = years.flatMap(
    (year) => [
      {
        id: `target-${year}`,
        header: () => <div className="text-xs uppercase">{year} Target</div>,
        cell: ({ row }) => {
          const activity = row.original;

          return (
            <div className="flex flex-col gap-2 py-1">
              {activity.indicators?.map((ind) => (
                <div key={ind.id} className="min-h-10">
                  <YearlyDataCell
                    activityId={activity.id}
                    yearableId={ind.id}
                    yearableType="indicator"
                    items={ind.activity_years ?? []}
                    year={year}
                    field="target"
                  />
                </div>
              ))}
              {(!activity.indicators || activity.indicators.length === 0) && (
                <div className="min-h-10">
                  <YearlyDataCell
                    activityId={activity.id}
                    yearableId={0}
                    yearableType="indicator"
                    items={[]}
                    year={year}
                    field="target"
                    disabled={true}
                  />
                </div>
              )}
            </div>
          );
        },
        meta: {
          cellClassName: 'w-[120px] border-r align-top',
        },
      },
      {
        id: `budget-${year}`,
        header: () => <div className="text-xs uppercase">{year} Pagu</div>,
        cell: ({ row }) => {
          const activity = row.original;

          return (
            <div className="py-1">
              <YearlyDataCell
                activityId={activity.id}
                yearableId={activity.id}
                yearableType="activity"
                items={activity.activity_years ?? []}
                year={year}
                field="budget"
              />
            </div>
          );
        },
        meta: {
          cellClassName: 'w-[140px] border-r align-top',
        },
      },
    ],
  );

  return [...baseColumns, ...yearlyColumns];
};
