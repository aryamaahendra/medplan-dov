import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import renstraRoutes from '@/routes/renstras';
import type { Renstra } from '@/types';

import { getColumns } from '../components/renstra-columns';

export function useRenstrasIndex() {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRenstra, setEditingRenstra] = useState<Renstra | null>(null);
  const [deletingRenstra, setDeletingRenstra] = useState<Renstra | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({ only: ['renstras', 'filters'] });

  const onEdit = useCallback((renstra: Renstra) => {
    setEditingRenstra(renstra);
    setDialogOpen(true);
  }, []);

  const onCreate = useCallback(() => {
    setEditingRenstra(null);
    setDialogOpen(true);
  }, []);

  const onDelete = useCallback((renstra: Renstra) => {
    setDeletingRenstra(renstra);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingRenstra) {
      return;
    }

    setIsDeleting(true);

    router.delete(renstraRoutes.destroy.url({ renstra: deletingRenstra.id }), {
      onSuccess: () => {
        toast.success('Renstra berhasil dihapus.');
        setDeletingRenstra(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  }, [deletingRenstra]);

  const columns = useMemo(
    () => getColumns(onEdit, onDelete, hasPermission),
    [onEdit, onDelete, hasPermission],
  );

  return {
    hasPermission,
    dialogOpen,
    setDialogOpen,
    editingRenstra,
    deletingRenstra,
    setDeletingRenstra,
    isDeleting,
    onEdit,
    onCreate,
    onDelete,
    handleConfirmDelete,
    columns,
    dataTable: {
      onSearch,
      onSort,
      onPageChange,
      onPerPageChange,
      onReset,
    },
  };
}
