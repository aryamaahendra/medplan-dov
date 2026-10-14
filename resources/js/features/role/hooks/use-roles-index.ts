import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import rolesRoutes from '@/routes/roles';

import { getColumns } from '../components/role-columns';
import type { Role } from '../components/role-columns';

export interface PaginatedRoles {
  data: Role[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface RolesIndexProps {
  roles: PaginatedRoles;
  filters: DataTableFilters;
}

export function useRolesIndex(props: RolesIndexProps) {
  const { hasPermission } = usePermission();
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['roles', 'filters'],
    });

  const onEdit = (role: Role) => {
    if (role.name.toLowerCase() === 'superadmin') {
      toast.error('Cannot edit Superadmin role.');

      return;
    }

    router.visit(rolesRoutes.edit.url({ role: String(role.id) }));
  };

  const onDelete = (role: Role) => {
    if (role.name.toLowerCase() === 'superadmin') {
      toast.error('Cannot delete Superadmin role.');

      return;
    }

    setDeletingRole(role);
  };

  const handleConfirmDelete = () => {
    if (!deletingRole) {
      return;
    }

    setIsDeleting(true);

    router.delete(rolesRoutes.destroy.url({ role: String(deletingRole.id) }), {
      onSuccess: () => {
        toast.success('Role deleted successfully.');
        setDeletingRole(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const columns = useMemo(
    () => getColumns(onEdit, onDelete, hasPermission),
    [hasPermission],
  );

  return {
    state: {
      deletingRole,
      isDeleting,
    },
    handlers: {
      onEdit,
      onDelete,
      handleConfirmDelete,
      setDeletingRole,
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
    roles: props.roles,
    filters: props.filters,
  };
}
