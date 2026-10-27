export interface PermissionItem {
  id: number;
  name: string;
  description: string | null;
}

export interface PermissionGroup {
  key: string;
  title: string;
  description: string;
  permissions: PermissionItem[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  users_count?: number;
  permissions?: { id: number; name: string }[];
}

export interface RoleMatrixProps {
  roles: Role[];
  groupedPermissions: PermissionGroup[];
  currentUserRoleIds: number[];
}
