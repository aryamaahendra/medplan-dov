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
import rolesRoutes from '@/routes/roles';

interface RoleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleCreateDialog({
  open,
  onOpenChange,
}: RoleCreateDialogProps) {
  const { data, setData, post, processing, errors, reset, clearErrors } =
    useForm({
      name: '',
    });

  useEffect(() => {
    if (!open) {
      reset();
      clearErrors();
    }
  }, [open, reset, clearErrors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(rolesRoutes.store.url(), {
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
            <DialogTitle>Tambah Role Baru</DialogTitle>
            <DialogDescription>
              Masukkan nama role baru. Setelah dibuat, Anda dapat mengatur hak
              aksesnya pada matriks.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <InputField
              label="Nama Role"
              placeholder="Contoh: auditor, verifikator"
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
            <Button type="submit" disabled={processing || !data.name.trim()}>
              {processing ? 'Menyimpan...' : 'Tambah Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
