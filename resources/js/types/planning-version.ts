import type { PlanningActivityType } from './planning-activity';

export interface PlanningVersion {
  id: number;
  name: string;
  fiscal_year: number;
  revision_no: number;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  is_current: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanningActivityYear {
  id: number;
  planning_activity_version_id: number;
  year: number;
  target: string;
  budget: string | number;
  created_at: string;
  updated_at: string;
}

export interface PlanningActivityVersion {
  id: number;
  planning_version_id: number;
  revision_group_id: number | null;
  source_activity_id: number | null;
  parent_id: number | null;
  code: string | null;
  name: string;
  type: PlanningActivityType;
  full_code: string | null;
  indicator_name: string | null;
  indicator_baseline_2024: string | null;
  perangkat_daerah: string | null;
  keterangan: string | null;
  sort_order: number;
  activity_years?: PlanningActivityYear[];
  parent?: PlanningActivityVersion;
  created_at: string;
  updated_at: string;
}
