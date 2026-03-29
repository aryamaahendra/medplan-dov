import { Search as SearchIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import type { DataTableFilters } from '@/hooks/use-data-table';

interface DataTableToolbarProps {
  filters: DataTableFilters;
  onSearch: (value: string) => void;
  onReset: () => void;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Optional extra filter controls to render on the right */
  children?: ReactNode;
}

export function DataTableToolbar({
  filters,
  onSearch,
  onReset,
  searchPlaceholder = 'Search...',
  children,
}: DataTableToolbarProps) {
  const isFiltered = Boolean(filters.search) || Boolean(filters.sort);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        <InputGroup className="max-w-xs">
          <InputGroupInput
            id="data-table-search"
            placeholder={searchPlaceholder}
            defaultValue={filters.search ?? ''}
            onChange={(e) => onSearch(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

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
