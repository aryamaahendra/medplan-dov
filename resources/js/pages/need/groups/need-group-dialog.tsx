import { useForm } from '@inertiajs/react';
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

import type { NeedGroup } from './columns';
import NeedGroupController from '@/actions/App/Http/Controllers/Need/NeedGroupController';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <NeedGroupForm
          key={needGroup?.id ?? 'new-need-group'}
          needGroup={needGroup}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function NeedGroupForm({
  needGroup,
  onClose,
}: {
  needGroup?: NeedGroup | null;
  onClose: () => void;
}) {
  const isEditing = !!needGroup;

  const { data, setData, submit, processing, errors } = useForm({
    name: needGroup?.name ?? '',
    description: needGroup?.description ?? '',
    year: needGroup?.year ?? new Date().getFullYear(),
    is_active: needGroup?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submit(
      isEditing
        ? NeedGroupController.update({ need_group: needGroup.id })
        : NeedGroupController.store(),
      {
        onSuccess: () => {
          toast.success(
            isEditing
              ? 'Kelompok usulan berhasil diperbarui.'
              : 'Kelompok usulan berhasil dibuat.',
          );
          onClose();
        },
      },
    );
  };

  return (
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
          <InputError message={errors.name} />
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
          <InputError message={errors.year} />
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
          <InputError message={errors.description} />
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

      <DialogFooter className="mb-0!">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={processing}>
          {isEditing ? 'Simpan Perubahan' : 'Tambah Kelompok'}
        </Button>
      </DialogFooter>
    </form>
  );
}
