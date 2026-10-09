import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import needGroupRoutes from '@/routes/need-groups';
import type { NeedGroup } from '../types/need-group.types';

export function useNeedGroupsIndex() {
  const { hasPermission } = usePermission();
  const [editingGroup, setEditingGroup] = useState<NeedGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<NeedGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rolloverGroup, setRolloverGroup] = useState<NeedGroup | null>(null);

  const dataTable = useDataTable({
    only: ['needGroups', 'filters'],
  });

  const onEdit = (group: NeedGroup) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const onDelete = (group: NeedGroup) => {
    setDeletingGroup(group);
  };

  const onRollover = (group: NeedGroup) => {
    setRolloverGroup(group);
  };

  const onCreate = () => {
    setEditingGroup(null);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      needGroupRoutes.destroy.url({ need_group: deletingGroup.id }),
      {
        onSuccess: () => {
          toast.success('Kelompok usulan berhasil dihapus.');
          setDeletingGroup(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  return {
    state: {
      editingGroup,
      isDialogOpen,
      deletingGroup,
      isDeleting,
      rolloverGroup,
    },
    actions: {
      setIsDialogOpen,
      setDeletingGroup,
      setRolloverGroup,
      onEdit,
      onDelete,
      onRollover,
      onCreate,
      handleConfirmDelete,
    },
    hasPermission,
    dataTable,
  };
}
