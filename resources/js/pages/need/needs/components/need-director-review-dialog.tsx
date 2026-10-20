import { useForm } from '@inertiajs/react';
import {
  RiAlertLine,
  RiArrowRightDownLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiDraftLine,
  RiHistoryLine,
} from '@remixicon/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/Need/NeedController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

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
  const requestedVolume = Number(need.volume || 0);
  const requestedUnitPrice = Number(need.unit_price || 0);
  const requestedTotalPrice = Number(
    need.total_price || requestedVolume * requestedUnitPrice,
  );

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
        toast.error('Volume disetujui harus lebih dari 0.');

        return;
      }

      if (currentVolumeNum > requestedVolume) {
        toast.error(
          `Volume disetujui tidak boleh melebihi volume usulan (${requestedVolume.toLocaleString('id-ID')} ${need.unit}).`,
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

          {/* Three-way Decision Cards */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Keputusan Direktur <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Option 1: Disetujui */}
              <button
                type="button"
                onClick={() => setData('decision', 'approved')}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-lg border p-3.5 text-left transition-all outline-none',
                  isApproved
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-border/80 bg-card hover:border-muted-foreground/40 hover:bg-muted/20',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-md',
                      isApproved
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <RiCheckboxCircleLine className="size-4" />
                  </div>
                  {isApproved && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs font-semibold text-foreground">
                    Disetujui
                  </span>
                  <p className="mt-0.5 text-xss leading-tight text-muted-foreground">
                    Setujui kuantitas dan harga pagu
                  </p>
                </div>
              </button>

              {/* Option 2: Ditolak */}
              <button
                type="button"
                onClick={() => setData('decision', 'rejected')}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-lg border p-3.5 text-left transition-all outline-none',
                  isRejected
                    ? 'border-destructive bg-destructive/10 ring-2 ring-destructive/30'
                    : 'border-border/80 bg-card hover:border-muted-foreground/40 hover:bg-muted/20',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-md',
                      isRejected
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <RiCloseCircleLine className="size-4" />
                  </div>
                  {isRejected && (
                    <span className="size-2 rounded-full bg-destructive" />
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs font-semibold text-foreground">
                    Ditolak
                  </span>
                  <p className="mt-0.5 text-xss leading-tight text-muted-foreground">
                    Tolak usulan periode ini
                  </p>
                </div>
              </button>

              {/* Option 3: Perlu Revisi */}
              <button
                type="button"
                onClick={() => setData('decision', 'revision')}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-lg border p-3.5 text-left transition-all outline-none',
                  isRevision
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : 'border-border/80 bg-card hover:border-muted-foreground/40 hover:bg-muted/20',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-md',
                      isRevision
                        ? 'bg-amber-500 text-white dark:text-zinc-950'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <RiDraftLine className="size-4" />
                  </div>
                  {isRevision && (
                    <span className="size-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs font-semibold text-foreground">
                    Perlu Revisi
                  </span>
                  <p className="mt-0.5 text-xss leading-tight text-muted-foreground">
                    Kembalikan untuk diperbaiki
                  </p>
                </div>
              </button>
            </div>
            {errors.decision && (
              <p className="text-xs text-destructive">{errors.decision}</p>
            )}
          </div>

          {/* Conditional Controls: Approved */}
          {isApproved && (
            <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Volume Input */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="approved_volume"
                    className="text-xs font-semibold text-foreground"
                  >
                    Volume Disetujui ({need.unit}){' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="approved_volume"
                      type="number"
                      step="any"
                      min="0.0001"
                      max={requestedVolume}
                      value={data.approved_volume}
                      onChange={(e) =>
                        setData('approved_volume', e.target.value)
                      }
                      className="pr-14"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                      {need.unit}
                    </span>
                  </div>
                  <p className="text-xss text-muted-foreground">
                    Maksimal: {requestedVolume.toLocaleString('id-ID')}{' '}
                    {need.unit} (sesuai usulan awal)
                  </p>
                  {errors.approved_volume && (
                    <p className="text-xs text-destructive">
                      {errors.approved_volume}
                    </p>
                  )}
                </div>

                {/* Unit Price Input */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="approved_unit_price"
                    className="text-xs font-semibold text-foreground"
                  >
                    Harga Satuan Disetujui (Rp){' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="approved_unit_price"
                    type="number"
                    step="any"
                    min="0"
                    value={data.approved_unit_price}
                    onChange={(e) =>
                      setData('approved_unit_price', e.target.value)
                    }
                    required
                  />
                  <p className="text-xss text-muted-foreground">
                    Usulan awal: {formatIDR(requestedUnitPrice)}
                  </p>
                  {errors.approved_unit_price && (
                    <p className="text-xs text-destructive">
                      {errors.approved_unit_price}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Total Preview */}
              <div className="rounded-lg border border-border/70 bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                    Ketetapan Pagu Total Disetujui
                  </span>
                  {calculatedTotal < requestedTotalPrice && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xss font-medium text-amber-700 dark:text-amber-400">
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
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                  <label
                    htmlFor="is_recommended_for_next_cycle"
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <Checkbox
                      id="is_recommended_for_next_cycle"
                      checked={data.is_recommended_for_next_cycle}
                      onCheckedChange={(checked) =>
                        setData(
                          'is_recommended_for_next_cycle',
                          Boolean(checked),
                        )
                      }
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <RiHistoryLine className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span>
                          Rekomendasikan sisa kuantitas untuk siklus berikutnya
                        </span>
                      </div>
                      <p className="text-xss leading-relaxed text-muted-foreground">
                        Sisa kuantitas sebanyak{' '}
                        <strong className="text-foreground">
                          {residualVolume.toLocaleString('id-ID', {
                            maximumFractionDigits: 4,
                          })}{' '}
                          {need.unit}
                        </strong>{' '}
                        akan dicatat sebagai rekomendasi eksekutif prioritas
                        (rollover) pada siklus perencanaan berikutnya.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Approval Notes */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="notes"
                  className="text-xs font-semibold text-foreground"
                >
                  Catatan Persetujuan (Opsional)
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Tambahkan arahan pelaksanaan atau catatan persetujuan jika diperlukan..."
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Conditional Controls: Rejected */}
          {isRejected && (
            <div className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/[0.03] p-4">
              {/* Optional Rejection Reason */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="notes"
                  className="text-xs font-semibold text-foreground"
                >
                  Alasan Penolakan (Opsional)
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Jelaskan pertimbangan atau alasan penolakan usulan untuk transparansi kepada unit pengusul..."
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes}</p>
                )}
              </div>

              {/* Rollover Recommendation Checkbox */}
              <div className="rounded-lg border border-border/80 bg-card p-3">
                <label
                  htmlFor="is_recommended_for_next_cycle"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <Checkbox
                    id="is_recommended_for_next_cycle"
                    checked={data.is_recommended_for_next_cycle}
                    onCheckedChange={(checked) =>
                      setData('is_recommended_for_next_cycle', Boolean(checked))
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <RiHistoryLine className="size-3.5 text-primary" />
                      <span>
                        Rekomendasikan usulan ini untuk siklus berikutnya
                      </span>
                    </div>
                    <p className="text-xss leading-relaxed text-muted-foreground">
                      Seluruh usulan dengan kuantitas penuh (
                      <strong className="text-foreground">
                        {requestedVolume.toLocaleString('id-ID', {
                          maximumFractionDigits: 4,
                        })}{' '}
                        {need.unit}
                      </strong>
                      ) akan dicatat sebagai rekomendasi eksekutif prioritas
                      (rollover) pada siklus perencanaan berikutnya.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Conditional Controls: Revision */}
          {isRevision && (
            <div className="space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="notes"
                    className="text-xs font-semibold text-foreground"
                  >
                    Catatan Revisi <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xss font-medium text-amber-700 dark:text-amber-400">
                    Wajib diisi
                  </span>
                </div>
                <Textarea
                  id="notes"
                  rows={4}
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Tuliskan arahan perbaikan spesifik yang harus dipenuhi oleh unit pengusul (misal: spesifikasi teknis KAK, rincian kuantitas, bukti dukung)..."
                  className={cn(!data.notes.trim() && 'border-amber-500/50')}
                  required
                />
                <div className="flex items-start gap-1.5 text-xss text-muted-foreground">
                  <RiAlertLine className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                  <span>
                    Setelah review disimpan, usulan akan berstatus{' '}
                    <strong>Perlu Revisi</strong> dan kunci pengeditan akan
                    dibuka kembali bagi unit pengusul.
                  </span>
                </div>
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes}</p>
                )}
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
