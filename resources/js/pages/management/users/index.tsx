import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { getColumns } from '@/features/user/components/user-columns';
import type { User } from '@/features/user/components/user-columns';
import { UserDialog } from '@/features/user/components/user-dialog';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import { useResourceIndexController } from '@/hooks/use-resource-index-controller';
import type { PaginatedData } from '@/hooks/use-resource-index-controller';
import userRoutes from '@/routes/users';

export interface UsersIndexProps {
  users: PaginatedData<User>;
  roles: { id: number; name: string }[];
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  filters: DataTableFilters;
}

export default function UsersIndex({
  users,
  roles,
  organizationalUnits,
  filters,
}: UsersIndexProps) {
  const { hasPermission } = usePermission();

  const controller = useResourceIndexController<User>({
    data: users,
    filters,
    only: ['users', 'filters'],
    resourceName: 'User',
    deleteUrl: (user) => userRoutes.destroy.url({ user: user.id }),
    getColumns: ({ onEdit, onDelete }) =>
      getColumns(onEdit, onDelete, hasPermission),
    searchPlaceholder: 'Search by name or email...',
  });

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
            <Button onClick={controller.dialog.openCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah User
            </Button>
          )}
        </div>

        <DataTable {...controller.tableProps} />
      </div>

      <UserDialog
        open={controller.dialog.isOpen}
        onOpenChange={controller.dialog.setIsOpen}
        user={controller.dialog.editingItem}
        roles={roles}
        organizationalUnits={organizationalUnits}
      />

      <ConfirmDialog
        open={controller.deleteDialog.isOpen}
        onOpenChange={controller.deleteDialog.setIsOpen}
        onConfirm={controller.deleteDialog.confirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${controller.deleteDialog.deletingItem?.name}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="destructive"
        loading={controller.deleteDialog.isDeleting}
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
