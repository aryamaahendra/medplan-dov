export interface CandidateNeed {
  id: number;
  title: string;
  description: string | null;
  year: number;
  volume?: number | string | null;
  unit?: string | null;
  unit_price?: number | string | null;
  total_price: string | number;
  is_recommended_for_next_cycle?: boolean | number | null;
  recommended_volume?: number | string | null;
  need_group?: { id: number; name: string; year: number } | null;
  organizational_unit?: { id: number; name: string } | null;
  need_type?: { id: number; name: string } | null;
  notes?: string | null;
}

/**
 * Normalizes recommendation flag to boolean.
 */
export function isCandidateRecommended(candidate: CandidateNeed): boolean {
  return Boolean(candidate.is_recommended_for_next_cycle);
}

/**
 * Sorts candidates: recommended candidates first, then descending by id.
 */
export function sortCandidates(candidates: CandidateNeed[]): CandidateNeed[] {
  return [...candidates].sort((a, b) => {
    const aRec = isCandidateRecommended(a) ? 1 : 0;
    const bRec = isCandidateRecommended(b) ? 1 : 0;

    if (bRec !== aRec) {
      return bRec - aRec;
    }

    return b.id - a.id;
  });
}

/**
 * Filters candidates locally by search term if needed.
 */
export function filterCandidates(
  candidates: CandidateNeed[],
  query: string,
): CandidateNeed[] {
  const clean = query.trim().toLowerCase();

  if (!clean) {
    return candidates;
  }

  return candidates.filter((candidate) => {
    const titleMatch = candidate.title.toLowerCase().includes(clean);
    const descMatch = candidate.description?.toLowerCase().includes(clean);
    const unitMatch = candidate.organizational_unit?.name
      .toLowerCase()
      .includes(clean);
    const typeMatch = candidate.need_type?.name.toLowerCase().includes(clean);

    return Boolean(titleMatch || descMatch || unitMatch || typeMatch);
  });
}

/**
 * Toggles single candidate selection.
 */
export function toggleSelectionOne(
  currentSelectedIds: number[],
  id: number,
): number[] {
  return currentSelectedIds.includes(id)
    ? currentSelectedIds.filter((item) => item !== id)
    : [...currentSelectedIds, id];
}

/**
 * Toggles select-all across all available candidates.
 */
export function toggleSelectionAll(
  currentSelectedIds: number[],
  allCandidates: CandidateNeed[],
): number[] {
  if (
    currentSelectedIds.length === allCandidates.length &&
    allCandidates.length > 0
  ) {
    return [];
  }

  return allCandidates.map((c) => c.id);
}

/**
 * Calculates sum of total_price for selected candidate IDs.
 */
export function calculateSelectedBudget(
  candidates: CandidateNeed[],
  selectedIds: number[],
): number {
  const selectedSet = new Set(selectedIds);

  return candidates
    .filter((c) => selectedSet.has(c.id))
    .reduce((sum, c) => sum + (parseFloat(String(c.total_price)) || 0), 0);
}
