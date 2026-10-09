import { ConfirmDialog } from '@/components/confirm-dialog';
import type { NeedGroup } from '../types/need-group.types';
import { BulkRolloverDialog } from './bulk-rollover-dialog';
import { NeedGroupDialog } from './need-group-dialog';

interface NeedGroupIndexDialogsProps {
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  editingGroup: NeedGroup | null;
  rolloverGroup: NeedGroup | null;
  onRolloverGroupChange: (group: NeedGroup | null) => void;
  deletingGroup: NeedGroup | null;
  onDeletingGroupChange: (group: NeedGroup | null) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export function NeedGroupIndexDialogs({
  isDialogOpen,
  onDialogOpenChange,
  editingGroup,
  rolloverGroup,
  onRolloverGroupChange,
  deletingGroup,
  onDeletingGroupChange,
  onConfirmDelete,
  isDeleting,
}: NeedGroupIndexDialogsProps) {
  return (
    <>
      <NeedGroupDialog
        open={isDialogOpen}
        onOpenChange={onDialogOpenChange}
        needGroup={editingGroup}
      />

      <BulkRolloverDialog
        open={!!rolloverGroup}
        onOpenChange={(open) => !open && onRolloverGroupChange(null)}
        needGroup={rolloverGroup}
      />

      <ConfirmDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && onDeletingGroupChange(null)}
        onConfirm={onConfirmDelete}
        title="Hapus Kelompok Usulan"
        description={`Apakah Anda yakin ingin menghapus "${deletingGroup?.name}"? Data usulan di dalam kelompok ini juga akan terdampak.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
