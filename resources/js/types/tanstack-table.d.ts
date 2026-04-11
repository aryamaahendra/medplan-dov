import type { Row, RowData, Table } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    cellClassName?: string | ((row: Row<TData>) => string);
    colSpan?: (row: Row<TData>, table: Table<TData>) => number;
    rowSpan?: (row: Row<TData>, table: Table<TData>) => number;
  }
}
