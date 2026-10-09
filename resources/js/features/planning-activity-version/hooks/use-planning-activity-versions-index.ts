import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/Planning/PlanningActivityVersionController';
import PlanningRecalculateController from '@/actions/App/Http/Controllers/Planning/PlanningRecalculateController';
import { useDataTable } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

import { getColumns } from '../components/planning-activity-columns';

export function usePlanningActivityVersionsIndex(version: PlanningVersion) {
  const { hasPermission } = usePermission();
  const { onSearch, onSort, onReset, onPageChange, onPerPageChange } =
    useDataTable({
      only: ['activities', 'filters'],
    });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<PlanningActivityVersion | null>(null);

  const handleEdit = useCallback((activity: PlanningActivityVersion) => {
    router.visit(PlanningActivityVersionController.edit.url(activity.id));
  }, []);

  const handleDelete = useCallback((activity: PlanningActivityVersion) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!selectedActivity) {
      return;
    }

    router.delete(
      PlanningActivityVersionController.destroy.url(selectedActivity.id),
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          toast.success('Aktivitas berhasil dihapus!');
        },
      },
    );
  }, [selectedActivity]);

  const handleRecalculate = useCallback(() => {
    setIsRecalculating(true);
    router.post(
      PlanningRecalculateController.url(version.id),
      {},
      {
        onSuccess: () => toast.success('Berhasil menghitung ulang.'),
        onFinish: () => setIsRecalculating(false),
      },
    );
  }, [version.id]);

  const columns = useMemo(
    () => getColumns(version, handleEdit, handleDelete, hasPermission),
    [version, handleEdit, handleDelete, hasPermission],
  );

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => version.year_start + i),
    [version.year_start],
  );

  return {
    hasPermission,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isRecalculating,
    selectedActivity,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleRecalculate,
    columns,
    years,
    dataTable: {
      onSearch,
      onSort,
      onReset,
      onPageChange,
      onPerPageChange,
    },
  };
}
