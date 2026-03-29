export type IndicatorTarget = {
  id: number;
  indicator_id: number;
  year: number;
  target: string;
  created_at: string;
  updated_at: string;
};

export type Indicator = {
  id: number;
  renstra_id: number;
  name: string;
  baseline: string | null;
  description: string | null;
  targets?: IndicatorTarget[];
  created_at: string;
  updated_at: string;
};

export type Renstra = {
  id: number;
  name: string;
  year_start: number;
  year_end: number;
  description: string | null;
  is_active: boolean;
  indicators?: Indicator[];
  created_at: string;
  updated_at: string;
};
