import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import PlanningVersionController from '@/actions/App/Http/Controllers/Planning/PlanningVersionController';
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
import { Textarea } from '@/components/ui/textarea';
import type { PlanningVersion } from '@/types/planning-version';

interface VersionDialogProps {
  version?: PlanningVersion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionDialog({
  version,
  open,
  onOpenChange,
}: VersionDialogProps) {
  const isEditing = !!version;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Edit Versi Perencanaan'
              : 'Buat Versi Perencanaan Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk ${version.name}.`
              : 'Membuat versi awal untuk tahun anggaran baru. Sistem akan menyalin nomenklatur dari data master.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={version?.id ?? 'new-version'}
          {...(isEditing
            ? PlanningVersionController.update.form({
                planning_version: version.id,
              })
            : PlanningVersionController.store.form())}
          transform={(data) => ({
            ...data,
            year_end: parseInt(data.year_start as string) + 4,
          })}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing ? 'Versi diperbarui!' : 'Versi baru berhasil dibuat!',
            );
          }}
          className="space-y-4"
        >
          {({ processing, errors }) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Versi</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={version?.name ?? ''}
                  placeholder="Contoh: Renja Awal 2025"
                  required
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year_start">Tahun Mulai</Label>
                  <Input
                    id="year_start"
                    name="year_start"
                    type="number"
                    min={2020}
                    max={2100}
                    defaultValue={
                      version?.year_start ?? new Date().getFullYear() + 1
                    }
                    required
                  />
                  <InputError message={errors.year_start} />
                </div>
                <div className="grid gap-2 opacity-70">
                  <Label htmlFor="year_end">Tahun Selesai (Auto)</Label>
                  <Input
                    id="year_end"
                    name="year_end"
                    type="number"
                    value={
                      (version?.year_start ?? new Date().getFullYear() + 1) + 4
                    }
                    readOnly
                    className="bg-muted"
                  />
                  <InputError message={errors.year_end} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={version?.notes ?? ''}
                  placeholder="Berikan deskripsi singkat untuk versi ini..."
                />
                <InputError message={errors.notes} />
              </div>

              <DialogFooter className="mb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Simpan Perubahan' : 'Buat Versi'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
