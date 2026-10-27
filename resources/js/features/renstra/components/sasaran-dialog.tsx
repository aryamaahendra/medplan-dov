import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import SasaranController from '@/actions/App/Http/Controllers/Renstra/SasaranController';
import { InputField, TextareaField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Sasaran, Tujuan } from '@/types';

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

              <InputField
                id="sasaran-name"
                name="name"
                label="Nama Sasaran"
                placeholder="Contoh: Meningkatnya Kompetensi Pegawai"
                defaultValue={sasaran?.name ?? ''}
                required
                autoFocus
                error={errors.name}
              />

              <TextareaField
                id="sasaran-description"
                name="description"
                label="Deskripsi"
                placeholder="Keterangan tambahan..."
                defaultValue={sasaran?.description ?? ''}
                rows={3}
                error={errors.description}
              />

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
