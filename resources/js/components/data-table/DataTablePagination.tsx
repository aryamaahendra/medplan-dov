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

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

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
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        {from !== null && to !== null ? (
          <>
            Showing <strong>{from}</strong>–<strong>{to}</strong> of{' '}
            <strong>{total}</strong> result{total !== 1 ? 's' : ''}
          </>
        ) : (
          'No results'
        )}
      </p>

      <div className="flex items-center gap-6">
        {/* Per-page selector */}
        <div className="flex items-center gap-2">
          <p className="text-sm whitespace-nowrap text-muted-foreground">
            Rows per page
          </p>
          <Select
            value={String(per_page)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger id="data-table-per-page" className="h-8 w-16">
              <SelectValue />
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

        {/* Page counter */}
        <p className="text-sm whitespace-nowrap text-muted-foreground">
          Page {current_page} of {last_page}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            id="data-table-first-page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(1)}
            disabled={current_page === 1}
            aria-label="First page"
          >
            <ChevronFirstIcon className="size-4" />
          </Button>
          <Button
            id="data-table-prev-page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(current_page - 1)}
            disabled={current_page === 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            id="data-table-next-page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(current_page + 1)}
            disabled={current_page === last_page}
            aria-label="Next page"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            id="data-table-last-page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(last_page)}
            disabled={current_page === last_page}
            aria-label="Last page"
          >
            <ChevronLastIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
