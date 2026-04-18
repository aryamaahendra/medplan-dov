import { usePage } from '@inertiajs/react';

export function usePermission() {
  const { auth } = usePage().props;

  const hasPermission = (permission: string) => {
    return (
      auth.permissions.includes(permission) ||
      auth.roles.includes('super-admin')
    );
  };

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasRole = (role: string) => {
    return auth.roles.includes(role) || auth.roles.includes('super-admin');
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some((r) => hasRole(r));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isSuperAdmin: auth.roles.includes('super-admin'),
  };
}
