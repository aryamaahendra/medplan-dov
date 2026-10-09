export interface NeedGroup {
  id: number;
  name: string;
  year: number;
  description: string | null;
  submission_start_at: string | null;
  submission_end_at: string | null;
  status?: string;
  created_at: string;
  updated_at: string;
}
