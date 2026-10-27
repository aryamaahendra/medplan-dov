import { Head } from '@inertiajs/react';

import { RoleMatrixModals } from '@/features/role/components/role-matrix-modals';
import { RoleMatrixSaveBar } from '@/features/role/components/role-matrix-save-bar';
import { RoleMatrixTable } from '@/features/role/components/role-matrix-table';
import { RoleMatrixToolbar } from '@/features/role/components/role-matrix-toolbar';
import { useRoleMatrix } from '@/features/role/hooks/use-role-matrix';
import type { RoleMatrixProps } from '@/features/role/types/role.types';
import { usePermission } from '@/hooks/use-permission';
import rolesRoutes from '@/routes/roles';

export default function RolesIndex(props: RoleMatrixProps) {
  const { hasPermission } = usePermission();
  const canCreate = hasPermission('create roles');
  const canUpdate = hasPermission('update roles');

  const {
    roles,
    filteredGroups,
    matrix,
    baselineMatrix,
    isDirty,
    dirtyCount,
    isSaving,
    searchQuery,
    setSearchQuery,
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
    isCreateOpen,
    setIsCreateOpen,
    editingRole,
    setEditingRole,
    deletingRole,
    setDeletingRole,
  } = useRoleMatrix(props);

  return (
    <>
      <Head title="Manajemen Role & Hak Akses" />

      <div className="flex flex-col gap-6 p-4 pb-24 sm:p-6">
        <RoleMatrixToolbar
          canCreate={canCreate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onCreateRole={() => setIsCreateOpen(true)}
        />

        <RoleMatrixTable
          roles={roles}
          filteredGroups={filteredGroups}
          matrix={matrix}
          baselineMatrix={baselineMatrix}
          expandedGroups={expandedGroups}
          onToggleAccordion={toggleAccordion}
          onTogglePermission={togglePermission}
          onToggleGroupForRole={toggleGroupForRole}
          onToggleAllForRole={toggleAllForRole}
          onEditRole={setEditingRole}
          onDeleteRole={setDeletingRole}
          canManageRoles={canUpdate}
        />
      </div>

      <RoleMatrixSaveBar
        isDirty={isDirty}
        dirtyCount={dirtyCount}
        isSaving={isSaving}
        hasSelfLockoutRisk={hasSelfLockoutRisk}
        onSave={saveChanges}
        onDiscard={discardChanges}
      />

      <RoleMatrixModals
        isCreateOpen={isCreateOpen}
        onOpenCreateChange={setIsCreateOpen}
        editingRole={editingRole}
        onOpenEditChange={setEditingRole}
        deletingRole={deletingRole}
        onOpenDeleteChange={setDeletingRole}
      />
    </>
  );
}

RolesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Roles',
      href: rolesRoutes.index.url(),
    },
  ],
};
