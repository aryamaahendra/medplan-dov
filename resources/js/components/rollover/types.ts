import type { CandidateNeed } from './rollover-engine';

export type RolloverSelectionMode = 'single' | 'multiple';

export interface UseRolloverCandidatesOptions {
  targetGroupId?: number | string | null;
  open: boolean;
  mode?: RolloverSelectionMode;
  initialSelectedIds?: number[];
  onSelectSource?: (sourceNeed: any) => void;
  onSelectIds?: (selectedIds: number[]) => void;
  onOpenChange?: (open: boolean) => void;
  targetNeedGroupName?: string | null;
}

export interface RolloverCandidatesController {
  candidates: CandidateNeed[];
  selectedIds: number[];
  selectedBudget: number;
  loading: boolean;
  submitting: boolean;
  selectingId: number | null;
  search: string;
  isAllSelected: boolean;
  mode: RolloverSelectionMode;

  // Actions
  setSearch: (term: string) => void;
  fetchCandidates: () => Promise<void>;
  toggleSelectOne: (id: number) => void;
  toggleSelectAll: () => void;
  isSelected: (id: number) => boolean;
  commitBatch: (needGroupId: number, needGroupName?: string) => Promise<void>;
  pickSingle: (candidateId: number) => Promise<void>;
}
