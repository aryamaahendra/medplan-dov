import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table';
import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';
import { DataTablePagination } from './DataTablePagination';
import type { PaginationMeta } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta: PaginationMeta;
  filters: DataTableFilters;
  onSearch: (value: string) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onReset: () => void;
  searchPlaceholder?: string;
  toolbarChildren?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  filters,
  onSearch,
  onSort,
  onPageChange,
  onPerPageChange,
  onReset,
  searchPlaceholder,
  toolbarChildren,
}: DataTableProps<TData, TValue>) {
  // Local UI state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // TanStack Table Instance
  // DO NOT useMemo this instance per user requirement to avoid React Compiler issues
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    // Handled on server
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        filters={filters}
        onSearch={onSearch}
        onReset={onReset}
        searchPlaceholder={searchPlaceholder}
      >
        {toolbarChildren}
      </DataTableToolbar>

      <div className="rounded-md border">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, {
                          ...header.getContext(),
                          onSort,
                          currentSort: filters.sort,
                          currentDirection: filters.direction,
                        })}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellMeta = cell.column.columnDef.meta;
                    const cellClassName =
                      typeof cellMeta?.cellClassName === 'function'
                        ? cellMeta.cellClassName(row)
                        : cellMeta?.cellClassName;

                    return (
                      <TableCell key={cell.id} className={cn(cellClassName)}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        meta={meta}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </div>
  );
}
