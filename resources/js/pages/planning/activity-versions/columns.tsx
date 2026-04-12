import type { ColumnDef, Row, Table } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';
import { YearlyDataCell } from './yearly-data-cell';

const calculateRowSpan = <TData,>(
  row: Row<TData>,
  table: Table<TData>,
  idSelector: (item: TData) => any,
) => {
  const index = row.index;
  const rows = table.getRowModel().rows;
  const currentId = idSelector(row.original);

  if (index > 0 && idSelector(rows[index - 1].original) === currentId) {
    return 0;
  }

  let span = 1;

  for (let i = index + 1; i < rows.length; i++) {
    if (idSelector(rows[i].original) === currentId) {
      span++;
    } else {
      break;
    }
  }

  return span;
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
      cell: ({ row, table }) => {
        const activity = row.original;
        const isDuplicate =
          calculateRowSpan(row, table, (item) => item.id) === 0;

        if (isDuplicate) {
          return null;
        }

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
        cellClassName: 'w-px border-r',
        rowSpan: (
          row: Row<PlanningActivityVersion>,
          table: Table<PlanningActivityVersion>,
        ) => calculateRowSpan(row, table, (item) => item.id),
      },
    },
    {
      accessorKey: 'name',
      header: (props) => (
        <DataTableColumnHeader {...props} title="Nomenklatur" />
      ),
      cell: ({ row, table }) => {
        const activity = row.original;
        const isDuplicate =
          calculateRowSpan(row, table, (item) => item.id) === 0;

        if (isDuplicate) {
          return null;
        }

        return (
          <div className="flex flex-col gap-1.5 py-1">
            <p className="leading-snug font-medium whitespace-normal">
              {activity.name}
            </p>
            <p className="font-mono text-xs leading-none text-muted-foreground">
              {activity.code}
            </p>
          </div>
        );
      },
      meta: {
        cellClassName: 'min-w-[350px] border-r align-top',
        rowSpan: (
          row: Row<PlanningActivityVersion>,
          table: Table<PlanningActivityVersion>,
        ) => calculateRowSpan(row, table, (item) => item.id),
      },
    },
    {
      id: 'indicator',
      header: (props) => <DataTableColumnHeader {...props} title="Indikator" />,
      cell: ({ row, table }) => {
        const activity = row.original;
        const ind = activity.specific_indicator;

        const isDuplicate =
          calculateRowSpan(
            row,
            table,
            (item) => `${item.id}-${item.specific_indicator?.name}`,
          ) === 0;

        if (isDuplicate) {
          return null;
        }

        if (!ind) {
          return <p className="text-muted-foreground italic">-</p>;
        }

        return <p className="w-xs whitespace-normal">{ind.name}</p>;
      },
      meta: {
        cellClassName: 'border-r',
        rowSpan: (
          row: Row<PlanningActivityVersion>,
          table: Table<PlanningActivityVersion>,
        ) =>
          calculateRowSpan(
            row,
            table,
            (item: PlanningActivityVersion) =>
              `${item.id}-${item.specific_indicator?.name}`,
          ),
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
      cell: ({ row, table }) => {
        const activity = row.original;
        const ind = activity.specific_indicator;

        const isDuplicate =
          calculateRowSpan(
            row,
            table,
            (item) => `${item.id}-${item.specific_indicator?.name}`,
          ) === 0;

        if (isDuplicate) {
          return null;
        }

        if (!ind) {
          return null;
        }

        return (
          <p className="">
            {ind.baseline || '-'}
            {ind.unit && <span>{ind.unit}</span>}
          </p>
        );
      },
      meta: {
        cellClassName: 'w-[150px] border-r',
        rowSpan: (
          row: Row<PlanningActivityVersion>,
          table: Table<PlanningActivityVersion>,
        ) =>
          calculateRowSpan(
            row,
            table,
            (item: PlanningActivityVersion) =>
              `${item.id}-${item.specific_indicator?.name}`,
          ),
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
          const ind = activity.specific_indicator;

          if (!ind) {
            return (
              <div>
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
            );
          }

          return (
            <div>
              <YearlyDataCell
                activityId={activity.id}
                yearableId={ind.id}
                yearableType="indicator"
                items={ind.activity_years ?? []}
                year={year}
                field="target"
              />
            </div>
          );
        },
        meta: {
          cellClassName: 'w-[120px] border-r',
        },
      },
      {
        id: `budget-${year}`,
        header: () => <div className="text-xs uppercase">{year} Pagu</div>,
        cell: ({ row, table }) => {
          const activity = row.original;
          const isDuplicate =
            calculateRowSpan(row, table, (item) => item.id) === 0;

          if (isDuplicate) {
            return null;
          }

          return (
            <div className="">
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
          cellClassName: 'w-[140px] border-r',
          rowSpan: (
            row: Row<PlanningActivityVersion>,
            table: Table<PlanningActivityVersion>,
          ) => calculateRowSpan(row, table, (item) => item.id),
        },
      },
    ],
  );

  return [...baseColumns, ...yearlyColumns];
};
