export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  permissions?: Permission[];
}
