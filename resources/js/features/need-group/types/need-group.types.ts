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
