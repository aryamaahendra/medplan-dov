import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import OrganizationalUnitController from '@/actions/App/Http/Controllers/OrganizationalUnitController';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { OrganizationalUnit } from './columns';

interface OrganizationalUnitDialogProps {
  unit?: OrganizationalUnit | null;
  allUnits: { id: number; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationalUnitDialog({
  unit,
  allUnits,
  open,
  onOpenChange,
}: OrganizationalUnitDialogProps) {
  const isEditing = !!unit;

  // We use useForm hook to handle the select value which doesn't work with native form elements easily
  const {
    data,
    setData,
    post,
    patch,
    processing,
    errors,
    reset,
    clearErrors,
    transform,
  } = useForm({
    name: unit?.name ?? '',
    code: unit?.code ?? '',
    parent_id: unit?.parent_id?.toString() ?? '0', // '0' for none
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    transform((data) => ({
      ...data,
      parent_id: data.parent_id === '0' ? null : data.parent_id,
    }));

    if (isEditing && unit) {
      patch(
        OrganizationalUnitController.update.url({
          organizational_unit: unit.id,
        }),
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success('Unit organisasi berhasil diperbarui.');
          },
        },
      );
    } else {
      post(OrganizationalUnitController.store.url(), {
        onSuccess: () => {
          onOpenChange(false);
          reset();
          toast.success('Unit organisasi berhasil dibuat.');
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
            {isEditing ? 'Edit Unit Organisasi' : 'Tambah Unit Organisasi'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk unit ${unit.name}.`
              : 'Tambahkan unit organisasi baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Unit</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              required
              autoFocus
              placeholder="Contoh: Bidang A, Subbagian Keuangan"
            />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code">Kode Resmi</Label>
            <Input
              id="code"
              value={data.code}
              onChange={(e) => setData('code', e.target.value)}
              required
              placeholder="Contoh: BPKAD-KEU"
            />
            <InputError message={errors.code} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parent_id">Unit Induk (Tree Structure)</Label>
            <Select
              value={data.parent_id}
              onValueChange={(value) => setData('parent_id', value)}
            >
              <SelectTrigger id="parent_id">
                <SelectValue placeholder="Pilih unit induk (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tanpa Induk (Root)</SelectItem>
                {allUnits
                  .filter((u) => u.id !== unit?.id)
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <InputError message={errors.parent_id} />
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
