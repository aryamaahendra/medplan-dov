import type { Need } from '@/types';

export interface NeedFinancialFigures {
  requestedVolume: number;
  requestedUnitPrice: number;
  requestedTotalPrice: number;
  approvedVolume: number | null;
  approvedUnitPrice: number | null;
  approvedTotalPrice: number | null;
  displayVolume: number;
  displayUnitPrice: number;
  displayTotalPrice: number;
  isApproved: boolean;
  hasApprovedFigures: boolean;
  isVolumeReduced: boolean;
  isPriceReduced: boolean;
  isVolumeChanged: boolean;
  isUnitPriceChanged: boolean;
  isTotalPriceChanged: boolean;
  hasChanges: boolean;
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

  const isFinalized = isApproved || hasApprovedFigures;

  const displayVolume = isFinalized
    ? (approvedVolume ?? requestedVolume)
    : requestedVolume;
  const displayUnitPrice = isFinalized
    ? (approvedUnitPrice ?? requestedUnitPrice)
    : requestedUnitPrice;
  const displayTotalPrice = isFinalized
    ? (approvedTotalPrice ?? displayVolume * displayUnitPrice)
    : requestedTotalPrice;

  const isVolumeReduced =
    approvedVolume !== null && approvedVolume < requestedVolume;
  const isPriceReduced =
    approvedTotalPrice !== null && approvedTotalPrice < requestedTotalPrice;

  const isVolumeChanged =
    isFinalized &&
    approvedVolume !== null &&
    Math.abs(approvedVolume - requestedVolume) > 0.0001;

  const isUnitPriceChanged =
    isFinalized &&
    approvedUnitPrice !== null &&
    Math.abs(approvedUnitPrice - requestedUnitPrice) > 0.01;

  const isTotalPriceChanged =
    isFinalized &&
    approvedTotalPrice !== null &&
    Math.abs(approvedTotalPrice - requestedTotalPrice) > 0.01;

  const hasChanges =
    isVolumeChanged || isUnitPriceChanged || isTotalPriceChanged;

  const isAdjusted = isVolumeReduced || isPriceReduced || hasChanges;

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
    displayVolume,
    displayUnitPrice,
    displayTotalPrice,
    isApproved,
    hasApprovedFigures,
    isVolumeReduced,
    isPriceReduced,
    isVolumeChanged,
    isUnitPriceChanged,
    isTotalPriceChanged,
    hasChanges,
    isAdjusted,
    volumeDifference,
    totalDifference,
  };
}
