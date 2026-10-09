export interface NeedType {
  id: number;
  name: string;
  code?: string;
  description: string | null;
  is_active?: boolean;
  order_column?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedNeedTypes {
  data: NeedType[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
