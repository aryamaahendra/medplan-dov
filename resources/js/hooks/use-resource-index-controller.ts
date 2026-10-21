import { router } from '@inertiajs/react';
import type { ColumnDef, RowData } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { DataTableFilters } from '@/hooks/use-data-table';
import { useDataTable } from '@/hooks/use-data-table';
import type { PaginationMeta } from '@/types/table';

export interface PaginatedData<TData> {
  data: TData[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface UseResourceIndexControllerOptions<
  TData extends RowData,
  TValue = unknown,
  TFilters extends DataTableFilters = DataTableFilters,
> {
  data: PaginatedData<TData>;
  filters: TFilters;
  only: string[];
  url?: string;
  searchDebounce?: number;
  deleteUrl: (item: TData) => string;
  resourceName: string;
  getColumns?: (actions: {
    onEdit: (item: TData) => void;
    onDelete: (item: TData) => void;
  }) => ColumnDef<TData, TValue>[];
  columns?: ColumnDef<TData, TValue>[];
  searchPlaceholder?: string;
  onDeleteSuccess?: (item: TData) => void;
}

export interface ResourceIndexController<
  TData extends RowData,
  TValue = unknown,
  TFilters extends DataTableFilters = DataTableFilters,
> {
  dialog: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editingItem: TData | null;
    openCreate: () => void;
    openEdit: (item: TData) => void;
    close: () => void;
    setIsOpen: (open: boolean) => void;
  };
  deleteDialog: {
    isOpen: boolean;
    deletingItem: TData | null;
    isDeleting: boolean;
    requestDelete: (item: TData) => void;
    confirmDelete: () => void;
    cancel: () => void;
    setIsOpen: (open: boolean) => void;
  };
  tableProps: {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    meta: PaginationMeta;
    filters: TFilters;
    onSearch: (value: string) => void;
    onSort: (column: string, direction: 'asc' | 'desc') => void;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onReset: () => void;
    searchPlaceholder?: string;
  };
}

export function useResourceIndexController<
  TData extends RowData,
  TValue = unknown,
  TFilters extends DataTableFilters = DataTableFilters,
>({
  data,
  filters,
  only,
  url,
  searchDebounce = 300,
  deleteUrl,
  resourceName,
  getColumns,
  columns: explicitColumns,
  searchPlaceholder,
  onDeleteSuccess,
}: UseResourceIndexControllerOptions<
  TData,
  TValue,
  TFilters
>): ResourceIndexController<TData, TValue, TFilters> {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TData | null>(null);

  // Delete state
  const [deletingItem, setDeletingItem] = useState<TData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Server table pagination / search / sort hook
  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only,
      url,
      searchDebounce,
    });

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((item: TData) => {
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingItem(null);
  }, []);

  const requestDelete = useCallback((item: TData) => {
    setDeletingItem(item);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeletingItem(null);
  }, []);

  const setDeleteDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      setDeletingItem(null);
    }
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingItem) {
      return;
    }

    setIsDeleting(true);

    const targetUrl = deleteUrl(deletingItem);
    const targetItem = deletingItem;

    router.delete(targetUrl, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`${resourceName} berhasil dihapus.`);
        setDeletingItem(null);
        onDeleteSuccess?.(targetItem);
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        toast.error(
          typeof firstError === 'string'
            ? firstError
            : `Gagal menghapus ${resourceName}.`,
        );
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  }, [deleteUrl, deletingItem, onDeleteSuccess, resourceName]);

  const columns = useMemo(() => {
    if (explicitColumns) {
      return explicitColumns;
    }

    if (getColumns) {
      return getColumns({
        onEdit: openEdit,
        onDelete: requestDelete,
      });
    }

    return [];
  }, [explicitColumns, getColumns, openEdit, requestDelete]);

  const meta: PaginationMeta = useMemo(
    () => ({
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total,
      from: data.from,
      to: data.to,
    }),
    [
      data.current_page,
      data.from,
      data.last_page,
      data.per_page,
      data.to,
      data.total,
    ],
  );

  return {
    dialog: {
      isOpen: dialogOpen,
      mode: editingItem !== null ? 'edit' : 'create',
      editingItem,
      openCreate,
      openEdit,
      close: closeDialog,
      setIsOpen: setDialogOpen,
    },
    deleteDialog: {
      isOpen: deletingItem !== null,
      deletingItem,
      isDeleting,
      requestDelete,
      confirmDelete,
      cancel: cancelDelete,
      setIsOpen: setDeleteDialogOpen,
    },
    tableProps: {
      columns,
      data: data.data,
      meta,
      filters,
      onSearch,
      onSort,
      onPageChange,
      onPerPageChange,
      onReset,
      searchPlaceholder,
    },
  };
}
