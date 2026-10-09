import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import strategicServicePlansRoutes from '@/routes/strategic-service-plans';
import type { StrategicServicePlan } from '@/types';

import { getColumns } from '../components/strategic-service-plan-columns';

export function useStrategicServicePlansIndex() {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StrategicServicePlan | null>(
    null,
  );
  const [deletingPlan, setDeletingPlan] = useState<StrategicServicePlan | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['plans', 'filters'],
    });

  const onEdit = useCallback((plan: StrategicServicePlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  }, []);

  const onCreate = useCallback(() => {
    setEditingPlan(null);
    setDialogOpen(true);
  }, []);

  const onDelete = useCallback((plan: StrategicServicePlan) => {
    setDeletingPlan(plan);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingPlan) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      strategicServicePlansRoutes.destroy.url({
        strategic_service_plan: deletingPlan.id,
      }),
      {
        onSuccess: () => {
          toast.success('Rencana pengembangan layanan berhasil dihapus.');
          setDeletingPlan(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  }, [deletingPlan]);

  const columns = useMemo(
    () => getColumns(onEdit, onDelete, hasPermission),
    [onEdit, onDelete, hasPermission],
  );

  return {
    hasPermission,
    dialogOpen,
    setDialogOpen,
    editingPlan,
    deletingPlan,
    setDeletingPlan,
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
