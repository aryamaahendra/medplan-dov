import { ConfirmDialog } from '@/components/confirm-dialog';
import { OrganizationalUnitDialog } from '@/features/organizational-unit/components/organizational-unit-dialog';
import type {
  OrganizationalUnitsIndexHandlers,
  OrganizationalUnitsIndexState,
} from '@/features/organizational-unit/hooks/use-organizational-units-index';

interface OrganizationalUnitModalsProps {
  state: OrganizationalUnitsIndexState;
  handlers: OrganizationalUnitsIndexHandlers;
  allUnits: { id: number; name: string }[];
}

export function OrganizationalUnitModals({
  state,
  handlers,
  allUnits,
}: OrganizationalUnitModalsProps) {
  return (
    <>
      <OrganizationalUnitDialog
        key={state.editingUnit?.id ?? 'create'}
        open={state.dialogOpen}
        onOpenChange={handlers.setDialogOpen}
        unit={state.editingUnit}
        allUnits={allUnits}
      />

      <ConfirmDialog
        open={!!state.deletingUnit}
        onOpenChange={(open) => !open && handlers.setDeletingUnit(null)}
        onConfirm={handlers.handleConfirmDelete}
        title="Hapus Unit Organisasi"
        description={`Apakah Anda yakin ingin menghapus "${state.deletingUnit?.name}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus Unit"
        variant="destructive"
        loading={state.isDeleting}
      />

      <ConfirmDialog
        open={!!state.restoringUnit}
        onOpenChange={(open) => !open && handlers.setRestoringUnit(null)}
        onConfirm={handlers.handleConfirmRestore}
        title="Pulihkan Unit Organisasi"
        description={`Apakah Anda yakin ingin memulihkan "${state.restoringUnit?.name}"? Unit ini akan dikembalikan ke operasional perencanaan aktif.`}
        confirmText="Pulihkan"
        variant="default"
        loading={state.isRestoring}
      />

      <ConfirmDialog
        open={!!state.forceDeletingUnit}
        onOpenChange={(open) => !open && handlers.setForceDeletingUnit(null)}
        onConfirm={handlers.handleConfirmForceDelete}
        title="Hapus Permanen Unit Organisasi"
        description={`Apakah Anda yakin ingin menghapus permanen "${state.forceDeletingUnit?.name}"? Tindakan ini bersifat destruktif dan data tidak dapat dikembalikan lagi.`}
        confirmText="Hapus Permanen"
        variant="destructive"
        loading={state.isForceDeleting}
      />
    </>
  );
}
