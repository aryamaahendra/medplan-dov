import type { RowData, Row, Table } from '@tanstack/react-table';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    cellClassName?: string | ((row: Row<TData>) => string);
    colSpan?: (row: Row<TData>, table: Table<TData>) => number;
    rowSpan?: (row: Row<TData>, table: Table<TData>) => number;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    pagination?: PaginationMeta;
  }
}
