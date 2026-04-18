import { Head } from '@inertiajs/react';
import rolesRoutes from '@/routes/roles';
import type { Permission } from '../permissions/columns';
import { RoleForm } from './role-form';

interface RoleCreateProps {
  permissions: Permission[];
}

export default function RoleCreate({ permissions }: RoleCreateProps) {
  return (
    <>
      <Head title="Tambah Role" />

      <div className="max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Tambah Role</h1>
          <p className="mt-1 text-muted-foreground">
            Buat role baru dan tentukan hak akses yang sesuai.
          </p>
        </div>

        <RoleForm permissions={permissions} />
      </div>
    </>
  );
}

RoleCreate.layout = {
  breadcrumbs: [
    {
      title: 'Roles',
      href: rolesRoutes.index.url(),
    },
    {
      title: 'Tambah Role',
      href: rolesRoutes.create.url(),
    },
  ],
};
