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
  tujuan_id: number | null;
  sasaran_id: number | null;
  name: string;
  baseline: string | null;
  description: string | null;
  targets?: IndicatorTarget[];
  created_at: string;
  updated_at: string;
};

export type Sasaran = {
  id: number;
  tujuan_id: number;
  name: string;
  description: string | null;
  indicators?: Indicator[];
  created_at: string;
  updated_at: string;
};

export type Tujuan = {
  id: number;
  renstra_id: number;
  name: string;
  description: string | null;
  sasarans?: Sasaran[];
  indicators?: Indicator[];
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
  tujuans?: Tujuan[];
  created_at: string;
  updated_at: string;
};
