import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { InputField } from '@/components/form/input-field';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { OrganizationalUnitDialog } from '@/features/organizational-unit/components/organizational-unit-dialog';
import type {
  OrganizationalUnitsIndexHandlers,
  OrganizationalUnitsIndexState,
} from '@/features/organizational-unit/hooks/use-organizational-units-index';
import { cn } from '@/lib/utils';
import type { OrganizationalUnit } from '@/types';
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

      {state.forceDeletingUnit && (
        <ForceDeleteConfirmDialog
          key={state.forceDeletingUnit.id}
          open={true}
          unit={state.forceDeletingUnit}
          onOpenChange={(open) => !open && handlers.setForceDeletingUnit(null)}
          onConfirm={handlers.handleConfirmForceDelete}
          loading={state.isForceDeleting}
        />
      )}
    </>
  );
}

interface ForceDeleteConfirmDialogProps {
  open: boolean;
  unit: OrganizationalUnit;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

function ForceDeleteConfirmDialog({
  open,
  unit,
  onOpenChange,
  onConfirm,
  loading,
}: ForceDeleteConfirmDialogProps) {
  const [confirmName, setConfirmName] = useState('');

  const isTypedMatch =
    Boolean(unit.name) &&
    confirmName.trim().toLowerCase() === unit.name.trim().toLowerCase();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Permanen Unit Organisasi</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini bersifat destruktif dan tidak dapat dibatalkan. Ketik{' '}
            <span className="font-semibold text-foreground">{unit.name}</span>{' '}
            untuk mengonfirmasi penghapusan permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <InputField
            label="Ketik nama unit"
            placeholder={unit.name}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            autoFocus
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={!isTypedMatch || loading}
            className={cn(buttonVariants({ variant: 'destructive' }))}
          >
            {loading ? 'Memproses...' : 'Hapus Permanen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
