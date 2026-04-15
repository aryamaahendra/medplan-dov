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
import type { Renstra, Tujuan } from '@/types';
import TujuanController from '@/actions/App/Http/Controllers/Renstra/TujuanController';

interface TujuanDialogProps {
  renstra: Renstra;
  tujuan?: Tujuan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TujuanDialog({
  renstra,
  tujuan,
  open,
  onOpenChange,
}: TujuanDialogProps) {
  const isEditing = !!tujuan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Tujuan' : 'Tambah Tujuan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk tujuan "${tujuan.name}".`
              : `Tambahkan tujuan baru untuk renstra "${renstra.name}".`}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={tujuan?.id ?? 'new-tujuan'}
          {...(isEditing && tujuan
            ? TujuanController.update.form({ tujuan: tujuan.id })
            : TujuanController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Tujuan berhasil diperbarui.'
                : 'Tujuan berhasil dibuat.',
            );
          }}
          className="space-y-4 py-2"
        >
          {({ processing, errors }) => (
            <>
              <input type="hidden" name="renstra_id" value={renstra.id} />

              <div className="grid gap-2">
                <Label htmlFor="name">Nama Tujuan</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Meningkatkan Kualitas SDM"
                  defaultValue={tujuan?.name ?? ''}
                  required
                  autoFocus
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Keterangan tambahan..."
                  defaultValue={tujuan?.description ?? ''}
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
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Tujuan'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
