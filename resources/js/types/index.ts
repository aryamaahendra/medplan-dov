export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './renstra';
export type * from './kpi';
export type * from './strategic-service-plan';
import './table';

export interface ChecklistQuestion {
  id: number;
  question: string;
  description: string | null;
  is_active: boolean;
  order_column: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistAnswer {
  id: number;
  need_id: number;
  checklist_question_id: number;
  answer: 'yes' | 'no' | 'skip';
  notes: string | null;
  created_at: string;
  updated_at: string;
}
