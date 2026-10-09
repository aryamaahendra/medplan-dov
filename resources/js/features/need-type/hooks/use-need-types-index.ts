import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import needTypeRoutes from '@/routes/need-types';
import { getNeedTypeColumns } from '../components/need-type-columns';
import type { NeedType } from '../types/need-type.types';

export function useNeedTypesIndex() {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNeedType, setEditingNeedType] = useState<NeedType | null>(null);
  const [deletingNeedType, setDeletingNeedType] = useState<NeedType | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const dataTable = useDataTable({
    only: ['needTypes', 'filters'],
  });

  const onEdit = (needType: NeedType) => {
    setEditingNeedType(needType);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingNeedType(null);
    setDialogOpen(true);
  };

  const onDelete = (needType: NeedType) => {
    setDeletingNeedType(needType);
  };

  const handleConfirmDelete = () => {
    if (!deletingNeedType) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      needTypeRoutes.destroy.url({
        need_type: deletingNeedType.id,
      }),
      {
        onSuccess: () => {
          toast.success('Kategori kebutuhan berhasil dihapus.');
          setDeletingNeedType(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  const columns = useMemo(
    () => getNeedTypeColumns(onEdit, onDelete, hasPermission),
    [hasPermission],
  );

  return {
    state: {
      dialogOpen,
      editingNeedType,
      deletingNeedType,
      isDeleting,
      columns,
    },
    actions: {
      setDialogOpen,
      setDeletingNeedType,
      onEdit,
      onCreate,
      onDelete,
      handleConfirmDelete,
    },
    hasPermission,
    dataTable,
  };
}
