import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';
import type { Sasaran, Tujuan } from '@/types';
import SasaranController from '@/actions/App/Http/Controllers/SasaranController';

interface SasaranDialogProps {
  tujuan: Tujuan;
  sasaran?: Sasaran | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SasaranDialog({
  tujuan,
  sasaran,
  open,
  onOpenChange,
}: SasaranDialogProps) {
  const isEditing = !!sasaran;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Sasaran' : 'Tambah Sasaran'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk sasaran "${sasaran.name}".`
              : `Tambahkan sasaran baru untuk tujuan "${tujuan.name}".`}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={sasaran?.id ?? 'new-sasaran'}
          {...(isEditing && sasaran
            ? SasaranController.update.form({ sasaran: sasaran.id })
            : SasaranController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Sasaran berhasil diperbarui.'
                : 'Sasaran berhasil dibuat.',
            );
          }}
          className="space-y-4 py-2"
        >
          {({ processing, errors }) => (
            <>
              <input type="hidden" name="tujuan_id" value={tujuan.id} />

              <div className="grid gap-2">
                <Label htmlFor="sasaran-name">Nama Sasaran</Label>
                <Input
                  id="sasaran-name"
                  name="name"
                  placeholder="Contoh: Meningkatnya Kompetensi Pegawai"
                  defaultValue={sasaran?.name ?? ''}
                  required
                  autoFocus
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sasaran-description">Deskripsi</Label>
                <Textarea
                  id="sasaran-description"
                  name="description"
                  placeholder="Keterangan tambahan..."
                  defaultValue={sasaran?.description ?? ''}
                  rows={3}
                />
                <InputError message={errors.description} />
              </div>

              <DialogFooter className="-mb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Sasaran'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
