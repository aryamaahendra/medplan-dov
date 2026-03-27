import { router } from '@inertiajs/react';
import { useCallback, useRef } from 'react';

/**
 * Filter structure for the URL search params.
 */
export interface DataTableFilters {
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc' | '';
  per_page?: number;
  page?: number;
  [key: string]: string | number | undefined;
}

interface UseDataTableOptions {
  /** The Inertia keys we want to partially reload (e.g. ['users', 'filters']) */
  only: string[];
  /** Optional base path. Defaults to current path. */
  url?: string;
  /** Milliseconds to debounce the search input (defaults to 300) */
  searchDebounce?: number;
}

/**
 * useDataTable
 *
 * A specialized hook for TanStack Table when backed by Laravel/Inertia
 * server-side pagination, sorting, and filtering.
 */
export function useDataTable({
  only,
  url,
  searchDebounce = 300,
}: UseDataTableOptions) {
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Performs the Inertia router visit.
   */
  const visit = useCallback(
    (params: Record<string, string | number | undefined>) => {
      // Clean up empty params
      const cleaned: Record<string, string | number> = {};

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          cleaned[key] = value;
        }
      }

      router.get(url ?? window.location.pathname, cleaned, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only,
      });
    },
    [only, url],
  );

  /**
   * Merges new params into existing ones from the current URL.
   */
  const mergeParams = useCallback(
    (newParams: DataTableFilters) => {
      const searchParams = new URLSearchParams(window.location.search);
      const currentParams: Record<string, string | number | undefined> = {};

      searchParams.forEach((value, key) => {
        currentParams[key] = value;
      });

      visit({ ...currentParams, ...newParams });
    },
    [visit],
  );

  /**
   * Search handling (with debounce)
   */
  const onSearch = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        mergeParams({ search: value || undefined, page: 1 });
      }, searchDebounce);
    },
    [mergeParams, searchDebounce],
  );

  /**
   * Sorting handling
   */
  const onSort = useCallback(
    (column: string, direction?: 'asc' | 'desc') => {
      const searchParams = new URLSearchParams(window.location.search);
      const currentSort = searchParams.get('sort');
      const currentDir = searchParams.get('direction');

      let newDirection: 'asc' | 'desc' = direction ?? 'asc';

      // Toggle logic if column is already sorted
      if (!direction && currentSort === column) {
        newDirection = currentDir === 'asc' ? 'desc' : 'asc';
      }

      mergeParams({ sort: column, direction: newDirection, page: 1 });
    },
    [mergeParams],
  );

  /**
   * Pagination: Page change
   */
  const onPageChange = useCallback(
    (page: number) => {
      mergeParams({ page });
    },
    [mergeParams],
  );

  /**
   * Pagination: Per-page change
   */
  const onPerPageChange = useCallback(
    (perPage: number) => {
      mergeParams({ per_page: perPage, page: 1 });
    },
    [mergeParams],
  );

  /**
   * Reset all filters
   */
  const onReset = useCallback(() => {
    visit({});
  }, [visit]);

  return {
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    onReset,
    mergeParams,
  };
}
