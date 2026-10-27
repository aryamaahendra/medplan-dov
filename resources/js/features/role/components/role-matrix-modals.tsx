import { RoleCreateDialog } from '@/features/role/components/role-create-dialog';
import { RoleDeleteDialog } from '@/features/role/components/role-delete-dialog';
import { RoleEditDialog } from '@/features/role/components/role-edit-dialog';
import type { Role } from '@/features/role/types/role.types';

interface RoleMatrixModalsProps {
  isCreateOpen: boolean;
  onOpenCreateChange: (open: boolean) => void;
  editingRole: Role | null;
  onOpenEditChange: (role: Role | null) => void;
  deletingRole: Role | null;
  onOpenDeleteChange: (role: Role | null) => void;
}

export function RoleMatrixModals({
  isCreateOpen,
  onOpenCreateChange,
  editingRole,
  onOpenEditChange,
  deletingRole,
  onOpenDeleteChange,
}: RoleMatrixModalsProps) {
  return (
    <>
      <RoleCreateDialog open={isCreateOpen} onOpenChange={onOpenCreateChange} />

      <RoleEditDialog
        role={editingRole}
        open={!!editingRole}
        onOpenChange={(open) => !open && onOpenEditChange(null)}
      />

      <RoleDeleteDialog
        role={deletingRole}
        open={!!deletingRole}
        onOpenChange={(open) => !open && onOpenDeleteChange(null)}
      />
    </>
  );
}
