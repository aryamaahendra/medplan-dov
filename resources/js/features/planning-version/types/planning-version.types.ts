export interface PlanningVersionsIndexFilters {
  search?: string;
  field?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
