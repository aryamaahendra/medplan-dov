import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import RenstraController from '@/actions/App/Http/Controllers/RenstraController';
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

  const { data, setData, post, patch, processing, errors, reset, clearErrors } =
    useForm({
      name: renstra?.name ?? '',
      year_start: renstra?.year_start ?? new Date().getFullYear(),
      year_end: renstra?.year_end ?? new Date().getFullYear() + 5,
      description: renstra?.description ?? '',
      is_active: renstra?.is_active ?? true,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && renstra) {
      patch(RenstraController.update.url({ renstra: renstra.id }), {
        onSuccess: () => {
          onOpenChange(false);
          toast.success('Renstra berhasil diperbarui.');
        },
      });
    } else {
      post(RenstraController.store.url(), {
        onSuccess: () => {
          onOpenChange(false);
          reset();
          toast.success('Renstra berhasil dibuat.');
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
            {isEditing ? 'Edit Renstra' : 'Tambah Renstra'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk renstra "${renstra.name}".`
              : 'Tambahkan renstra (Rencana Strategis) baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Renstra</Label>
            <Input
              id="name"
              placeholder="Contoh: Renstra 2025-2029 (Revisi 1)"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
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
                type="number"
                min="2000"
                max="2100"
                value={data.year_start}
                onChange={(e) =>
                  setData('year_start', parseInt(e.target.value))
                }
                required
              />
              <InputError message={errors.year_start} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year_end">Tahun Selesai</Label>
              <Input
                id="year_end"
                type="number"
                min="2000"
                max="2100"
                value={data.year_end}
                onChange={(e) => setData('year_end', parseInt(e.target.value))}
                required
              />
              <InputError message={errors.year_end} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Uraikan detail atau sasaran renstra..."
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={4}
            />
            <InputError message={errors.description} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData('is_active', checked)}
            />
            <Label htmlFor="is_active">Aktifkan Renstra Ini</Label>
            <p className="ml-auto text-xs text-muted-foreground">
              (Hanya 1 yang bisa aktif)
            </p>
          </div>
          <InputError message={errors.is_active} />

          <DialogFooter>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
