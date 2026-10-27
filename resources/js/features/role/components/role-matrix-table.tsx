import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiEditLine,
  RiShieldCheckLine,
} from '@remixicon/react';
import { useMemo } from 'react';

import { ActionDropdown } from '@/components/action-dropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  PermissionGroup,
  PermissionItem,
  Role,
} from '@/features/role/types/role.types';
import { cn } from '@/lib/utils';

interface RoleMatrixTableProps {
  roles: Role[];
  filteredGroups: PermissionGroup[];
  matrix: Record<number, Set<number>>;
  baselineMatrix?: Record<number, Set<number>>;
  expandedGroups: Set<string>;
  onToggleAccordion: (groupKey: string) => void;
  onTogglePermission: (roleId: number, permissionId: number) => void;
  onToggleGroupForRole: (
    roleId: number,
    groupPermissions: PermissionItem[],
    allChecked: boolean,
  ) => void;
  onToggleAllForRole: (roleId: number, allChecked: boolean) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  canManageRoles?: boolean;
}

export function RoleMatrixTable({
  roles,
  filteredGroups,
  matrix,
  baselineMatrix,
  expandedGroups,
  onToggleAccordion,
  onTogglePermission,
  onToggleGroupForRole,
  onToggleAllForRole,
  onEditRole,
  onDeleteRole,
  canManageRoles = true,
}: RoleMatrixTableProps) {
  // Flat all permissions from filtered groups
  const allFilteredPermissions = useMemo(() => {
    return filteredGroups.flatMap((g) => g.permissions);
  }, [filteredGroups]);

  return (
    <TooltipProvider delay={150}>
      <div className="relative w-full overflow-x-auto rounded-lg border bg-card shadow-xs">
        <table className="w-full border-collapse text-left text-sm">
          {/* Header */}
          <thead className="sticky top-0 z-20 bg-muted/90 backdrop-blur-md">
            <tr className="border-b-2 border-border">
              {/* Sticky first column header */}
              <th className="sticky left-0 z-30 max-w-[380px] min-w-[320px] border-r-2 border-b-2 border-border bg-muted p-3.5 font-semibold text-foreground backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span>Hak Akses (Permissions)</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {allFilteredPermissions.length} Ditampilkan
                  </span>
                </div>
              </th>
              {/* Role column headers */}
              {roles.map((role) => {
                const isSuperAdmin = role.name.toLowerCase() === 'super-admin';
                const rolePerms = matrix[role.id] ?? new Set();
                const areAllRolePermsChecked =
                  !isSuperAdmin &&
                  allFilteredPermissions.length > 0 &&
                  allFilteredPermissions.every((p) => rolePerms.has(p.id));

                return (
                  <th
                    key={role.id}
                    className="max-w-[220px] min-w-[180px] border-r border-b-2 border-border p-3 text-center align-top last:border-r-0"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex w-full items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          {isSuperAdmin && (
                            <RiShieldCheckLine className="size-4 shrink-0 text-primary" />
                          )}
                          <span
                            className="truncate text-sm font-semibold text-foreground"
                            title={role.name}
                          >
                            {role.name}
                          </span>
                        </div>

                        {canManageRoles && !isSuperAdmin && (
                          <ActionDropdown
                            triggerVariant="ghost"
                            className="size-7 p-0"
                            actions={[
                              {
                                label: 'Ubah Nama Role',
                                icon: RiEditLine,
                                onClick: () => onEditRole(role),
                              },
                              {
                                label: 'Hapus Role',
                                icon: RiDeleteBinLine,
                                variant: 'destructive',
                                onClick: () => onDeleteRole(role),
                              },
                            ]}
                          />
                        )}
                      </div>

                      {/* Sub-label */}
                      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {isSuperAdmin ? (
                            <Badge
                              variant="secondary"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              Semua Akses
                            </Badge>
                          ) : (
                            `${role.users_count ?? 0} Pengguna`
                          )}
                        </span>

                        {!isSuperAdmin &&
                          canManageRoles &&
                          allFilteredPermissions.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                onToggleAllForRole(
                                  role.id,
                                  areAllRolePermsChecked,
                                )
                              }
                              className="text-[11px] font-medium text-primary hover:underline"
                            >
                              {areAllRolePermsChecked
                                ? 'Batal Semua'
                                : 'Pilih Semua'}
                            </button>
                          )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y">
            {filteredGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={roles.length + 1}
                  className="p-8 text-center text-sm text-muted-foreground"
                >
                  Tidak ada hak akses yang sesuai dengan kata kunci pencarian.
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.key);

                return (
                  <GroupSection
                    key={group.key}
                    group={group}
                    roles={roles}
                    matrix={matrix}
                    baselineMatrix={baselineMatrix}
                    isExpanded={isExpanded}
                    onToggleAccordion={() => onToggleAccordion(group.key)}
                    onTogglePermission={onTogglePermission}
                    onToggleGroupForRole={onToggleGroupForRole}
                    canManageRoles={canManageRoles}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}

interface GroupSectionProps {
  group: PermissionGroup;
  roles: Role[];
  matrix: Record<number, Set<number>>;
  baselineMatrix?: Record<number, Set<number>>;
  isExpanded: boolean;
  onToggleAccordion: () => void;
  onTogglePermission: (roleId: number, permissionId: number) => void;
  onToggleGroupForRole: (
    roleId: number,
    groupPermissions: PermissionItem[],
    allChecked: boolean,
  ) => void;
  canManageRoles: boolean;
}

function GroupSection({
  group,
  roles,
  matrix,
  baselineMatrix = {},
  isExpanded,
  onToggleAccordion,
  onTogglePermission,
  onToggleGroupForRole,
  canManageRoles,
}: GroupSectionProps) {
  return (
    <>
      {/* Group Header Row */}
      <tr className="bg-muted/40 font-medium transition-colors hover:bg-muted/60">
        {/* Sticky group title cell */}
        <td className="sticky left-0 z-10 border-r-2 border-border bg-muted/95 p-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleAccordion}
              className="size-7 shrink-0 p-0 text-muted-foreground hover:text-foreground"
              aria-label={isExpanded ? 'Tutup grup' : 'Buka grup'}
            >
              {isExpanded ? (
                <RiArrowDownSLine className="size-4" />
              ) : (
                <RiArrowRightSLine className="size-4" />
              )}
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleAccordion}
                  className="text-left text-sm font-semibold text-foreground hover:underline"
                >
                  {group.title}
                </button>
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[11px] font-normal"
                >
                  {group.permissions.length}
                </Badge>
              </div>
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {group.description}
              </span>
            </div>
          </div>
        </td>

        {/* Group select-all toggle per role */}
        {roles.map((role) => {
          const isSuperAdmin = role.name.toLowerCase() === 'super-admin';
          const rolePerms = matrix[role.id] ?? new Set();
          const allGroupChecked =
            isSuperAdmin ||
            (group.permissions.length > 0 &&
              group.permissions.every((p) => rolePerms.has(p.id)));

          return (
            <td
              key={role.id}
              className="border-r border-border p-2 text-center align-middle last:border-r-0"
            >
              <div className="flex items-center justify-center">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span>
                        <Checkbox
                          checked={allGroupChecked}
                          disabled={isSuperAdmin || !canManageRoles}
                          onCheckedChange={() =>
                            onToggleGroupForRole(
                              role.id,
                              group.permissions,
                              allGroupChecked,
                            )
                          }
                          aria-label={`Toggle all ${group.title} for ${role.name}`}
                        />
                      </span>
                    }
                  />
                  <TooltipContent>
                    {isSuperAdmin
                      ? 'Super Admin memiliki semua hak akses'
                      : allGroupChecked
                        ? `Hapus semua hak akses ${group.title} untuk ${role.name}`
                        : `Pilih semua hak akses ${group.title} untuk ${role.name}`}
                  </TooltipContent>
                </Tooltip>
              </div>
            </td>
          );
        })}
      </tr>

      {/* Permission Rows */}
      {isExpanded &&
        group.permissions.map((permission) => (
          <tr
            key={permission.id}
            className="transition-colors hover:bg-muted/20"
          >
            {/* Sticky permission name/description cell */}
            <td className="sticky left-0 z-10 border-r-2 border-border bg-card p-2.5 pl-9 backdrop-blur-xs">
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-foreground">
                  {permission.name}
                </span>
                {permission.description && (
                  <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {permission.description}
                  </span>
                )}
              </div>
            </td>

            {/* Checkbox per role */}
            {roles.map((role) => {
              const isSuperAdmin = role.name.toLowerCase() === 'super-admin';
              const isChecked =
                isSuperAdmin || (matrix[role.id]?.has(permission.id) ?? false);
              const baselineChecked =
                isSuperAdmin ||
                (baselineMatrix[role.id]?.has(permission.id) ?? false);
              const isDirtyCell =
                !isSuperAdmin && isChecked !== baselineChecked;

              return (
                <td
                  key={role.id}
                  className={cn(
                    'border-r border-border p-2 text-center align-middle transition-colors last:border-r-0',
                    isDirtyCell && 'bg-amber-500/10 dark:bg-amber-400/10',
                  )}
                >
                  <div className="flex items-center justify-center">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span>
                            <Checkbox
                              checked={isChecked}
                              disabled={isSuperAdmin || !canManageRoles}
                              onCheckedChange={() =>
                                onTogglePermission(role.id, permission.id)
                              }
                              aria-label={`${permission.name} for ${role.name}`}
                            />
                          </span>
                        }
                      />
                      <TooltipContent>
                        {isSuperAdmin
                          ? 'Super Admin selalu memiliki hak akses ini'
                          : `${permission.name} (${role.name}): ${isChecked ? 'Aktif' : 'Nonaktif'}`}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
    </>
  );
}
