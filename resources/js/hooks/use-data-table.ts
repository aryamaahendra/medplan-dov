import { router } from '@inertiajs/react';
import { useCallback, useRef } from 'react';

export interface DataTableFilters {
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc' | '';
  per_page?: number;
  page?: number;
  [key: string]: string | number | undefined;
}

interface UseDataTableOptions {
  /** The Inertia partial reload keys (must include your paginated data key and 'filters') */
  only: string[];
  /** Base URL for the request. Defaults to current URL. */
  url?: string;
  /** Debounce delay in ms for search input (default: 300) */
  searchDebounce?: number;
}

interface UseDataTableReturn {
  setSearch: (value: string) => void;
  setSort: (column: string, direction?: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setFilter: (filters: DataTableFilters) => void;
  resetFilters: () => void;
}

/**
 * useDataTable
 *
 * A custom hook that bridges TanStack Table UI interactions with Inertia
 * partial reloads. All state lives in the URL — no duplicate React state.
 *
 * @example
 * const { setSearch, setSort, setPage, setPerPage } = useDataTable({
 *   only: ['users', 'filters'],
 * });
 */
export function useDataTable(options: UseDataTableOptions): UseDataTableReturn {
  const { only, url, searchDebounce = 300 } = options;

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Send an Inertia partial reload with the given params merged into the URL. */
  const visit = useCallback(
    (params: Record<string, string | number | undefined>) => {
      // Strip undefined / empty string values so the URL stays clean.
      const cleaned: Record<string, string | number> = {};

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') {
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

  /** Merge new params on top of the current URL search params. */
  const mergeParams = useCallback(
    (newParams: DataTableFilters) => {
      const current = new URLSearchParams(window.location.search);
      const merged: Record<string, string | number | undefined> = {};

      current.forEach((value, key) => {
        merged[key] = value;
      });

      Object.assign(merged, newParams);

      visit(merged);
    },
    [visit],
  );

  const setSearch = useCallback(
    (value: string) => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }

      searchTimer.current = setTimeout(() => {
        mergeParams({ search: value || undefined, page: 1 });
      }, searchDebounce);
    },
    [mergeParams, searchDebounce],
  );

  const setSort = useCallback(
    (column: string, direction: 'asc' | 'desc' = 'asc') => {
      const current = new URLSearchParams(window.location.search);
      const currentSort = current.get('sort');
      const currentDir = current.get('direction') as 'asc' | 'desc' | null;

      // Toggle direction if clicking the same column
      let newDirection: 'asc' | 'desc' = direction;

      if (currentSort === column) {
        newDirection = currentDir === 'asc' ? 'desc' : 'asc';
      }

      mergeParams({ sort: column, direction: newDirection, page: 1 });
    },
    [mergeParams],
  );

  const setPage = useCallback(
    (page: number) => {
      mergeParams({ page });
    },
    [mergeParams],
  );

  const setPerPage = useCallback(
    (perPage: number) => {
      mergeParams({ per_page: perPage, page: 1 });
    },
    [mergeParams],
  );

  const setFilter = useCallback(
    (filters: DataTableFilters) => {
      mergeParams({ ...filters, page: 1 });
    },
    [mergeParams],
  );

  const resetFilters = useCallback(() => {
    visit({});
  }, [visit]);

  return { setSearch, setSort, setPage, setPerPage, setFilter, resetFilters };
}
