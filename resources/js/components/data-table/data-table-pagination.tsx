import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { PaginationMeta } from '@/types/table';

interface DataTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  meta,
  onPageChange,
  onPerPageChange,
  pageSizeOptions = [10, 15, 25, 50, 100],
}: DataTablePaginationProps) {
  const { current_page, last_page, per_page, total, from, to } = meta;

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
      <div className="flex-1 text-sm text-muted-foreground">
        {from !== null && to !== null ? (
          <>
            Showing <strong>{from}</strong>–<strong>{to}</strong> of{' '}
            <strong>{total}</strong> result{total !== 1 ? 's' : ''}
          </>
        ) : (
          'No results'
        )}
      </div>

      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={String(per_page)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={String(per_page)} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {current_page} of {last_page}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={current_page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronFirstIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => onPageChange(current_page - 1)}
            disabled={current_page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => onPageChange(current_page + 1)}
            disabled={current_page === last_page}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => onPageChange(last_page)}
            disabled={current_page === last_page}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronLastIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
