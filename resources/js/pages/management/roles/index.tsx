import { Head, router, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import rolesRoutes from '@/routes/roles';
import { getColumns } from './columns';
import type { Role } from './columns';

interface PaginatedRoles {
  data: Role[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface RolesIndexProps {
  roles: PaginatedRoles;
  filters: DataTableFilters;
}

export default function RolesIndex({ roles, filters }: RolesIndexProps) {
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

    router.visit(rolesRoutes.edit.url({ role: role.id }));
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

    router.delete(rolesRoutes.destroy.url({ role: deletingRole.id }), {
      onSuccess: () => {
        toast.success('Role deleted successfully.');
        setDeletingRole(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

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
            <Button asChild>
              <Link href={rolesRoutes.create.url()}>
                <Plus />
                Tambah Role
              </Link>
            </Button>
          )}
        </div>

        <DataTable
          columns={useMemo(
            () => getColumns(onEdit, onDelete, hasPermission),
            [hasPermission],
          )}
          data={roles.data}
          meta={roles}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Search by name..."
        />
      </div>

      <ConfirmDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        description={`Are you sure you want to delete the ${deletingRole?.name} role? This action cannot be undone.`}
        confirmText="Delete Role"
        variant="destructive"
        loading={isDeleting}
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
