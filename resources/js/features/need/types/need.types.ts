import type { DataTableFilters } from '@/hooks/use-data-table';

export type AttentionFilterKey =
  | 'low_checklist'
  | 'revision_closing'
  | 'submission_closing'
  | 'has_notes'
  | 'priority_only';

export interface NeedsIndexFilters extends DataTableFilters {
  year?: string | string[];
  status?: string | string[];
  need_type_id?: string | string[];
  organizational_unit_id?: string | string[];
  urgency?: string | string[];
  impact?: string | string[];
  is_priority?: string | string[];
  is_approved_by_director?: string | string[];
  is_recommended_for_next_cycle?: string | string[];
  min_checklist_score?: string | string[];
  stage?: string | string[];
  need_group_id?: string | string[];
  attention?: string | string[];
  include_descendants?: boolean | string;
}

export type {
  Attachment,
  AttentionCounts,
  Need,
  NeedDetail,
  NeedPriority,
  NeedStatus,
  NeedWorkflowStage,
  PaginatedNeeds,
  StageCounts,
} from '@/types/need';
