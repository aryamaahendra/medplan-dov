import {
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from '@remixicon/react';

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
            <SelectTrigger className="w-[70px]">
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
            size="icon"
            className="hidden lg:flex"
            onClick={() => onPageChange(1)}
            disabled={current_page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <RiArrowLeftDoubleLine />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(current_page - 1)}
            disabled={current_page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <RiArrowLeftSLine />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(current_page + 1)}
            disabled={current_page === last_page}
          >
            <span className="sr-only">Go to next page</span>
            <RiArrowRightSLine />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden lg:flex"
            onClick={() => onPageChange(last_page)}
            disabled={current_page === last_page}
          >
            <span className="sr-only">Go to last page</span>
            <RiArrowRightDoubleLine />
          </Button>
        </div>
      </div>
    </div>
  );
}
