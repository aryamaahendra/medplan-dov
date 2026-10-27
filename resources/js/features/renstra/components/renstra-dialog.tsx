import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import RenstraController from '@/actions/App/Http/Controllers/Renstra/RenstraController';
import {
  FormGrid,
  InputField,
  SwitchField,
  TextareaField,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
              <InputField
                id="name"
                name="name"
                label="Nama Renstra"
                placeholder="Contoh: Renstra 2025-2029 (Revisi 1)"
                defaultValue={renstra?.name ?? ''}
                required
                autoFocus
                error={errors.name}
              />

              <FormGrid cols={2}>
                <InputField
                  id="year_start"
                  name="year_start"
                  type="number"
                  label="Tahun Mulai"
                  min="2000"
                  max="2100"
                  defaultValue={renstra?.year_start ?? new Date().getFullYear()}
                  required
                  error={errors.year_start}
                />

                <InputField
                  id="year_end"
                  name="year_end"
                  type="number"
                  label="Tahun Selesai"
                  min="2000"
                  max="2100"
                  defaultValue={
                    renstra?.year_end ?? new Date().getFullYear() + 5
                  }
                  required
                  error={errors.year_end}
                />
              </FormGrid>

              <TextareaField
                id="description"
                name="description"
                label="Deskripsi"
                placeholder="Uraikan detail atau sasaran renstra..."
                defaultValue={renstra?.description ?? ''}
                rows={4}
                error={errors.description}
              />

              <SwitchField
                id="is_active"
                label="Aktifkan Renstra Ini"
                description="(Hanya 1 yang bisa aktif)"
                checked={renstra?.is_active ?? true}
                onCheckedChange={(checked) => setData('is_active', checked)}
                error={errors.is_active}
              />
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
