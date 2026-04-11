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
import { Switch } from '@/components/ui/switch';

import { Textarea } from '@/components/ui/textarea';
import type { NeedType } from './columns';
import NeedTypeController from '@/actions/App/Http/Controllers/NeedTypeController';

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
            {isEditing ? 'Edit Jenis Kebutuhan' : 'Tambah Jenis Kebutuhan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk jenis kebutuhan ${needType.name}.`
              : 'Tambahkan jenis kebutuhan baru ke dalam sistem.'}
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
                ? 'Jenis kebutuhan berhasil diperbarui.'
                : 'Jenis kebutuhan berhasil dibuat.',
            );
          }}
          className="space-y-4"
        >
          {({ setData, processing, errors }: any) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Kebutuhan Mendesak, Rutin Bulanan"
                  defaultValue={needType?.name ?? ''}
                  required
                  autoFocus
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Kode</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Contoh: URGENT, ROUTINE"
                  defaultValue={needType?.code ?? ''}
                  required
                />
                <InputError message={errors.code} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Masukkan deskripsi opsional untuk jenis kebutuhan ini..."
                  defaultValue={needType?.description ?? ''}
                />
                <InputError message={errors.description} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={needType?.is_active ?? true}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">Aktif</Label>
                <InputError message={errors.is_active} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="order_column">Urutan</Label>
                <Input
                  id="order_column"
                  name="order_column"
                  type="number"
                  placeholder="0"
                  defaultValue={needType?.order_column ?? 0}
                  required
                />
                <InputError message={errors.order_column} />
              </div>

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
