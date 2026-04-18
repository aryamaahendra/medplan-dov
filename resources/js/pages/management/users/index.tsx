import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import userRoutes from '@/routes/users';
import { getColumns } from './columns';
import type { User } from './columns';
import { UserDialog } from './user-dialog';

interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface UsersIndexProps {
  users: PaginatedUsers;
  roles: { id: number; name: string }[];
  filters: DataTableFilters;
}

export default function UsersIndex({ users, roles, filters }: UsersIndexProps) {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use useDataTable to handle server-side state via Inertia URL updates
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

  // Safe to memoize columns
  const stableColumns = useMemo(
    () => getColumns(onEdit, onDelete, hasPermission),
    [hasPermission],
  );

  return (
    <>
      <Head title="Users" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage and browse all registered users.
            </p>
          </div>
          {hasPermission('create users') && (
            <Button onClick={onCreate}>
              <Plus />
              Tambah User
            </Button>
          )}
        </div>

        <DataTable
          columns={stableColumns}
          data={users.data}
          meta={users} // The whole paginated object usually matches our PaginationMeta
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Search by name or email..."
        />
      </div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        roles={roles}
      />

      <ConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${deletingUser?.name}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

UsersIndex.layout = {
  breadcrumbs: [
    {
      title: 'Users',
      href: userRoutes.index.url(),
    },
  ],
};
