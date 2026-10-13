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

  const columns = useMemo(
    () => getColumns(onEdit, onDelete, hasPermission, isTrash),
    [hasPermission, isTrash],
  );

  return {
    state: {
      dialogOpen,
      editingUnit,
      deletingUnit,
      isDeleting,
      isTrash,
    },
    handlers: {
      onEdit,
      onCreate,
      onDelete,
      handleConfirmDelete,
      setDialogOpen,
      setDeletingUnit,
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
