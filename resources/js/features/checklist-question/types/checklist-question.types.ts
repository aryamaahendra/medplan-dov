import type { ChecklistQuestion, ChecklistAnswer } from '@/types';

export type { ChecklistQuestion, ChecklistAnswer };

export interface PaginatedChecklistQuestions {
  data: ChecklistQuestion[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
