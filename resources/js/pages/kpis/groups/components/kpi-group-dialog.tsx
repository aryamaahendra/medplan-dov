import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import KpiGroupController from '@/actions/App/Http/Controllers/KpiGroupController';
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
      <DialogContent className="sm:max-w-[425px]">
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
          className="space-y-4 py-2"
        >
          {({ setData, processing, errors }: any) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Periode</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: KPI Urusan Kesehatan 2024-2030"
                  defaultValue={group?.name ?? ''}
                  required
                  autoFocus
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_year">Tahun Mulai</Label>
                  <Input
                    id="start_year"
                    name="start_year"
                    type="number"
                    min="2000"
                    max="2100"
                    defaultValue={group?.start_year ?? new Date().getFullYear()}
                    required
                  />
                  <InputError message={errors.start_year} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_year">Tahun Selesai</Label>
                  <Input
                    id="end_year"
                    name="end_year"
                    type="number"
                    min="2000"
                    max="2100"
                    defaultValue={
                      group?.end_year ?? new Date().getFullYear() + 5
                    }
                    required
                  />
                  <InputError message={errors.end_year} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Uraikan detail periode KPI..."
                  defaultValue={group?.description ?? ''}
                  rows={4}
                />
                <InputError message={errors.description} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  defaultChecked={group?.is_active ?? true}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">Aktifkan Periode Ini</Label>
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
