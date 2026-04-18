import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import rolesRoutes from '@/routes/roles';
import type { Permission } from '../permissions/columns';
import { getColumns } from './columns';
import type { Role } from './columns';
import { RoleDialog } from './role-dialog';

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
  permissions: Permission[];
  filters: DataTableFilters;
}

export default function RolesIndex({
  roles,
  permissions,
  filters,
}: RolesIndexProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
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

    setEditingRole(role);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
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

  const stableColumns = useMemo(() => getColumns(onEdit, onDelete), []);

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
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Role
          </Button>
        </div>

        <DataTable
          columns={stableColumns}
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

      <RoleDialog
        key={editingRole?.id ?? (dialogOpen ? 'create' : 'closed')}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
        permissions={permissions}
      />

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
