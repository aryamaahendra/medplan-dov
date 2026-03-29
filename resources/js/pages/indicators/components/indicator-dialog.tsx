import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import IndicatorController from '@/actions/App/Http/Controllers/IndicatorController';
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
import type { Indicator, Renstra } from '@/types';

interface IndicatorDialogProps {
  renstra: Renstra;
  indicator?: Indicator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IndicatorDialog({
  renstra,
  indicator,
  open,
  onOpenChange,
}: IndicatorDialogProps) {
  const isEditing = !!indicator;

  const years = Array.from(
    { length: renstra.year_end - renstra.year_start + 1 },
    (_, i) => renstra.year_start + i,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Indikator' : 'Tambah Indikator'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk indikator "${indicator.name}".`
              : `Tambahkan indikator baru untuk renstra "${renstra.name}".`}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={indicator?.id ?? 'new-indicator'}
          {...(isEditing && indicator
            ? IndicatorController.update.form({ indicator: indicator.id })
            : IndicatorController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Indikator berhasil diperbarui.'
                : 'Indikator berhasil dibuat.',
            );
          }}
          className="space-y-4 py-2"
        >
          {({ processing, errors }) => (
            <>
              <input type="hidden" name="renstra_id" value={renstra.id} />

              <div className="grid gap-2">
                <Label htmlFor="name">Nama Indikator</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Persentase Capaian Kinerja"
                  defaultValue={indicator?.name ?? ''}
                  required
                  autoFocus
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="baseline">Baseline</Label>
                <Input
                  id="baseline"
                  name="baseline"
                  placeholder="Contoh: 75% atau 100 Dokumen"
                  defaultValue={indicator?.baseline ?? ''}
                />
                <InputError message={errors.baseline} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Keterangan tambahan..."
                  defaultValue={indicator?.description ?? ''}
                  rows={2}
                />
                <InputError message={errors.description} />
              </div>

              <div className="pt-2">
                <Label className="text-sm font-semibold">Target Tahunan</Label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {years.map((year, index) => {
                    const existing = indicator?.targets?.find(
                      (t) => t.year === year,
                    );

                    return (
                      <div
                        key={year}
                        className="grid grid-cols-4 items-center gap-4"
                      >
                        <input
                          type="hidden"
                          name={`targets[${index}][year]`}
                          value={year}
                        />
                        <Label
                          htmlFor={`target-${year}`}
                          className="text-right"
                        >
                          {year}
                        </Label>
                        <Input
                          id={`target-${year}`}
                          name={`targets[${index}][target]`}
                          className="col-span-3"
                          defaultValue={existing?.target ?? ''}
                          placeholder="Nilai/Teks"
                          required
                        />
                        {errors[`targets.${index}.target`] && (
                          <p className="col-span-3 col-start-2 text-xs text-destructive">
                            {errors[`targets.${index}.target`]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 mt-4 border-t bg-background pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Indikator'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
