export interface PlanningActivity {
  id: number;
  code: string | null;
  name: string;
  parent_id: number | null;
  full_code: string | null;
  parent?: PlanningActivity;
  children?: PlanningActivity[];
  created_at: string;
  updated_at: string;
}
