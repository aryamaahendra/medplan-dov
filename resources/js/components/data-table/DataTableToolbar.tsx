import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DataTableFilters } from '@/hooks/use-data-table';

interface DataTableToolbarProps {
  filters: DataTableFilters;
  onSearch: (value: string) => void;
  onReset: () => void;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Optional extra filter controls to render on the right */
  children?: React.ReactNode;
}

export function DataTableToolbar({
  filters,
  onSearch,
  onReset,
  searchPlaceholder = 'Search...',
  children,
}: DataTableToolbarProps) {
  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.sort) ||
    Boolean(filters.per_page);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        <Input
          id="data-table-search"
          placeholder={searchPlaceholder}
          defaultValue={filters.search ?? ''}
          onChange={(e) => onSearch(e.target.value)}
          className="h-8 w-full max-w-xs"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <XIcon className="ml-1 size-4" />
          </Button>
        )}
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
