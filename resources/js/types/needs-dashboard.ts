export type DashboardVariant = 'executive' | 'operations' | 'analytical';

export interface DashboardGroupOption {
  id: number;
  name: string;
  year: number;
  is_active: boolean;
  window_status: 'open' | 'closed' | 'upcoming' | 'indefinite';
  submission_end_at: string | null;
}

export interface DashboardStats {
  total_needs: number;
  active_needs_count?: number;
  total_budget: number;
  priority_needs: number;
  unapproved_priority_count?: number;
  unapproved_priority_budget?: number;
  avg_completeness: number;
  assessed_needs_count?: number;
  approved_by_director: number;
  approved_budget: number;
  awaiting_director: number;
  awaiting_director_budget: number;
  draft_count: number;
  draft_budget: number;
  rejected_count: number;
  rejected_budget: number;
  locked_count: number;
  prev_group: { id: number; name: string; year: number } | null;
  prev_total_needs: number | null;
  prev_active_needs_count?: number | null;
  prev_total_budget: number | null;
  prev_approved_budget?: number | null;
  prev_priority_needs: number | null;
  prev_avg_completeness: number | null;
  prev_approved_by_director: number | null;
}

export interface StageDistributionItem {
  count: number;
  budget: number;
  percentage: number;
}

export interface PriorityMatrixCell {
  urgency: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  count: number;
  budget: number;
}

export interface DecisionQueueItem {
  id: number;
  title: string;
  unit_name: string;
  organizational_unit_id: number;
  type_name: string;
  total_price: number;
  volume?: number;
  unit?: string | null;
  urgency?: 'high' | 'medium' | 'low';
  impact?: 'high' | 'medium' | 'low';
  checklist_percentage: number;
  is_priority: boolean;
  attachments_count?: number;
  has_notes?: boolean;
  notes: string | null;
  can_approve: boolean;
}
export interface UnitBudgetStat {
  unit_id: number | null;
  name: string;
  parents: string[];
  count: number;
  total_budget: number;
  priority_count: number;
  approved_count: number;
  approved_budget?: number;
  under_review_count?: number;
  review_budget?: number;
  draft_count?: number;
  draft_budget?: number;
  rejected_count?: number;
}
export interface UnitProgressItem {
  unit_id: number;
  name: string;
  parent_id?: number | null;
  depth?: number;
  breadcrumb?: string | null;
  total_needs: number;
  total_budget: number;
  draft_count: number;
  under_review_count: number;
  approved_count: number;
  rejected_count: number;
  completion_rate: number;
  has_submission: boolean;
  exceptions_count?: number;
  readiness?: number;
}

export interface NeedTypeStat {
  type_id: number;
  name: string;
  count: number;
  total_budget: number;
  percentage: number;
  avg_ticket?: number;
}

export interface DataReadiness {
  avg_checklist: number;
  attachment_coverage: number;
  alignment_coverage: number;
  kak_detail_coverage: number;
}

export interface ExceptionSummary {
  low_checklist_drafts: number;
  under_review_no_files: number;
  unaligned_needs: number;
  expiring_unlocks: number;
  rejected_not_revised: number;
  zero_submission_units: number;
}

export interface ActiveUnlockItem {
  id: number;
  title: string;
  unit_name: string;
  unlocked_until: string | null;
  lock_reason: string | null;
  can_lock: boolean;
  can_unlock: boolean;
}

export interface SasaranOverviewItem {
  id: number;
  name: string;
  tujuan_name: string;
  needs_count: number;
}

export interface FundingSourceStat {
  name: string;
  needs_count: number;
  total_budget: number;
}

export interface MyUnitData {
  unit_id: number;
  name: string;
  total_needs: number;
  total_budget: number;
  approved_count: number;
  under_review_count: number;
  draft_count: number;
  rejected_count: number;
  priority_count: number;
}

export interface OperationNeedDrawerItem {
  id: number;
  title: string;
  unit_name: string;
  organizational_unit_id: number;
  stage: string;
  total_price: number;
  checklist_percentage: number;
  idle_days: number;
  updated_at: string;
  is_priority: boolean;
  is_locked: boolean;
  lock_reason: string | null;
  unlocked_until: string | null;
}

export interface OperationExceptionItem {
  code: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  budget: number;
  stage: string;
  query_filter?: Record<string, any>;
  needs: OperationNeedDrawerItem[];
}

export interface OperationsLockAnomaly {
  type: string;
  title: string;
  description: string;
  count: number;
  needs: OperationNeedDrawerItem[];
}

export interface OperationsLockMonitorData {
  timeline: {
    status: 'open' | 'closed' | 'upcoming' | 'indefinite';
    start_at: string | null;
    end_at: string | null;
    days_remaining: number | null;
    now_formatted: string;
  };
  tier_counts: {
    tier_2_extension: number;
    tier_3_manual: number;
    tier_4_director: number;
    tier_5_window: number;
    total_locked: number;
  };
  anomalies: OperationsLockAnomaly[];
  active_unlocks: ActiveUnlockItem[];
}

export interface AgingBucketItem {
  key: string;
  label: string;
  description: string;
  count: number;
  budget: number;
}

export interface OperationsAgingData {
  draft: AgingBucketItem[];
  under_review: AgingBucketItem[];
  rejected: AgingBucketItem[];
}

export interface OperationsStageTile {
  count: number;
  budget: number;
  holder: string;
  exceptions_count: number;
}

export interface OperationsPayload {
  meta: {
    scope_label: string;
    updated_at: string;
    formatted_time: string;
    window_status: 'open' | 'closed' | 'upcoming' | 'indefinite';
    window_start_at: string | null;
    window_end_at: string | null;
    days_remaining: number | null;
  };
  stage_tiles: Record<
    'draft' | 'under_review' | 'approved' | 'rejected',
    OperationsStageTile
  >;
  ready_for_verification: {
    count: number;
    budget: number;
    needs: OperationNeedDrawerItem[];
  };
  exceptions: OperationExceptionItem[];
  lock_monitor: OperationsLockMonitorData;
  aging: OperationsAgingData;
  unit_progress: UnitProgressItem[];
}

export interface NeedsDashboardPayload {
  currentGroup: DashboardGroupOption | null;
  availableGroups: DashboardGroupOption[];
  stats: DashboardStats;
  stageDistribution: Record<
    'draft' | 'under_review' | 'approved' | 'rejected',
    StageDistributionItem
  >;
  statusDistribution: Record<string, number>;
  matrix: Record<string, PriorityMatrixCell>;
  decisionQueue: DecisionQueueItem[];
  needsByUnit: UnitBudgetStat[];
  needsByType: NeedTypeStat[];
  allUnitProgress: UnitProgressItem[];
  dataReadiness: DataReadiness;
  exceptions: ExceptionSummary;
  activeUnlocks: ActiveUnlockItem[];
  sasaranOverview: SasaranOverviewItem[];
  fundingSources: FundingSourceStat[];
  checklistBuckets: Record<string, number>;
  myUnitData: MyUnitData | null;
  operations?: OperationsPayload;
}
