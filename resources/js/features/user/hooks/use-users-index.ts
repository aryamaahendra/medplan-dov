import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import userRoutes from '@/routes/users';

import { getColumns } from '../components/user-columns';
import type { User } from '../components/user-columns';

export interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface UsersIndexProps {
  users: PaginatedUsers;
  roles: { id: number; name: string }[];
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  filters: DataTableFilters;
}

export function useUsersIndex(props: UsersIndexProps) {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['users', 'filters'],
    });

  const onEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const onDelete = (user: User) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) {
      return;
    }

    setIsDeleting(true);

    router.delete(userRoutes.destroy.url({ user: deletingUser.id }), {
      onSuccess: () => {
        toast.success('User deleted successfully.');
        setDeletingUser(null);
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
      dialogOpen,
      editingUser,
      deletingUser,
      isDeleting,
    },
    handlers: {
      onEdit,
      onCreate,
      onDelete,
      handleConfirmDelete,
      setDialogOpen,
      setDeletingUser,
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
    users: props.users,
    roles: props.roles,
    organizationalUnits: props.organizationalUnits,
    filters: props.filters,
  };
}
