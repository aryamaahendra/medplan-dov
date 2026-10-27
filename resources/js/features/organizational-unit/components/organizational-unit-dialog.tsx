import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import OrganizationalUnitController from '@/actions/App/Http/Controllers/Management/OrganizationalUnitController';
import { InputField, SelectField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { OrganizationalUnit } from './organizational-unit-columns';

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
          <InputField
            id="name"
            name="name"
            label="Nama Unit"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            required
            autoFocus
            placeholder="Contoh: Bidang A, Subbagian Keuangan"
            error={errors.name}
          />

          <InputField
            id="code"
            name="code"
            label="Kode Resmi"
            value={data.code}
            onChange={(e) => setData('code', e.target.value)}
            required
            placeholder="Contoh: BPKAD-KEU"
            error={errors.code}
          />

          <SelectField
            id="parent_id"
            label="Unit Induk (Tree Structure)"
            value={data.parent_id ?? '0'}
            onValueChange={(value) =>
              setData('parent_id', value === '0' ? null : value)
            }
            options={[
              { label: 'Tanpa Induk (Root)', value: '0' },
              ...allUnits
                .filter((u) => u.id !== unit?.id)
                .map((u) => ({
                  label: u.name,
                  value: u.id.toString(),
                })),
            ]}
            placeholder="Pilih unit induk (opsional)"
            error={errors.parent_id}
          />
          <input type="hidden" name="parent_id" value={data.parent_id ?? ''} />

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
