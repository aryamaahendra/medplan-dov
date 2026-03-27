import '@tanstack/react-table';
import type { RowData, Row } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    cellClassName?: string | ((row: Row<TData>) => string);
  }
}
