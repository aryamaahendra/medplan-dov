import { Head } from '@inertiajs/react';
import rolesRoutes from '@/routes/roles';
import type { Permission } from '../permissions/columns';
import type { Role } from './columns';
import { RoleForm } from './role-form';

interface RoleEditProps {
  role: Role;
  permissions: Permission[];
}

export default function RoleEdit({ role, permissions }: RoleEditProps) {
  return (
    <>
      <Head title={`Edit Role: ${role.name}`} />

      <div className="max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Role</h1>
          <p className="mt-1 text-muted-foreground">
            Ubah nama role atau perbarui daftar hak akses untuk role{' '}
            <strong>{role.name}</strong>.
          </p>
        </div>

        <RoleForm role={role} permissions={permissions} />
      </div>
    </>
  );
}

RoleEdit.layout = {
  breadcrumbs: [
    {
      title: 'Roles',
      href: rolesRoutes.index.url(),
    },
    {
      title: 'Edit Role',
      href: '#',
    },
  ],
};
