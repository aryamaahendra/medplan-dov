import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import KpiIndicatorController from '@/actions/App/Http/Controllers/Kpi/KpiIndicatorController';
import {
  FieldWrapper,
  FormGrid,
  InputField,
  SwitchField,
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
import type { KpiGroup, KpiIndicator } from '@/types';

interface KpiIndicatorDialogProps {
  group: KpiGroup;
  parentIndicator?: KpiIndicator | null;
  indicator?: KpiIndicator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KpiIndicatorDialog({
  group,
  parentIndicator,
  indicator,
  open,
  onOpenChange,
}: KpiIndicatorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="no-scrollbar max-h-[90vh] overflow-y-auto pb-0 sm:max-w-[600px]">
        {open && (
          <KpiIndicatorForm
            key={`${indicator?.id ?? 'new'}-${parentIndicator?.id ?? 'none'}`}
            group={group}
            parentIndicator={parentIndicator}
            indicator={indicator}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function KpiIndicatorForm({
  group,
  parentIndicator,
  indicator,
  onOpenChange,
}: Omit<KpiIndicatorDialogProps, 'open'>) {
  const isEditing = !!indicator;
  const years = Array.from(
    { length: group.end_year - group.start_year + 1 },
    (_, i) => group.start_year + i,
  );

  const { data, setData, post, put, processing, errors, reset } = useForm({
    group_id: group.id,
    parent_indicator_id:
      parentIndicator?.id ?? indicator?.parent_indicator_id ?? null,
    name: indicator?.name ?? '',
    unit: indicator?.unit ?? '',
    is_category: indicator?.is_category ?? false,
    baseline_value: indicator?.baseline_value ?? '',
    annual_targets: indicator?.annual_targets || [],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      put(KpiIndicatorController.update.url({ indicator: indicator!.id }), {
        onSuccess: () => {
          onOpenChange(false);
          toast.success('Indikator berhasil diperbarui.');
        },
      });
    } else {
      post(KpiIndicatorController.store.url(), {
        onSuccess: () => {
          onOpenChange(false);
          toast.success('Indikator berhasil dibuat.');
          reset();
        },
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Indikator' : 'Tambah Indikator'}
        </DialogTitle>
        <DialogDescription>
          {parentIndicator
            ? `Menambahkan indikator di bawah kategori "${parentIndicator.name}".`
            : 'Tambahkan indikator atau kategori utama baru.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-6">
        {/* Hidden Fields */}
        <input type="hidden" name="group_id" value={data.group_id} />
        {data.parent_indicator_id && (
          <input
            type="hidden"
            name="parent_indicator_id"
            value={data.parent_indicator_id}
          />
        )}

        <div className="grid gap-4">
          <SwitchField
            id="is_category"
            label="Jadikan sebagai Kategori"
            description="Kategori hanya berfungsi sebagai heading dan tidak memiliki unit atau target."
            variant="choice-card"
            checked={data.is_category}
            onCheckedChange={(checked) => setData('is_category', checked)}
            disabled={isEditing}
          />

          <InputField
            id="name"
            name="name"
            label={`Nama ${data.is_category ? 'Kategori' : 'Indikator'}`}
            placeholder={`Contoh: ${
              data.is_category
                ? 'Urusan Pendidikan'
                : 'Persentase Sekolah Terakreditasi A'
            }`}
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            required
            error={errors.name}
          />

          {!data.is_category && (
            <>
              <FormGrid cols={2}>
                <InputField
                  id="unit"
                  name="unit"
                  label="Satuan"
                  placeholder="Contoh: %, Orang, Rupiah"
                  value={data.unit ?? ''}
                  onChange={(e) => setData('unit', e.target.value)}
                  error={errors.unit}
                />
                <InputField
                  id="baseline_value"
                  name="baseline_value"
                  label="Baseline"
                  placeholder="Nilai awal"
                  value={data.baseline_value ?? ''}
                  onChange={(e) => setData('baseline_value', e.target.value)}
                  error={errors.baseline_value}
                />
              </FormGrid>

              <FieldWrapper
                label={`Target Tahunan (${group.start_year} - ${group.end_year})`}
                error={errors.annual_targets}
              >
                <FormGrid cols={3}>
                  {years.map((year) => {
                    const existingTarget = data.annual_targets?.find(
                      (t) => t.year === year,
                    );

                    return (
                      <InputField
                        key={year}
                        id={`target_${year}`}
                        label={`Tahun ${year}`}
                        labelProps={{
                          className:
                            'font-mono text-xss text-muted-foreground uppercase',
                        }}
                        placeholder="Target"
                        value={existingTarget?.target_value ?? ''}
                        onChange={(e) => {
                          const newTargets = [...(data.annual_targets || [])];
                          const targetIndex = newTargets.findIndex(
                            (t) => t.year === year,
                          );

                          if (targetIndex > -1) {
                            (newTargets[targetIndex] as any).target_value =
                              e.target.value;
                          } else {
                            (newTargets as any).push({
                              year,
                              target_value: e.target.value,
                            });
                          }

                          setData('annual_targets', newTargets);
                        }}
                      />
                    );
                  })}
                </FormGrid>
              </FieldWrapper>
            </>
          )}
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
            {isEditing ? 'Simpan Perubahan' : 'Tambah Indikator'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
