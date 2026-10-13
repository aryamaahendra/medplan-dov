import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import PlanningVersionController from '@/actions/App/Http/Controllers/Planning/PlanningVersionController';
import { FormGrid, InputField, TextareaField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
              <InputField
                id="name"
                name="name"
                label="Nama Versi"
                defaultValue={version?.name ?? ''}
                placeholder="Contoh: Renja Awal 2025"
                required
                error={errors.name}
              />

              <FormGrid cols={2}>
                <InputField
                  id="year_start"
                  name="year_start"
                  type="number"
                  label="Tahun Mulai"
                  min={2020}
                  max={2100}
                  defaultValue={
                    version?.year_start ?? new Date().getFullYear() + 1
                  }
                  required
                  error={errors.year_start}
                />

                <InputField
                  id="year_end"
                  name="year_end"
                  type="number"
                  label="Tahun Selesai (Auto)"
                  value={
                    (version?.year_start ?? new Date().getFullYear() + 1) + 4
                  }
                  readOnly
                  className="bg-muted opacity-70"
                  error={errors.year_end}
                />
              </FormGrid>

              <TextareaField
                id="notes"
                name="notes"
                label="Catatan (Opsional)"
                defaultValue={version?.notes ?? ''}
                placeholder="Berikan deskripsi singkat untuk versi ini..."
                error={errors.notes}
              />
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
