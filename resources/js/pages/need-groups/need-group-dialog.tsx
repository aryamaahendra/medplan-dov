import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

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
import needGroupRoutes from '@/routes/need-groups';

import type { NeedGroup } from './columns';

interface NeedGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needGroup?: NeedGroup | null;
}

export function NeedGroupDialog({
  open,
  onOpenChange,
  needGroup,
}: NeedGroupDialogProps) {
  const isEditing = !!needGroup;

  const { data, setData, post, put, processing, errors, reset, clearErrors } =
    useForm({
      name: '',
      description: '',
      year: new Date().getFullYear(),
      is_active: true,
    });

  useEffect(() => {
    if (needGroup) {
      setData({
        name: needGroup.name,
        description: needGroup.description || '',
        year: needGroup.year,
        is_active: needGroup.is_active,
      });
    } else {
      reset();
    }

    clearErrors();
  }, [needGroup, open, clearErrors, reset, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      put(needGroupRoutes.update.url({ need_group: needGroup.id }), {
        onSuccess: () => {
          toast.success('Kelompok usulan berhasil diperbarui.');
          onOpenChange(false);
        },
      });
    } else {
      post(needGroupRoutes.store.url(), {
        onSuccess: () => {
          toast.success('Kelompok usulan berhasil dibuat.');
          onOpenChange(false);
          reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Ubah Kelompok Usulan' : 'Tambah Kelompok Usulan'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Perbarui informasi kelompok usulan di sini.'
                : 'Masukan detail kelompok usulan baru di sini.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kelompok</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Contoh: Usulan Kebutuhan 2026"
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="year">Tahun</Label>
              <Input
                id="year"
                type="number"
                value={data.year}
                onChange={(e) => setData('year', parseInt(e.target.value))}
                min={2020}
                max={2030}
                required
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Deskripsi opsional..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Kelompok'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
