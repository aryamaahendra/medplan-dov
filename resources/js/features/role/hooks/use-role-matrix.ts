import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  PermissionGroup,
  PermissionItem,
  Role,
} from '@/features/role/types/role.types';
import rolesRoutes from '@/routes/roles';

export interface UseRoleMatrixProps {
  roles: Role[];
  groupedPermissions: PermissionGroup[];
  currentUserRoleIds: number[];
}

export function useRoleMatrix({
  roles,
  groupedPermissions,
  currentUserRoleIds,
}: UseRoleMatrixProps) {
  // Build initial matrix mapping: roleId -> Set of permission IDs
  const baselineMatrix = useMemo(() => {
    const map: Record<number, Set<number>> = {};

    for (const role of roles) {
      map[role.id] = new Set(role.permissions?.map((p) => p.id) ?? []);
    }

    return map;
  }, [roles]);

  const [matrix, setMatrix] =
    useState<Record<number, Set<number>>>(baselineMatrix);
  const [prevBaselineMatrix, setPrevBaselineMatrix] = useState(baselineMatrix);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Sync matrix state when roles prop updates from server without cascading effects
  if (prevBaselineMatrix !== baselineMatrix) {
    setPrevBaselineMatrix(baselineMatrix);
    setMatrix(baselineMatrix);
  }

  // All group keys for expanding/collapsing
  const allGroupKeys = useMemo(
    () => new Set(groupedPermissions.map((g) => g.key)),
    [groupedPermissions],
  );

  const [expandedGroups, setExpandedGroups] =
    useState<Set<string>>(allGroupKeys);
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (query.trim()) {
        setExpandedGroups(allGroupKeys);
      }
    },
    [allGroupKeys],
  );
  // Filter groups and permissions based on search query
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return groupedPermissions;
    }

    return groupedPermissions
      .map((group) => {
        const matchesGroup = group.title.toLowerCase().includes(query);
        const matchedPermissions = group.permissions.filter(
          (p) =>
            matchesGroup ||
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)),
        );

        return {
          ...group,
          permissions: matchedPermissions,
        };
      })
      .filter((group) => group.permissions.length > 0);
  }, [groupedPermissions, searchQuery]);

  // Flat list of all available permissions in the system
  const allPermissions = useMemo(() => {
    return groupedPermissions.flatMap((g) => g.permissions);
  }, [groupedPermissions]);

  // Determine dirty state and dirty count
  const { isDirty, dirtyCount } = useMemo(() => {
    let count = 0;

    for (const role of roles) {
      if (role.name.toLowerCase() === 'super-admin') {
        continue;
      }

      const current = matrix[role.id] ?? new Set();
      const base = baselineMatrix[role.id] ?? new Set();

      // Check added
      for (const id of current) {
        if (!base.has(id)) {
          count++;
        }
      }

      // Check removed
      for (const id of base) {
        if (!current.has(id)) {
          count++;
        }
      }
    }

    return { isDirty: count > 0, dirtyCount: count };
  }, [roles, matrix, baselineMatrix]);

  // Warn on beforeunload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Toggle single permission for a role
  const togglePermission = useCallback(
    (roleId: number, permissionId: number) => {
      const role = roles.find((r) => r.id === roleId);

      if (role?.name.toLowerCase() === 'super-admin') {
        return;
      }

      setMatrix((prev) => {
        const currentRolePerms = new Set(prev[roleId] ?? []);

        if (currentRolePerms.has(permissionId)) {
          currentRolePerms.delete(permissionId);
        } else {
          currentRolePerms.add(permissionId);
        }

        return {
          ...prev,
          [roleId]: currentRolePerms,
        };
      });
    },
    [roles],
  );

  // Toggle all permissions in a module group for a role
  const toggleGroupForRole = useCallback(
    (
      roleId: number,
      groupPermissions: PermissionItem[],
      allChecked: boolean,
    ) => {
      const role = roles.find((r) => r.id === roleId);

      if (role?.name.toLowerCase() === 'super-admin') {
        return;
      }

      setMatrix((prev) => {
        const currentRolePerms = new Set(prev[roleId] ?? []);

        if (allChecked) {
          // Deselect all in group
          for (const perm of groupPermissions) {
            currentRolePerms.delete(perm.id);
          }
        } else {
          // Select all in group
          for (const perm of groupPermissions) {
            currentRolePerms.add(perm.id);
          }
        }

        return {
          ...prev,
          [roleId]: currentRolePerms,
        };
      });
    },
    [roles],
  );

  // Toggle all permissions across the whole system for a role
  const toggleAllForRole = useCallback(
    (roleId: number, allChecked: boolean) => {
      const role = roles.find((r) => r.id === roleId);

      if (role?.name.toLowerCase() === 'super-admin') {
        return;
      }

      setMatrix((prev) => {
        const newSet = allChecked
          ? new Set<number>()
          : new Set(allPermissions.map((p) => p.id));

        return {
          ...prev,
          [roleId]: newSet,
        };
      });
    },
    [roles, allPermissions],
  );

  // Accordion toggle
  const toggleAccordion = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);

      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }

      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedGroups(allGroupKeys);
  }, [allGroupKeys]);

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  // Check self-lockout risk
  const hasSelfLockoutRisk = useMemo(() => {
    const isSuperAdmin = roles.some(
      (r) =>
        currentUserRoleIds.includes(r.id) &&
        r.name.toLowerCase() === 'super-admin',
    );

    if (isSuperAdmin) {
      return false;
    }

    const criticalPermissions = allPermissions.filter((p) =>
      ['view any roles', 'update roles'].includes(p.name),
    );

    for (const roleId of currentUserRoleIds) {
      const currentPerms = matrix[roleId] ?? new Set();
      const hasMissingCritical = criticalPermissions.some(
        (cp) => !currentPerms.has(cp.id),
      );

      if (hasMissingCritical) {
        return true;
      }
    }

    return false;
  }, [currentUserRoleIds, roles, matrix, allPermissions]);

  // Save batch matrix changes
  const saveChanges = useCallback(() => {
    if (!isDirty) {
      return;
    }

    const payload: Record<number, number[]> = {};

    for (const role of roles) {
      if (role.name.toLowerCase() === 'super-admin') {
        continue;
      }

      payload[role.id] = Array.from(matrix[role.id] ?? []);
    }

    setIsSaving(true);
    router.put(
      rolesRoutes.matrix.update.url(),
      { matrix: payload },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSaving(false);
        },
      },
    );
  }, [isDirty, roles, matrix]);

  // Discard all unsaved changes
  const discardChanges = useCallback(() => {
    setMatrix(baselineMatrix);
  }, [baselineMatrix]);

  return {
    roles,
    groupedPermissions,
    filteredGroups,
    matrix,
    baselineMatrix,
    isDirty,
    dirtyCount,
    isSaving,
    searchQuery,
    setSearchQuery: handleSearchChange,
    expandedGroups,
    toggleAccordion,
    expandAll,
    collapseAll,
    togglePermission,
    toggleGroupForRole,
    toggleAllForRole,
    hasSelfLockoutRisk,
    saveChanges,
    discardChanges,
    // Modals
    isCreateOpen,
    setIsCreateOpen,
    editingRole,
    setEditingRole,
    deletingRole,
    setDeletingRole,
  };
}
