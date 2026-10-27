import { RiAlertLine, RiArrowRightDownLine } from '@remixicon/react';

import {
  FieldWrapper,
  FormCol,
  FormGrid,
  InputField,
  MoneyInputField,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatIDR, normalizeVolume } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';
import { useDirectorReviewDetermination } from './use-director-review-determination';
import type { ReviewDecision } from './use-director-review-determination';

export interface DirectorReviewDialogProps {
  need: Need;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DirectorReviewDialog({
  need,
  open,
  onOpenChange,
}: DirectorReviewDialogProps) {
  const determination = useDirectorReviewDetermination(need, {
    onSuccess: () => onOpenChange(false),
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      determination.reset();
    }

    onOpenChange(isOpen);
  };

  const isApproved = determination.decision === 'approved';
  const isRejected = determination.decision === 'rejected';
  const isRevision = determination.decision === 'revision';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-4 sm:max-w-2xl">
        <form onSubmit={determination.submit} className="flex flex-col gap-3">
          <DialogHeader className="gap-0.5 pr-6">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Review & Ketetapan Direktur
            </DialogTitle>
            <DialogDescription className="truncate text-xs text-muted-foreground">
              Tentukan keputusan eksekutif untuk usulan:{' '}
              <strong className="font-medium text-foreground">
                {need.title}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <div className="-mx-1.5 no-scrollbar max-h-[calc(85vh-120px)] space-y-3 overflow-y-auto px-1.5 py-1">
            {/* Ringkasan Usulan Awal */}
            <div className="grid grid-cols-1 divide-y divide-border/60 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="sm:pr-2">
                <span className="text-[11px] text-muted-foreground">
                  Kuantitas Usulan:
                </span>{' '}
                <div className="font-semibold text-foreground">
                  {determination.requestedVolume.toLocaleString('id-ID', {
                    maximumFractionDigits: 4,
                  })}{' '}
                  {need.unit}
                </div>
              </div>
              <div className="pt-1.5 sm:px-2 sm:pt-0">
                <span className="text-[11px] text-muted-foreground">
                  Harga Satuan Usulan:
                </span>{' '}
                <div className="font-semibold text-foreground">
                  {formatIDR(determination.requestedUnitPrice)}
                </div>
              </div>
              <div className="pt-1.5 sm:pt-0 sm:pl-2">
                <span className="text-[11px] text-muted-foreground">
                  Estimasi Total Pagu:
                </span>{' '}
                <div className="font-mono font-semibold text-foreground">
                  {formatIDR(determination.requestedTotalPrice)}
                </div>
              </div>
            </div>

            {/* Prior Revision Notice for resubmitted proposals */}
            {Boolean(need.notes) && (
              <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                <div className="flex items-start gap-2">
                  <RiAlertLine className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  <div className="space-y-0.5">
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

            {/* Three-way Decision Cards with Semantic Color Schemas */}
            <FieldWrapper
              id="decision"
              label="Keputusan Direktur"
              required
              error={determination.errors.decision}
            >
              {({ id, errorId }) => (
                <RadioGroup
                  value={determination.decision}
                  onValueChange={(val) =>
                    determination.setDecision(val as ReviewDecision)
                  }
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                  aria-describedby={errorId}
                >
                  {/* 1. Disetujui (Success schema) */}
                  <label
                    htmlFor={`${id}-approved`}
                    onClick={() => determination.setDecision('approved')}
                    className={cn(
                      'relative flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border p-2.5 text-xs transition-all',
                      determination.decision === 'approved'
                        ? 'border-success/60 bg-success/10 ring-1 ring-success/30 dark:bg-success/15'
                        : 'border-border/70 bg-card hover:border-border hover:bg-muted/30',
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          determination.decision === 'approved'
                            ? 'font-semibold text-success-foreground'
                            : 'text-foreground',
                        )}
                      >
                        Disetujui
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Setujui kuantitas & pagu
                      </span>
                    </div>
                    <RadioGroupItem
                      id={`${id}-approved`}
                      value="approved"
                      className="data-checked:border-success data-checked:bg-success data-checked:text-success-foreground"
                    />
                  </label>

                  {/* 2. Ditolak (Danger / Error schema) */}
                  <label
                    htmlFor={`${id}-rejected`}
                    onClick={() => determination.setDecision('rejected')}
                    className={cn(
                      'relative flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border p-2.5 text-xs transition-all',
                      determination.decision === 'rejected'
                        ? 'border-destructive/60 bg-destructive/10 ring-1 ring-destructive/30 dark:bg-destructive/15'
                        : 'border-border/70 bg-card hover:border-border hover:bg-muted/30',
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          determination.decision === 'rejected'
                            ? 'font-semibold text-destructive'
                            : 'text-foreground',
                        )}
                      >
                        Ditolak
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Tolak usulan periode ini
                      </span>
                    </div>
                    <RadioGroupItem
                      id={`${id}-rejected`}
                      value="rejected"
                      className="data-checked:border-destructive data-checked:bg-destructive data-checked:text-destructive-foreground"
                    />
                  </label>

                  {/* 3. Perlu Revisi (Warning schema) */}
                  <label
                    htmlFor={`${id}-revision`}
                    onClick={() => determination.setDecision('revision')}
                    className={cn(
                      'relative flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border p-2.5 text-xs transition-all',
                      determination.decision === 'revision'
                        ? 'border-warning/60 bg-warning/10 ring-1 ring-warning/30 dark:bg-warning/15'
                        : 'border-border/70 bg-card hover:border-border hover:bg-muted/30',
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          determination.decision === 'revision'
                            ? 'font-semibold text-warning-foreground dark:text-warning'
                            : 'text-foreground',
                        )}
                      >
                        Perlu Revisi
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Kembalikan untuk perbaikan
                      </span>
                    </div>
                    <RadioGroupItem
                      id={`${id}-revision`}
                      value="revision"
                      className="data-checked:border-warning data-checked:bg-warning data-checked:text-warning-foreground"
                    />
                  </label>
                </RadioGroup>
              )}
            </FieldWrapper>

            {/* Conditional Controls: Approved */}
            {isApproved && (
              <>
                <FormGrid cols={2} density="dense">
                  <FormCol>
                    <InputField
                      id="approved_volume"
                      label={`Volume Disetujui (${need.unit})`}
                      required
                      type="number"
                      min="0"
                      step="0.0001"
                      max={determination.requestedVolume}
                      value={determination.approvedVolume}
                      onChange={(e) =>
                        determination.setApprovedVolume(e.target.value)
                      }
                      onBlur={() =>
                        determination.setApprovedVolume(
                          normalizeVolume(determination.approvedVolume),
                        )
                      }
                      description={`Maks: ${determination.requestedVolume.toLocaleString(
                        'id-ID',
                      )} ${need.unit} (sesuai usulan awal)`}
                      error={determination.errors.approved_volume}
                    />
                  </FormCol>
                  <FormCol>
                    <MoneyInputField
                      id="approved_unit_price"
                      label="Harga Satuan Disetujui (Rp)"
                      required
                      value={determination.approvedUnitPrice}
                      onValueChange={(val) =>
                        determination.setApprovedUnitPrice(val)
                      }
                      description={`Usulan awal: ${formatIDR(
                        determination.requestedUnitPrice,
                      )}`}
                      error={determination.errors.approved_unit_price}
                    />
                  </FormCol>
                </FormGrid>

                {/* Dynamic Total Preview */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-card px-3 py-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        Ketetapan Pagu Total Disetujui
                      </span>
                      {determination.efficiencySavings > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                          <RiArrowRightDownLine className="size-3" />
                          Efisiensi: -
                          {formatIDR(determination.efficiencySavings)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Perhitungan:{' '}
                      {(
                        Number(determination.approvedVolume) || 0
                      ).toLocaleString('id-ID')}{' '}
                      {need.unit} ×{' '}
                      {formatIDR(Number(determination.approvedUnitPrice) || 0)}
                    </div>
                  </div>
                  <div className="font-mono text-xl font-bold tracking-tight text-foreground">
                    {formatIDR(determination.calculatedTotal)}
                  </div>
                </div>

                {/* Conditional Rollover Switch on Partial Approval */}
                {determination.hasResidualVolume && (
                  <SwitchField
                    id="is_recommended_for_next_cycle"
                    variant="choice-card"
                    label="Rekomendasikan sisa kuantitas untuk siklus berikutnya"
                    description={`Sisa kuantitas ${determination.residualVolume.toLocaleString(
                      'id-ID',
                      {
                        maximumFractionDigits: 4,
                      },
                    )} ${need.unit} dicatat sebagai rekomendasi prioritas (rollover) pada siklus berikutnya.`}
                    checked={determination.isRecommendedForNextCycle}
                    onCheckedChange={(checked) =>
                      determination.setIsRecommendedForNextCycle(
                        Boolean(checked),
                      )
                    }
                  />
                )}

                {/* Approval Notes */}
                <TextareaField
                  id="notes"
                  label="Catatan Persetujuan (Opsional)"
                  rows={2}
                  value={determination.notes}
                  onChange={(e) => determination.setNotes(e.target.value)}
                  placeholder="Tambahkan arahan pelaksanaan atau catatan persetujuan jika diperlukan..."
                  error={determination.errors.notes}
                />
              </>
            )}

            {/* Conditional Controls: Rejected */}
            {isRejected && (
              <>
                <TextareaField
                  id="notes"
                  label="Alasan Penolakan (Opsional)"
                  rows={2}
                  value={determination.notes}
                  onChange={(e) => determination.setNotes(e.target.value)}
                  placeholder="Jelaskan pertimbangan atau alasan penolakan usulan untuk transparansi kepada unit pengusul..."
                  error={determination.errors.notes}
                />

                {/* Rollover Recommendation Switch */}
                <SwitchField
                  id="is_recommended_for_next_cycle"
                  variant="choice-card"
                  label="Rekomendasikan usulan ini untuk siklus berikutnya"
                  description={`Seluruh usulan penuh (${determination.requestedVolume.toLocaleString(
                    'id-ID',
                    {
                      maximumFractionDigits: 4,
                    },
                  )} ${need.unit}) dicatat sebagai rekomendasi prioritas (rollover) pada siklus berikutnya.`}
                  checked={determination.isRecommendedForNextCycle}
                  onCheckedChange={(checked) =>
                    determination.setIsRecommendedForNextCycle(Boolean(checked))
                  }
                />
              </>
            )}

            {/* Conditional Controls: Revision */}
            {isRevision && (
              <>
                <TextareaField
                  id="notes"
                  label="Catatan Revisi"
                  required
                  rows={3}
                  value={determination.notes}
                  onChange={(e) => determination.setNotes(e.target.value)}
                  placeholder="Tuliskan arahan perbaikan spesifik yang harus dipenuhi oleh unit pengusul (misal: spesifikasi teknis KAK, rincian kuantitas, bukti dukung)..."
                  error={determination.errors.notes}
                  description="Usulan akan berstatus Perlu Revisi dan kunci pengeditan dibuka kembali bagi unit pengusul."
                />
                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <RiAlertLine className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  <span>
                    Arahan revisi ini akan ditampilkan sebagai panduan perbaikan
                    bagi unit kerja pengusul.
                  </span>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="-mx-4 mt-2 -mb-4 gap-1 px-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                determination.isSubmitting ||
                (isRevision && !determination.notes.trim())
              }
            >
              {determination.isSubmitting ? 'Menyimpan...' : 'Simpan Keputusan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
