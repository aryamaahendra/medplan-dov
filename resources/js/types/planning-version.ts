export interface PlanningVersion {
  id: number;
  name: string;
  year_start: number;
  year_end: number;
  revision_no: number;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  is_current: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanningActivityYear {
  id: number;
  yearable_id: number;
  yearable_type: string;
  year: number;
  target: string | null;
  budget: string | number | null;
  total_budget?: string | number | null;
  created_at: string;
  updated_at: string;
}

export interface PlanningActivityIndicator {
  id: number;
  planning_activity_version_id: number;
  name: string;
  baseline: string | null;
  unit: string | null;
  activity_years?: PlanningActivityYear[];
  created_at: string;
  updated_at: string;
}

export interface PlanningActivityVersion {
  id: number;
  planning_version_id: number;
  parent_id: number | null;
  code: string | null;
  type: string | null;
  name: string;
  full_code: string | null;
  perangkat_daerah: string | null;
  keterangan: string | null;
  sort_order: number;
  activity_years?: PlanningActivityYear[];
  indicators?: PlanningActivityIndicator[];
  specific_indicator?: PlanningActivityIndicator | null;
  parent?: PlanningActivityVersion;
  created_at: string;
  updated_at: string;
}
