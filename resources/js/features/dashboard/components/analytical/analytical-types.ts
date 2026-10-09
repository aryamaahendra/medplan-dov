export type DerivedStage = 'draft' | 'under_review' | 'approved' | 'rejected';

export type ChecklistBand = 'all' | 'unassessed' | 'low' | 'ready';

export type PriorityFilter = 'all' | 'priority_only' | 'non_priority';

export interface SliceState {
  unitIds: number[];
  includeDescendants: boolean;
  typeIds: number[];
  stages: DerivedStage[];
  priority: PriorityFilter;
  urgencies: ('high' | 'medium' | 'low')[];
  impacts: ('high' | 'medium' | 'low')[];
  checklistBand: ChecklistBand;
  attentions: string[];
}

export const INITIAL_SLICE_STATE: SliceState = {
  unitIds: [],
  includeDescendants: true,
  typeIds: [],
  stages: [],
  priority: 'all',
  urgencies: [],
  impacts: [],
  checklistBand: 'all',
  attentions: [],
};

export type AnalyticalTabKey =
  'ringkasan' | 'anggaran' | 'keselarasan' | 'alur' | 'unit';

export type BreakdownMetric = 'count' | 'budget';

export type BreakdownDimension =
  'unit' | 'type' | 'stage' | 'priority' | 'urgency' | 'impact' | 'checklist';

export interface BreakdownRow {
  key: string;
  label: string;
  metricValue: number;
  percentage: number;
  rank: number;
  deltaFromAvg: number;
  rawValue?: string | number | null;
  dimensionKey: BreakdownDimension;
}

export interface SlicedMetrics {
  totalCount: number;
  totalBudget: number;
  approvedCount: number;
  approvedBudget: number;
  reviewCount: number;
  reviewBudget: number;
  draftCount: number;
  draftBudget: number;
  rejectedCount: number;
  rejectedBudget: number;
  priorityCount: number;
  priorityBudget: number;
  assessedCount: number;
  avgReadiness: number;
}
