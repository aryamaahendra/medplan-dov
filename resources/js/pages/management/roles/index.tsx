import { Head, Link } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { useRolesIndex } from '@/features/role/hooks/use-roles-index';
import type { RolesIndexProps } from '@/features/role/hooks/use-roles-index';
import rolesRoutes from '@/routes/roles';

export default function RolesIndex(props: RolesIndexProps) {
  const { state, handlers, table, hasPermission, roles, filters } =
    useRolesIndex(props);

  return (
    <>
      <Head title="Roles" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Roles</h1>
            <p className="text-sm text-muted-foreground">
              Manage roles and their associated permissions.
            </p>
          </div>
          {hasPermission('create roles') && (
            <Button
              render={
                <Link href={rolesRoutes.create.url()}>
                  <RiAddLine />
                  Tambah Role
                </Link>
              }
            />
          )}
        </div>

        <DataTable
          columns={table.columns}
          data={roles.data}
          meta={roles}
          filters={filters}
          onSearch={table.onSearch}
          onSort={table.onSort}
          onPageChange={table.onPageChange}
          onPerPageChange={table.onPerPageChange}
          onReset={table.onReset}
          searchPlaceholder="Search by name..."
        />
      </div>

      <ConfirmDialog
        open={!!state.deletingRole}
        onOpenChange={(open) => !open && handlers.setDeletingRole(null)}
        onConfirm={handlers.handleConfirmDelete}
        title="Delete Role"
        description={`Are you sure you want to delete the ${state.deletingRole?.name} role? This action cannot be undone.`}
        confirmText="Delete Role"
        variant="destructive"
        loading={state.isDeleting}
      />
    </>
  );
}

RolesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Roles',
      href: rolesRoutes.index.url(),
    },
  ],
};
