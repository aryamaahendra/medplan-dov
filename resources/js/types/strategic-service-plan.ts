export interface StrategicServicePlan {
  id: number;
  year: number;
  strategic_program: string;
  service_plan: string;
  target: string;
  policy_direction: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
