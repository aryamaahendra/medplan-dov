import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

import { InputField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Role } from '@/features/role/types/role.types';
import rolesRoutes from '@/routes/roles';

interface RoleEditDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleEditDialog({
  role,
  open,
  onOpenChange,
}: RoleEditDialogProps) {
  const { data, setData, put, processing, errors, reset, clearErrors } =
    useForm({
      name: '',
    });

  useEffect(() => {
    if (role && open) {
      setData('name', role.name);
      clearErrors();
    } else {
      reset();
    }
  }, [role, open, clearErrors, reset, setData]);

  if (!role) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(rolesRoutes.update.url({ role: role.id }), {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ubah Nama Role</DialogTitle>
            <DialogDescription>
              Perbarui nama untuk role <strong>{role.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <InputField
              label="Nama Role"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={errors.name}
              required
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                processing || !data.name.trim() || data.name === role.name
              }
            >
              {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
