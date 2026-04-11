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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { OrganizationalUnit } from './columns';
import OrganizationalUnitController from '@/actions/App/Http/Controllers/OrganizationalUnitController';

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

  const { data, setData, submit, processing, errors } = useForm({
    name: unit?.name ?? '',
    code: unit?.code ?? '',
    parent_id: unit?.parent_id?.toString() ?? null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(
          isEditing
            ? 'Unit organisasi berhasil diperbarui.'
            : 'Unit organisasi berhasil dibuat.',
        );
      },
    };

    if (isEditing) {
      submit(
        OrganizationalUnitController.update({
          organizational_unit: unit!.id,
        }),
        options,
      );
    } else {
      submit(OrganizationalUnitController.store(), options);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Unit Organisasi' : 'Tambah Unit Organisasi'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk unit ${unit?.name}.`
              : 'Tambahkan unit organisasi baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Unit</Label>
            <Input
              id="name"
              name="name"
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
              name="code"
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
              value={data.parent_id ?? '0'}
              onValueChange={(value) =>
                setData('parent_id', value === '0' ? null : value)
              }
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
            <input
              type="hidden"
              name="parent_id"
              value={data.parent_id ?? ''}
            />
            <InputError message={errors.parent_id} />
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
