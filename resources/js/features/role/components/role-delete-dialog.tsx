import { router } from '@inertiajs/react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import type { Role } from '@/features/role/types/role.types';
import rolesRoutes from '@/routes/roles';

interface RoleDeleteDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleDeleteDialog({
  role,
  open,
  onOpenChange,
}: RoleDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!role) {
    return null;
  }

  const hasAssignedUsers = (role.users_count ?? 0) > 0;
  const isSuperAdmin = role.name.toLowerCase() === 'super-admin';

  const handleDelete = () => {
    if (hasAssignedUsers || isSuperAdmin) {
      return;
    }

    setLoading(true);
    router.delete(rolesRoutes.destroy.url({ role: role.id }), {
      preserveScroll: true,
      onFinish: () => {
        setLoading(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Role {role.name}</AlertDialogTitle>
          <AlertDialogDescription>
            {isSuperAdmin ? (
              <span className="font-medium text-destructive">
                Role Super Admin adalah role sistem inti dan tidak dapat
                dihapus.
              </span>
            ) : hasAssignedUsers ? (
              <span className="font-medium text-destructive">
                Tidak dapat menghapus role ini karena terdapat{' '}
                {role.users_count} pengguna aktif yang memiliki role ini.
                Silakan pindahkan atau hapus role pada pengguna tersebut
                terlebih dahulu.
              </span>
            ) : (
              <span>
                Apakah Anda yakin ingin menghapus role{' '}
                <strong>{role.name}</strong>? Tindakan ini tidak dapat
                dibatalkan.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {hasAssignedUsers || isSuperAdmin ? 'Tutup' : 'Batal'}
          </AlertDialogCancel>
          {!hasAssignedUsers && !isSuperAdmin && (
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Menghapus...' : 'Hapus Role'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
