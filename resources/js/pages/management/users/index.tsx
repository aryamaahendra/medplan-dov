import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { UserDialog } from '@/features/user/components/user-dialog';
import { useUsersIndex } from '@/features/user/hooks/use-users-index';
import type { UsersIndexProps } from '@/features/user/hooks/use-users-index';
import userRoutes from '@/routes/users';

export default function UsersIndex(props: UsersIndexProps) {
  const {
    state,
    handlers,
    table,
    hasPermission,
    users,
    roles,
    organizationalUnits,
    filters,
  } = useUsersIndex(props);

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
            <Button onClick={handlers.onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah User
            </Button>
          )}
        </div>

        <DataTable
          columns={table.columns}
          data={users.data}
          meta={users}
          filters={filters}
          onSearch={table.onSearch}
          onSort={table.onSort}
          onPageChange={table.onPageChange}
          onPerPageChange={table.onPerPageChange}
          onReset={table.onReset}
          searchPlaceholder="Search by name or email..."
        />
      </div>

      <UserDialog
        open={state.dialogOpen}
        onOpenChange={handlers.setDialogOpen}
        user={state.editingUser}
        roles={roles}
        organizationalUnits={organizationalUnits}
      />

      <ConfirmDialog
        open={!!state.deletingUser}
        onOpenChange={(open) => !open && handlers.setDeletingUser(null)}
        onConfirm={handlers.handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${state.deletingUser?.name}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="destructive"
        loading={state.isDeleting}
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
