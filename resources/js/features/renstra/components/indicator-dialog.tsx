import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import IndicatorController from '@/actions/App/Http/Controllers/Renstra/IndicatorController';
import { InputField, TextareaField } from '@/components/form';
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
import type { Indicator, Sasaran, Tujuan } from '@/types';

interface IndicatorDialogProps {
  tujuan?: Tujuan | null;
  sasaran?: Sasaran | null;
  indicator?: Indicator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yearStart: number;
  yearEnd: number;
}

export function IndicatorDialog({
  tujuan,
  sasaran,
  indicator,
  open,
  onOpenChange,
  yearStart,
  yearEnd,
}: IndicatorDialogProps) {
  const isEditing = !!indicator;

  const years = Array.from(
    { length: yearEnd - yearStart + 1 },
    (_, i) => yearStart + i,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Indikator' : 'Tambah Indikator'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk indikator "${indicator.name}".`
              : `Tambahkan indikator baru untuk ${sasaran ? `sasaran "${sasaran.name}"` : `tujuan "${tujuan?.name}"`}.`}
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
          className="-mx-4 no-scrollbar max-h-[calc(100vh-10rem)] overflow-y-auto"
        >
          {({ processing, errors }) => (
            <div className="space-y-4 px-4 py-2">
              {tujuan && (
                <input type="hidden" name="tujuan_id" value={tujuan.id} />
              )}
              {sasaran && (
                <input type="hidden" name="sasaran_id" value={sasaran.id} />
              )}

              <InputField
                id="name"
                name="name"
                label="Nama Indikator"
                placeholder="Contoh: Persentase Capaian Kinerja"
                defaultValue={indicator?.name ?? ''}
                required
                autoFocus
                error={errors.name}
              />

              <InputField
                id="baseline"
                name="baseline"
                label="Baseline"
                placeholder="Contoh: 75% atau 100 Dokumen"
                defaultValue={indicator?.baseline ?? ''}
                error={errors.baseline}
              />

              <TextareaField
                id="description"
                name="description"
                label="Deskripsi"
                placeholder="Keterangan tambahan..."
                defaultValue={indicator?.description ?? ''}
                rows={2}
                error={errors.description}
              />

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

              <DialogFooter className="-mb-2">
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
            </div>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
