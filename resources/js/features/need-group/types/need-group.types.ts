export interface NeedGroup {
  id: number;
  name: string;
  description: string | null;
  year: number;
  is_active?: boolean;
  submission_start_at: string | null;
  submission_end_at: string | null;
  need_count?: number;
  total_budget?: number | null;
  approved_count?: number;
  priority_count?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedNeedGroups {
  data: NeedGroup[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface GroupTrendStat {
  id?: number;
  name?: string;
  year?: number;
  total_needs: number;
  total_budget: number;
}

export type YearlyTrendStat = GroupTrendStat;

export interface NeedGroupsSummaryStatsData {
  total_groups: number;
  active_groups: number;
  total_needs?: number;
  total_approved?: number;
  total_budget?: number;
  group_trends?: GroupTrendStat[];
  yearly_trends?: GroupTrendStat[];
}
