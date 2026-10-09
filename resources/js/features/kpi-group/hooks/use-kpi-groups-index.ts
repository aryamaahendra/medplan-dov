import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup } from '@/types';

export function useKpiGroupsIndex() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<KpiGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<KpiGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const dataTable = useDataTable({ only: ['groups', 'filters'] });

  const onEdit = (group: KpiGroup) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const onDelete = (group: KpiGroup) => {
    setDeletingGroup(group);
  };

  const onActivate = (group: KpiGroup) => {
    setIsActivating(true);
    router.post(
      groupRoutes.activate.url({ group: group.id }),
      {},
      {
        onSuccess: () => {
          toast.success(`Periode KPI "${group.name}" diaktifkan.`);
        },
        onFinish: () => setIsActivating(false),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) {
      return;
    }

    setIsDeleting(true);

    router.delete(groupRoutes.destroy.url({ group: deletingGroup.id }), {
      onSuccess: () => {
        toast.success('Periode KPI berhasil dihapus.');
        setDeletingGroup(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  return {
    state: {
      dialogOpen,
      editingGroup,
      deletingGroup,
      isDeleting,
      isActivating,
    },
    handlers: {
      setDialogOpen,
      setDeletingGroup,
      onEdit,
      onCreate,
      onDelete,
      onActivate,
      handleConfirmDelete,
    },
    dataTable,
  };
}
