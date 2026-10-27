import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import KpiGroupController from '@/actions/App/Http/Controllers/Kpi/KpiGroupController';
import {
  FormGrid,
  InputField,
  SwitchField,
  TextareaField,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { KpiGroup } from '@/types';

interface KpiGroupDialogProps {
  group?: KpiGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KpiGroupDialog({
  group,
  open,
  onOpenChange,
}: KpiGroupDialogProps) {
  const isEditing = !!group;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Periode KPI' : 'Tambah Periode KPI'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk periode KPI "${group.name}".`
              : 'Tambahkan periode perencanaan KPI baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={group?.id ?? 'new-kpi-group'}
          {...(isEditing
            ? KpiGroupController.update.form({ group: group!.id })
            : KpiGroupController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Periode KPI berhasil diperbarui.'
                : 'Periode KPI berhasil dibuat.',
            );
          }}
          className="space-y-4"
        >
          {({ setData, processing, errors }: any) => (
            <>
              <InputField
                id="name"
                name="name"
                label="Nama Periode"
                placeholder="Contoh: KPI Urusan Kesehatan 2024-2030"
                defaultValue={group?.name ?? ''}
                required
                autoFocus
                error={errors.name}
              />

              <FormGrid cols={2}>
                <InputField
                  id="start_year"
                  name="start_year"
                  type="number"
                  label="Tahun Mulai"
                  min="2000"
                  max="2100"
                  defaultValue={group?.start_year ?? new Date().getFullYear()}
                  required
                  error={errors.start_year}
                />

                <InputField
                  id="end_year"
                  name="end_year"
                  type="number"
                  label="Tahun Selesai"
                  min="2000"
                  max="2100"
                  defaultValue={group?.end_year ?? new Date().getFullYear() + 5}
                  required
                  error={errors.end_year}
                />
              </FormGrid>

              <TextareaField
                id="description"
                name="description"
                label="Deskripsi"
                placeholder="Uraikan detail periode KPI..."
                defaultValue={group?.description ?? ''}
                rows={4}
                error={errors.description}
              />

              <SwitchField
                id="is_active"
                label="Aktifkan Periode Ini"
                description="(Hanya 1 yang bisa aktif)"
                defaultChecked={group?.is_active ?? true}
                onCheckedChange={(checked) => setData('is_active', checked)}
                error={errors.is_active}
              />
              <DialogFooter className="mb-0!">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Periode'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
