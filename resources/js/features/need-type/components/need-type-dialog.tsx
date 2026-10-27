import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import NeedTypeController from '@/actions/App/Http/Controllers/Need/NeedTypeController';
import { InputField, SwitchField, TextareaField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { NeedType } from '../types/need-type.types';

interface NeedTypeDialogProps {
  needType?: NeedType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NeedTypeDialog({
  needType,
  open,
  onOpenChange,
}: NeedTypeDialogProps) {
  const isEditing = !!needType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Edit Kategori Kebutuhan'
              : 'Tambah Kategori Kebutuhan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk kategori kebutuhan ${needType.name}.`
              : 'Tambahkan kategori kebutuhan baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={needType?.id ?? 'new-need-type'}
          {...(isEditing
            ? NeedTypeController.update.form({ need_type: needType.id })
            : NeedTypeController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Kategori kebutuhan berhasil diperbarui.'
                : 'Kategori kebutuhan berhasil dibuat.',
            );
          }}
          className="space-y-4"
        >
          {({ setData, processing, errors }: any) => (
            <>
              <InputField
                id="name"
                name="name"
                label="Nama"
                placeholder="Contoh: Kebutuhan Mendesak, Rutin Bulanan"
                defaultValue={needType?.name ?? ''}
                required
                autoFocus
                error={errors.name}
              />

              <InputField
                id="code"
                name="code"
                label="Kode"
                placeholder="Contoh: URGENT, ROUTINE"
                defaultValue={needType?.code ?? ''}
                required
                error={errors.code}
              />

              <TextareaField
                id="description"
                name="description"
                label="Deskripsi"
                placeholder="Masukkan deskripsi opsional untuk kategori kebutuhan ini..."
                defaultValue={needType?.description ?? ''}
                error={errors.description}
              />

              <SwitchField
                id="is_active"
                label="Aktif"
                checked={needType?.is_active ?? true}
                onCheckedChange={(checked) => setData('is_active', checked)}
                error={errors.is_active}
              />

              <InputField
                id="order_column"
                name="order_column"
                type="number"
                label="Urutan"
                placeholder="0"
                defaultValue={needType?.order_column ?? 0}
                required
                error={errors.order_column}
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
                  {isEditing ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
