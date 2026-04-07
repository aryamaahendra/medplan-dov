export type KpiAnnualTarget = {
  id: number;
  indicator_id: number;
  year: number;
  target_value: string | null;
  created_at: string;
  updated_at: string;
};

export type KpiIndicator = {
  id: number;
  group_id: number;
  parent_indicator_id: number | null;
  name: string;
  unit: string | null;
  is_category: boolean;
  baseline_value: string | null;
  group?: KpiGroup;
  parent_indicator?: KpiIndicator;
  parentIndicator?: KpiIndicator;
  indicators?: KpiIndicator[];
  annual_targets?: KpiAnnualTarget[];
  created_at: string;
  updated_at: string;
};

export type KpiGroup = {
  id: number;
  name: string;
  description: string | null;
  start_year: number;
  end_year: number;
  is_active: boolean;
  indicators?: KpiIndicator[];
  created_at: string;
  updated_at: string;
};
