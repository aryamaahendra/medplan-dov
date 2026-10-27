export interface User {
  id: number;
  name: string;
  nip?: string;
  email: string;
  created_at: string;
  roles?: { id: number; name: string }[];
  organizational_unit_id?: number;
}
