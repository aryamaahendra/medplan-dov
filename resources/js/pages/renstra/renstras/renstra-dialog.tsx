import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import RenstraController from '@/actions/App/Http/Controllers/Renstra/RenstraController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Renstra } from '@/types';

interface RenstraDialogProps {
  renstra?: Renstra | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenstraDialog({
  renstra,
  open,
  onOpenChange,
}: RenstraDialogProps) {
  const isEditing = !!renstra;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Renstra' : 'Tambah Renstra'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk renstra "${renstra.name}".`
              : 'Tambahkan renstra (Rencana Strategis) baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={renstra?.id ?? 'new-renstra'}
          {...(isEditing
            ? RenstraController.update.form({ renstra: renstra!.id })
            : RenstraController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Renstra berhasil diperbarui.'
                : 'Renstra berhasil dibuat.',
            );
          }}
          className="space-y-4"
        >
          {({ setData, processing, errors }: any) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Renstra</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Renstra 2025-2029 (Revisi 1)"
                  defaultValue={renstra?.name ?? ''}
                  required
                  autoFocus
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year_start">Tahun Mulai</Label>
                  <Input
                    id="year_start"
                    name="year_start"
                    type="number"
                    min="2000"
                    max="2100"
                    defaultValue={
                      renstra?.year_start ?? new Date().getFullYear()
                    }
                    required
                  />
                  <InputError message={errors.year_start} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year_end">Tahun Selesai</Label>
                  <Input
                    id="year_end"
                    name="year_end"
                    type="number"
                    min="2000"
                    max="2100"
                    defaultValue={
                      renstra?.year_end ?? new Date().getFullYear() + 5
                    }
                    required
                  />
                  <InputError message={errors.year_end} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Uraikan detail atau sasaran renstra..."
                  defaultValue={renstra?.description ?? ''}
                  rows={4}
                />
                <InputError message={errors.description} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={renstra?.is_active ?? true}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">Aktifkan Renstra Ini</Label>
                <p className="ml-auto text-xs text-muted-foreground">
                  (Hanya 1 yang bisa aktif)
                </p>
              </div>
              <InputError message={errors.is_active} />

              <DialogFooter className="mb-0!">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Renstra'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
