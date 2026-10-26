import { useForm } from '@inertiajs/react';
import type { SyntheticEvent } from 'react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/Need/NeedController';
import { normalizeVolume } from '@/lib/formatters';
import type { Need } from '@/types';
import { resolveNeedFinancialFigures } from '../utils/need-financial-utils';

export type ReviewDecision = 'approved' | 'rejected' | 'revision';

export interface DirectorReviewDeterminationOptions {
  onSuccess?: () => void;
  onError?: (errors: Record<string, string>) => void;
}

export interface DirectorReviewDetermination {
  // Current Decision & Form Inputs
  decision: ReviewDecision;
  approvedVolume: string;
  approvedUnitPrice: string;
  isRecommendedForNextCycle: boolean;
  notes: string;

  // Semantic Updaters
  setDecision: (decision: ReviewDecision) => void;
  setApprovedVolume: (val: string) => void;
  setApprovedUnitPrice: (val: string) => void;
  setIsRecommendedForNextCycle: (val: boolean) => void;
  setNotes: (val: string) => void;

  // Derived Financial & Rollover Metrics
  calculatedTotal: number;
  efficiencySavings: number;
  hasResidualVolume: boolean;
  residualVolume: number;
  isRolloverEligible: boolean;
  requestedVolume: number;
  requestedUnitPrice: number;
  requestedTotalPrice: number;

  // Reactive Invariant & Validation State
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;

  // Actions
  submit: (e?: SyntheticEvent) => void;
  reset: () => void;
}

export function useDirectorReviewDetermination(
  need: Need,
  options?: DirectorReviewDeterminationOptions,
): DirectorReviewDetermination {
  const { requestedVolume, requestedUnitPrice, requestedTotalPrice } =
    resolveNeedFinancialFigures(need);

  const initialDecision: ReviewDecision =
    need.status === 'rejected'
      ? 'rejected'
      : need.status === 'revision'
        ? 'revision'
        : 'approved';

  const initialVolumeStr = normalizeVolume(
    need.approved_volume !== null && need.approved_volume !== undefined
      ? need.approved_volume
      : (need.volume ?? ''),
  );

  const initialUnitPriceStr =
    need.approved_unit_price !== null && need.approved_unit_price !== undefined
      ? String(need.approved_unit_price)
      : String(need.unit_price ?? '');

  const {
    data,
    setData,
    patch,
    processing,
    errors: serverErrors,
    reset,
    transform,
  } = useForm({
    decision: initialDecision,
    approved_volume: initialVolumeStr,
    approved_unit_price: initialUnitPriceStr,
    is_recommended_for_next_cycle: Boolean(need.is_recommended_for_next_cycle),
    notes: need.notes ?? '',
  });

  const approvedVolumeNum = Number(data.approved_volume) || 0;
  const approvedUnitPriceNum = Number(data.approved_unit_price) || 0;
  const calculatedTotal = approvedVolumeNum * approvedUnitPriceNum;
  const efficiencySavings = Math.max(0, requestedTotalPrice - calculatedTotal);

  const isApproved = data.decision === 'approved';
  const isRejected = data.decision === 'rejected';
  const isRevision = data.decision === 'revision';

  const hasResidualVolume =
    isApproved && approvedVolumeNum > 0 && approvedVolumeNum < requestedVolume;
  const residualVolume = Math.max(0, requestedVolume - approvedVolumeNum);

  const isRolloverEligible = (isApproved && hasResidualVolume) || isRejected;

  // Compute reactive client-side validation errors
  const clientErrors: Record<string, string> = {};

  if (isRevision && !data.notes.trim()) {
    clientErrors.notes = 'Catatan revisi wajib diisi sebelum mengirim review.';
  }

  if (isApproved) {
    if (approvedVolumeNum <= 0) {
      clientErrors.approved_volume =
        'Volume disetujui harus lebih besar dari 0.';
    } else if (approvedVolumeNum > requestedVolume) {
      clientErrors.approved_volume = `Volume disetujui tidak boleh melebihi usulan awal (${requestedVolume.toLocaleString(
        'id-ID',
      )} ${need.unit}).`;
    }

    if (approvedUnitPriceNum < 0) {
      clientErrors.approved_unit_price =
        'Harga satuan disetujui tidak boleh kurang dari 0.';
    }
  }

  const isValid = Object.keys(clientErrors).length === 0;
  const combinedErrors: Record<string, string> = {
    ...clientErrors,
    ...serverErrors,
  };

  const submit = (e?: SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!isValid) {
      const firstErrorMessage = Object.values(clientErrors)[0];

      if (firstErrorMessage) {
        toast.error(firstErrorMessage);
      }

      return;
    }

    transform(() => ({
      decision: data.decision,
      notes: data.notes.trim() || null,
      approved_volume: isApproved ? approvedVolumeNum : null,
      approved_unit_price: isApproved ? approvedUnitPriceNum : null,
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
        options?.onSuccess?.();
      },
      onError: (err) => {
        const message =
          Object.values(err).flat()[0] ||
          'Terjadi kesalahan saat menyimpan review';
        toast.error(message);
        options?.onError?.(err as Record<string, string>);
      },
    });
  };

  return {
    decision: data.decision,
    approvedVolume: data.approved_volume,
    approvedUnitPrice: data.approved_unit_price,
    isRecommendedForNextCycle: data.is_recommended_for_next_cycle,
    notes: data.notes,

    setDecision: (val) => setData('decision', val),
    setApprovedVolume: (val) => setData('approved_volume', val),
    setApprovedUnitPrice: (val) => setData('approved_unit_price', val),
    setIsRecommendedForNextCycle: (val) =>
      setData('is_recommended_for_next_cycle', val),
    setNotes: (val) => setData('notes', val),

    calculatedTotal,
    efficiencySavings,
    hasResidualVolume,
    residualVolume,
    isRolloverEligible,
    requestedVolume,
    requestedUnitPrice,
    requestedTotalPrice,

    errors: combinedErrors,
    isValid,
    isSubmitting: processing,

    submit,
    reset,
  };
}
