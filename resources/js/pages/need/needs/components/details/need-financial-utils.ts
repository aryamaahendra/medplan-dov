import type { Need } from '@/types';

export interface NeedFinancialFigures {
  requestedVolume: number;
  requestedUnitPrice: number;
  requestedTotalPrice: number;
  approvedVolume: number | null;
  approvedUnitPrice: number | null;
  approvedTotalPrice: number | null;
  isApproved: boolean;
  hasApprovedFigures: boolean;
  isVolumeReduced: boolean;
  isPriceReduced: boolean;
  isAdjusted: boolean;
  volumeDifference: number;
  totalDifference: number;
}

export function resolveNeedFinancialFigures(need: Need): NeedFinancialFigures {
  const requestedVolume = Number(need.volume || 0);
  const requestedUnitPrice = Number(need.unit_price || 0);
  const requestedTotalPrice = Number(
    need.total_price || requestedVolume * requestedUnitPrice,
  );

  const isApproved = need.status === 'approved';
  const hasApprovedVolume =
    need.approved_volume !== null && need.approved_volume !== undefined;
  const hasApprovedUnitPrice =
    need.approved_unit_price !== null && need.approved_unit_price !== undefined;
  const hasApprovedTotalPrice =
    need.approved_total_price !== null &&
    need.approved_total_price !== undefined;

  const hasApprovedFigures =
    hasApprovedVolume || hasApprovedUnitPrice || hasApprovedTotalPrice;

  const approvedVolume = hasApprovedVolume
    ? Number(need.approved_volume)
    : isApproved
      ? requestedVolume
      : null;

  const approvedUnitPrice = hasApprovedUnitPrice
    ? Number(need.approved_unit_price)
    : isApproved
      ? requestedUnitPrice
      : null;

  const approvedTotalPrice = hasApprovedTotalPrice
    ? Number(need.approved_total_price)
    : approvedVolume !== null && approvedUnitPrice !== null
      ? approvedVolume * approvedUnitPrice
      : isApproved
        ? requestedTotalPrice
        : null;

  const isVolumeReduced =
    approvedVolume !== null && approvedVolume < requestedVolume;
  const isPriceReduced =
    approvedTotalPrice !== null && approvedTotalPrice < requestedTotalPrice;
  const isAdjusted = isVolumeReduced || isPriceReduced;

  const volumeDifference =
    approvedVolume !== null ? Math.max(0, requestedVolume - approvedVolume) : 0;
  const totalDifference =
    approvedTotalPrice !== null
      ? Math.max(0, requestedTotalPrice - approvedTotalPrice)
      : 0;

  return {
    requestedVolume,
    requestedUnitPrice,
    requestedTotalPrice,
    approvedVolume,
    approvedUnitPrice,
    approvedTotalPrice,
    isApproved,
    hasApprovedFigures,
    isVolumeReduced,
    isPriceReduced,
    isAdjusted,
    volumeDifference,
    totalDifference,
  };
}
