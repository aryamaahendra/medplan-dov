export interface ChecklistQuestion {
  id: number;
  question: string;
  description?: string | null;
  is_active: boolean; // Global active status
  order_column: number;
}

export interface AssignedQuestion {
  id: number;
  question: string;
  description?: string | null;
  is_active: boolean; // Pivot active status
  is_required: boolean;
  order_column: number;
}

export interface NeedGroup {
  id: number;
  name: string;
  year: number;
}
