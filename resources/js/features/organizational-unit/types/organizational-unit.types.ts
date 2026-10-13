export interface OrganizationalUnit {
  id: number;
  name: string;
  code?: string;
  parent_id: number | null;
  parent?: OrganizationalUnit | null;
  parents_recursive?: OrganizationalUnit | null;
  created_at?: string;
  deleted_at?: string | null;
  can?: {
    update?: boolean;
    delete?: boolean;
    restore?: boolean;
    forceDelete?: boolean;
  };
}
