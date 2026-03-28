import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import NeedTypeController from '@/actions/App/Http/Controllers/NeedTypeController';
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

  const {
    data,
    setData,
    post,
    patch,
    processing,
    errors,
    reset,
    clearErrors,
  } = useForm({
    name: needType?.name ?? '',
    code: needType?.code ?? '',
    description: needType?.description ?? '',
    is_active: needType?.is_active ?? true,
    order_column: needType?.order_column ?? 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && needType) {
      patch(
        NeedTypeController.update.url({
          need_type: needType.id,
        }),
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success('Jenis kebutuhan berhasil diperbarui.');
          },
        },
      );
    } else {
      post(NeedTypeController.store.url(), {
        onSuccess: () => {
          onOpenChange(false);
          reset();
          toast.success('Jenis kebutuhan berhasil dibuat.');
        },
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);

        if (!open) {
          clearErrors();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
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

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              placeholder="Contoh: Kebutuhan Mendesak, Rutin Bulanan"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              required
              autoFocus
            />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code">Kode</Label>
            <Input
              id="code"
              placeholder="Contoh: URGENT, ROUTINE"
              value={data.code}
              onChange={(e) => setData('code', e.target.value)}
              required
            />
            <InputError message={errors.code} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Masukkan deskripsi opsional untuk jenis kebutuhan ini..."
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
            <InputError message={errors.description} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData('is_active', checked)}
            />
            <Label htmlFor="is_active">Aktif</Label>
            <InputError message={errors.is_active} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="order_column">Urutan</Label>
            <Input
              id="order_column"
              type="number"
              placeholder="0"
              value={data.order_column}
              onChange={(e) => setData('order_column', parseInt(e.target.value, 10) || 0)}
              required
            />
            <InputError message={errors.order_column} />
          </div>

          <DialogFooter>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
