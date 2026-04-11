import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';
import { YearlyDataCell } from './yearly-data-cell';

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
        cellClassName: 'w-px border-r',
      },
    },
    {
      accessorKey: 'code',
      header: (props) => <DataTableColumnHeader {...props} title="Kode" />,
      cell: ({ row, table }) => {
        const activity = row.original;
        const index = row.index;
        const rows = table.getRowModel().rows;
        const isDuplicate =
          index > 0 && rows[index - 1].original.id === activity.id;

        if (isDuplicate) {
          return null;
        }

        return (
          <p className="font-mono whitespace-nowrap">
            <span className="text-muted-foreground">
              [{typeLabels[activity.type]}]
            </span>{' '}
            {activity.code}
          </p>
        );
      },
      meta: {
        cellClassName: 'w-px border-r',
        colSpan: (row, table) => {
          const index = row.index;
          const rows = table.getRowModel().rows;
          const isDuplicate =
            index > 0 && rows[index - 1].original.id === row.original.id;

          return isDuplicate ? 2 : 1;
        },
      },
    },
    {
      accessorKey: 'name',
      header: (props) => (
        <DataTableColumnHeader {...props} title="Nomenklatur" />
      ),
      cell: ({ row, table }) => {
        const activity = row.original;
        const index = row.index;
        const rows = table.getRowModel().rows;
        const isDuplicate =
          index > 0 && rows[index - 1].original.id === activity.id;

        if (isDuplicate) {
          return null;
        }

        return <p className="whitespace-normal">{activity.name}</p>;
      },
      meta: {
        cellClassName: 'min-w-[300px] border-r',
        colSpan: (row, table) => {
          const index = row.index;
          const rows = table.getRowModel().rows;
          const isDuplicate =
            index > 0 && rows[index - 1].original.id === row.original.id;

          return isDuplicate ? 0 : 1;
        },
      },
    },
    {
      id: 'indicator',
      header: (props) => <DataTableColumnHeader {...props} title="Indikator" />,
      cell: ({ row }) => {
        const activity = row.original;
        const ind = activity.specific_indicator;

        if (!ind) {
          return <p className="text-muted-foreground italic">-</p>;
        }

        return <p className="w-xs whitespace-normal">{ind.name}</p>;
      },
      meta: {
        cellClassName: 'border-r',
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
        const ind = activity.specific_indicator;

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
        cell: ({ row }) => {
          const activity = row.original;

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
        },
      },
    ],
  );

  return [...baseColumns, ...yearlyColumns];
};
