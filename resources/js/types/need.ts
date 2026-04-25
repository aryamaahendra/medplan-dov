import type { KpiIndicator } from './kpi';
import type { Indicator, Sasaran } from './renstra';
import type { StrategicServicePlan } from './strategic-service-plan';

export interface Attachment {
  id: number;
  need_id: number;
  category: string;
  display_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  extension: string;
  created_at: string;
}

export interface PlanningActivityIndicator {
  id: number;
  planning_activity_version_id: number;
  name: string;
  baseline: string | null;
  unit: string | null;
}

export interface PlanningActivityVersion {
  id: number;
  planning_version_id: number;
  parent_id: number | null;
  code: string | null;
  type: string;
  name: string;
  full_code: string | null;
  indicators?: PlanningActivityIndicator[];
  children?: PlanningActivityVersion[];
}

export interface OrganizationalUnit {
  id: number;
  name: string;
  parent_id: number | null;
  parents_recursive?: OrganizationalUnit | null;
}

export interface NeedDetail {
  id?: number;
  need_id?: number;
  background: string | null;
  purpose_and_objectives: string | null;
  target_objective: string | null;
  procurement_organization_name: string | null;
  funding_source_and_estimated_cost: string | null;
  implementation_period: string | null;
  expert_or_skilled_personnel: string | null;
  technical_specifications: string | null;
  training: string | null;
}

export type NeedStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type NeedPriority = 'high' | 'medium' | 'low';

export interface Need {
  id: number;
  need_group_id: number;
  needGroup?: {
    id: number;
    name: string;
  };
  organizational_unit_id: number;
  need_type_id: number;
  year: number;
  title: string;
  description: string | null;
  current_condition: string | null;
  required_condition: string | null;
  volume: string;
  unit: string;
  unit_price: string;
  total_price: string;
  urgency: NeedPriority | string; // Handle case-insensitive values from API
  impact: NeedPriority | string;
  is_priority: boolean;
  status: NeedStatus;
  created_at: string;
  organizational_unit?: OrganizationalUnit;
  need_type?: { id: number; name: string };
  sasarans?: Sasaran[];
  indicators?: Indicator[];
  kpi_indicators?: KpiIndicator[];
  strategic_service_plans?: StrategicServicePlan[];
  sasarans_count?: number;
  indicators_count?: number;
  kpi_indicators_count?: number;
  strategic_service_plans_count?: number;
  detail?: NeedDetail | null;
  checklist_percentage?: number | string;
  attachments?: Attachment[];
  notes?: string | null;
  approved_by_director_at?: string | null;
  planning_activity_versions?: PlanningActivityVersion[];
  planning_activity_indicators?: PlanningActivityIndicator[];
  can?: {
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
}

export interface PaginatedNeeds {
  data: Need[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
