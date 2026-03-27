import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    type VisibilityState,
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
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';

interface PaginatedData<TData> {
    data: TData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    /** Laravel paginator result (data + meta) */
    paginatedData: PaginatedData<TData>;
    /** Current filters from the Inertia prop (passed from controller) */
    filters: DataTableFilters;
    /** Called when user types in the search box (debounced internally in useDataTable) */
    onSearch: (value: string) => void;
    /** Called when user clicks a sortable column header */
    onSort: (column: string, direction: 'asc' | 'desc') => void;
    /** Called when user navigates to a page */
    onPageChange: (page: number) => void;
    /** Called when user changes rows-per-page */
    onPerPageChange: (perPage: number) => void;
    /** Reset all filters */
    onReset: () => void;
    /** Placeholder for the search input */
    searchPlaceholder?: string;
    /** Optional extra elements in the toolbar (filters, export buttons, etc.) */
    toolbarChildren?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    paginatedData,
    filters,
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    onReset,
    searchPlaceholder,
    toolbarChildren,
}: DataTableProps<TData, TValue>) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data: paginatedData.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // Disable built-in sorting/filtering — server handles these
        manualSorting: true,
        manualFiltering: true,
        manualPagination: true,
        state: {
            columnVisibility,
        },
        onColumnVisibilityChange: setColumnVisibility,
    });

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <DataTableToolbar
                filters={filters}
                onSearch={onSearch}
                onReset={onReset}
                searchPlaceholder={searchPlaceholder}
            >
                {toolbarChildren}
            </DataTableToolbar>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  {
                                                      ...header.getContext(),
                                                      // Pass sort state for DataTableColumnHeader
                                                      currentSort: filters.sort ?? '',
                                                      currentDirection: filters.direction ?? '',
                                                      onSort,
                                                  },
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <DataTablePagination
                meta={paginatedData}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
            />
        </div>
    );
}
