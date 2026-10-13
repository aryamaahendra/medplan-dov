import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import organizationalUnitRoutes from '@/routes/organizational-units';

import { getColumns } from '../components/organizational-unit-columns';
import type { OrganizationalUnit } from '../components/organizational-unit-columns';

export interface PaginatedUnits {
  data: OrganizationalUnit[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface OrganizationalUnitsIndexProps {
  units: PaginatedUnits;
  allUnits: { id: number; name: string }[];
  filters: DataTableFilters;
}

export function useOrganizationalUnitsIndex(
  props: OrganizationalUnitsIndexProps,
) {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(
    null,
  );
  const [deletingUnit, setDeletingUnit] = useState<OrganizationalUnit | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoringUnit, setRestoringUnit] = useState<OrganizationalUnit | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [forceDeletingUnit, setForceDeletingUnit] =
    useState<OrganizationalUnit | null>(null);
  const [isForceDeleting, setIsForceDeleting] = useState(false);

  const {
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    onReset,
    mergeParams,
  } = useDataTable({
    only: ['units', 'filters'],
  });

  const isTrash = Boolean(props.filters.trash);

  const onToggleTrash = (checked: boolean) => {
    mergeParams({
      trash: checked ? true : undefined,
      page: 1,
    });
  };

  const onEdit = (unit: OrganizationalUnit) => {
    setEditingUnit(unit);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingUnit(null);
    setDialogOpen(true);
  };

  const onDelete = (unit: OrganizationalUnit) => {
    setDeletingUnit(unit);
  };

  const onRestore = (unit: OrganizationalUnit) => {
    setRestoringUnit(unit);
  };

  const onForceDelete = (unit: OrganizationalUnit) => {
    setForceDeletingUnit(unit);
  };

  const handleConfirmDelete = () => {
    if (!deletingUnit) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      organizationalUnitRoutes.destroy.url({
        organizational_unit: deletingUnit.id,
      }),
      {
        onSuccess: () => {
          toast.success('Unit organisasi berhasil dihapus.');
          setDeletingUnit(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  const handleConfirmRestore = () => {
    if (!restoringUnit) {
      return;
    }

    setIsRestoring(true);

    router.post(
      organizationalUnitRoutes.restore.url({
        id: restoringUnit.id,
      }),
      {},
      {
        onSuccess: () => {
          toast.success('Unit organisasi berhasil dipulihkan.');
          setRestoringUnit(null);
        },
        onError: (errors) => {
          const errorMessage =
            errors.error ||
            errors.message ||
            'Gagal memulihkan unit organisasi.';
          toast.error(errorMessage);
        },
        onFinish: () => setIsRestoring(false),
      },
    );
  };

  const handleConfirmForceDelete = () => {
    if (!forceDeletingUnit) {
      return;
    }

    setIsForceDeleting(true);

    router.delete(
      organizationalUnitRoutes.forceDelete.url({
        id: forceDeletingUnit.id,
      }),
      {
        onSuccess: () => {
          toast.success('Unit organisasi berhasil dihapus secara permanen.');
          setForceDeletingUnit(null);
        },
        onError: (errors) => {
          const errorMessage =
            errors.error ||
            errors.message ||
            'Gagal menghapus unit organisasi secara permanen.';
          toast.error(errorMessage);
        },
        onFinish: () => setIsForceDeleting(false),
      },
    );
  };

  const columns = useMemo(
    () =>
      getColumns(
        onEdit,
        onDelete,
        hasPermission,
        isTrash,
        onRestore,
        onForceDelete,
      ),
    [hasPermission, isTrash],
  );

  return {
    state: {
      dialogOpen,
      editingUnit,
      deletingUnit,
      isDeleting,
      restoringUnit,
      isRestoring,
      forceDeletingUnit,
      isForceDeleting,
      isTrash,
    },
    handlers: {
      onEdit,
      onCreate,
      onDelete,
      onRestore,
      onForceDelete,
      handleConfirmDelete,
      handleConfirmRestore,
      handleConfirmForceDelete,
      setDialogOpen,
      setDeletingUnit,
      setRestoringUnit,
      setForceDeletingUnit,
      onToggleTrash,
    },
    table: {
      columns,
      onSearch,
      onSort,
      onPageChange,
      onPerPageChange,
      onReset,
    },
    hasPermission,
    units: props.units,
    allUnits: props.allUnits,
    filters: props.filters,
  };
}
