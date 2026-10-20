import { useForm } from '@inertiajs/react';
import { RiAlertLine, RiArrowRightDownLine } from '@remixicon/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/Need/NeedController';
import {
  FormCol,
  FormGrid,
  InputField,
  RadioField,
  SingleCheckboxField,
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
import { formatIDR } from '@/lib/formatters';
import type { Need } from '@/types';
import { resolveNeedFinancialFigures } from './details/need-financial-utils';

type ReviewDecision = 'approved' | 'rejected' | 'revision';

interface NeedDirectorReviewDialogProps {
  need: Need;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NeedDirectorReviewDialog({
  need,
  open,
  onOpenChange,
}: NeedDirectorReviewDialogProps) {
  const { requestedVolume, requestedUnitPrice, requestedTotalPrice } =
    resolveNeedFinancialFigures(need);

  const initialDecision: ReviewDecision =
    need.status === 'rejected'
      ? 'rejected'
      : need.status === 'revision'
        ? 'revision'
        : 'approved';

  const { data, setData, patch, processing, errors, reset, transform } =
    useForm({
      decision: initialDecision as ReviewDecision,
      approved_volume:
        need.approved_volume !== null && need.approved_volume !== undefined
          ? String(need.approved_volume)
          : String(need.volume ?? ''),
      approved_unit_price:
        need.approved_unit_price !== null &&
        need.approved_unit_price !== undefined
          ? String(need.approved_unit_price)
          : String(need.unit_price ?? ''),
      is_recommended_for_next_cycle: Boolean(
        need.is_recommended_for_next_cycle,
      ),
      notes: need.notes ?? '',
    });

  // Keep form data synced when dialog opens
  useEffect(() => {
    if (open) {
      setData({
        decision:
          need.status === 'rejected'
            ? 'rejected'
            : need.status === 'revision'
              ? 'revision'
              : 'approved',
        approved_volume:
          need.approved_volume !== null && need.approved_volume !== undefined
            ? String(need.approved_volume)
            : String(need.volume ?? ''),
        approved_unit_price:
          need.approved_unit_price !== null &&
          need.approved_unit_price !== undefined
            ? String(need.approved_unit_price)
            : String(need.unit_price ?? ''),
        is_recommended_for_next_cycle: Boolean(
          need.is_recommended_for_next_cycle,
        ),
        notes: need.notes ?? '',
      });
    }
  }, [
    open,
    need.status,
    need.volume,
    need.unit_price,
    need.approved_volume,
    need.approved_unit_price,
    need.is_recommended_for_next_cycle,
    need.notes,
    setData,
  ]);

  const currentVolumeNum = Number(data.approved_volume) || 0;
  const currentUnitPriceNum = Number(data.approved_unit_price) || 0;
  const calculatedTotal = currentVolumeNum * currentUnitPriceNum;

  const isApproved = data.decision === 'approved';
  const isRejected = data.decision === 'rejected';
  const isRevision = data.decision === 'revision';

  const hasResidualVolume =
    isApproved && currentVolumeNum > 0 && currentVolumeNum < requestedVolume;
  const residualVolume = Math.max(0, requestedVolume - currentVolumeNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRevision && !data.notes.trim()) {
      toast.error('Catatan revisi wajib diisi sebelum mengirim review.');

      return;
    }

    if (isApproved) {
      if (currentVolumeNum <= 0) {
        toast.error('Volume disetujui harus lebih besar dari 0.');

        return;
      }

      if (currentVolumeNum > requestedVolume) {
        toast.error(
          `Volume disetujui tidak boleh melebihi usulan awal (${requestedVolume.toLocaleString('id-ID')} ${need.unit}).`,
        );

        return;
      }

      if (currentUnitPriceNum < 0) {
        toast.error('Harga satuan disetujui tidak boleh kurang dari 0.');

        return;
      }
    }

    transform(() => ({
      decision: data.decision,
      notes: data.notes.trim() || null,
      approved_volume: isApproved ? currentVolumeNum : null,
      approved_unit_price: isApproved ? currentUnitPriceNum : null,
      is_recommended_for_next_cycle: isApproved
        ? hasResidualVolume && Boolean(data.is_recommended_for_next_cycle)
        : isRejected
          ? Boolean(data.is_recommended_for_next_cycle)
          : false,
    }));

    patch(NeedController.updateDirectorReview.url(need), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Review direktur berhasil disimpan');
        onOpenChange(false);
      },
      onError: (err) => {
        const message =
          Object.values(err).flat()[0] ||
          'Terjadi kesalahan saat menyimpan review';
        toast.error(message);
      },
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }

    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Review & Ketetapan Direktur
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tentukan keputusan eksekutif untuk usulan kebutuhan:{' '}
              <strong className="text-foreground">{need.title}</strong>
            </DialogDescription>
          </DialogHeader>

          {/* Ringkasan Usulan Awal */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs">
            <div>
              <span className="text-muted-foreground">Kuantitas Usulan:</span>{' '}
              <strong className="font-semibold text-foreground">
                {requestedVolume.toLocaleString('id-ID', {
                  maximumFractionDigits: 4,
                })}{' '}
                {need.unit}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">
                Harga Satuan Usulan:
              </span>{' '}
              <strong className="font-semibold text-foreground">
                {formatIDR(requestedUnitPrice)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">
                Estimasi Total Pagu:
              </span>{' '}
              <strong className="font-mono font-semibold text-foreground">
                {formatIDR(requestedTotalPrice)}
              </strong>
            </div>
          </div>

          {/* Prior Revision Notice for resubmitted proposals */}
          {Boolean(need.notes) && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
              <div className="flex items-start gap-2">
                <RiAlertLine className="size-4 shrink-0 text-warning" />
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">
                    Usulan Telah Diperbaiki (Diajukan Kembali)
                  </span>
                  <p className="whitespace-pre-wrap text-foreground/90">
                    Arahan revisi sebelumnya: {need.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Three-way Decision Cards via standardized RadioField */}
          <RadioField
            label="Keputusan Direktur"
            required
            variant="choice-card"
            cols={3}
            density="default"
            value={data.decision}
            onValueChange={(val) => setData('decision', val as ReviewDecision)}
            error={errors.decision}
            options={[
              {
                label: 'Disetujui',
                value: 'approved',
                description: 'Setujui kuantitas dan harga pagu',
              },
              {
                label: 'Ditolak',
                value: 'rejected',
                description: 'Tolak usulan periode ini',
              },
              {
                label: 'Perlu Revisi',
                value: 'revision',
                description: 'Kembalikan untuk diperbaiki',
              },
            ]}
          />

          {/* Conditional Controls: Approved */}
          {isApproved && (
            <div className="space-y-4 rounded-xl border border-border/80 bg-muted/10 p-4">
              <FormGrid cols={2} density="comfortable">
                <FormCol>
                  <InputField
                    id="approved_volume"
                    label={`Volume Disetujui (${need.unit})`}
                    required
                    type="number"
                    step="any"
                    min="0.0001"
                    max={requestedVolume}
                    value={data.approved_volume}
                    onChange={(e) => setData('approved_volume', e.target.value)}
                    description={`Maksimal: ${requestedVolume.toLocaleString('id-ID')} ${need.unit} (sesuai usulan awal)`}
                    error={errors.approved_volume}
                  />
                </FormCol>
                <FormCol>
                  <InputField
                    id="approved_unit_price"
                    label="Harga Satuan Disetujui (Rp)"
                    required
                    type="number"
                    step="any"
                    min="0"
                    value={data.approved_unit_price}
                    onChange={(e) =>
                      setData('approved_unit_price', e.target.value)
                    }
                    description={`Usulan awal: ${formatIDR(requestedUnitPrice)}`}
                    error={errors.approved_unit_price}
                  />
                </FormCol>
              </FormGrid>

              {/* Dynamic Total Preview */}
              <div className="rounded-lg border border-border/70 bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                    Ketetapan Pagu Total Disetujui
                  </span>
                  {calculatedTotal < requestedTotalPrice && (
                    <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-xss font-medium text-warning-foreground">
                      <RiArrowRightDownLine className="size-3" />
                      Efisiensi: -
                      {formatIDR(requestedTotalPrice - calculatedTotal)}
                    </span>
                  )}
                </div>
                <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formatIDR(calculatedTotal)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Perhitungan: {currentVolumeNum.toLocaleString('id-ID')}{' '}
                  {need.unit} × {formatIDR(currentUnitPriceNum)}
                </div>
              </div>

              {/* Conditional Rollover Checkbox on Partial Approval */}
              {hasResidualVolume && (
                <div className="rounded-lg border border-info/30 bg-info/5 p-1">
                  <SingleCheckboxField
                    id="is_recommended_for_next_cycle"
                    variant="choice-card"
                    label="Rekomendasikan sisa kuantitas untuk siklus berikutnya"
                    description={`Sisa kuantitas sebanyak ${residualVolume.toLocaleString(
                      'id-ID',
                      {
                        maximumFractionDigits: 4,
                      },
                    )} ${need.unit} akan dicatat sebagai rekomendasi eksekutif prioritas (rollover) pada siklus perencanaan berikutnya.`}
                    checked={data.is_recommended_for_next_cycle}
                    onCheckedChange={(checked) =>
                      setData('is_recommended_for_next_cycle', Boolean(checked))
                    }
                  />
                </div>
              )}

              {/* Approval Notes */}
              <TextareaField
                id="notes"
                label="Catatan Persetujuan (Opsional)"
                rows={3}
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)}
                placeholder="Tambahkan arahan pelaksanaan atau catatan persetujuan jika diperlukan..."
                error={errors.notes}
              />
            </div>
          )}

          {/* Conditional Controls: Rejected */}
          {isRejected && (
            <div className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/[0.03] p-4">
              <TextareaField
                id="notes"
                label="Alasan Penolakan (Opsional)"
                rows={3}
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)}
                placeholder="Jelaskan pertimbangan atau alasan penolakan usulan untuk transparansi kepada unit pengusul..."
                error={errors.notes}
              />

              {/* Rollover Recommendation Checkbox */}
              <SingleCheckboxField
                id="is_recommended_for_next_cycle"
                variant="choice-card"
                label="Rekomendasikan usulan ini untuk siklus berikutnya"
                description={`Seluruh usulan dengan kuantitas penuh (${requestedVolume.toLocaleString(
                  'id-ID',
                  {
                    maximumFractionDigits: 4,
                  },
                )} ${need.unit}) akan dicatat sebagai rekomendasi eksekutif prioritas (rollover) pada siklus perencanaan berikutnya.`}
                checked={data.is_recommended_for_next_cycle}
                onCheckedChange={(checked) =>
                  setData('is_recommended_for_next_cycle', Boolean(checked))
                }
              />
            </div>
          )}

          {/* Conditional Controls: Revision */}
          {isRevision && (
            <div className="space-y-4 rounded-xl border border-warning/20 bg-warning/[0.03] p-4">
              <TextareaField
                id="notes"
                label="Catatan Revisi"
                required
                rows={4}
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)}
                placeholder="Tuliskan arahan perbaikan spesifik yang harus dipenuhi oleh unit pengusul (misal: spesifikasi teknis KAK, rincian kuantitas, bukti dukung)..."
                error={errors.notes}
                description="Setelah review disimpan, usulan akan berstatus Perlu Revisi dan kunci pengeditan akan dibuka kembali bagi unit pengusul."
              />
              <div className="flex items-start gap-1.5 text-xss text-warning-foreground">
                <RiAlertLine className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Arahan revisi ini akan ditampilkan sebagai panduan perbaikan
                  bagi unit kerja pengusul.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={processing || (isRevision && !data.notes.trim())}
            >
              {processing ? 'Menyimpan...' : 'Simpan Keputusan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
