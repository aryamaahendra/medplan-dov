import { ConfirmDialog } from '@/components/confirm-dialog';
import type { Indicator, Renstra, Sasaran, Tujuan } from '@/types';

import { IndicatorDialog } from './indicator-dialog';
import { SasaranDialog } from './sasaran-dialog';
import { TujuanDialog } from './tujuan-dialog';

interface RenstraShowDialogsProps {
  renstra: Renstra;
  tujuanDialogOpen: boolean;
  setTujuanDialogOpen: (open: boolean) => void;
  editingTujuan: Tujuan | null;
  sasaranDialogOpen: boolean;
  setSasaranDialogOpen: (open: boolean) => void;
  editingSasaran: Sasaran | null;
  activeTujuanForSasaran: Tujuan | null;
  indicatorDialogOpen: boolean;
  setIndicatorDialogOpen: (open: boolean) => void;
  editingIndicator: Indicator | null;
  activeTujuanForIndicator: Tujuan | null;
  activeSasaranForIndicator: Sasaran | null;
  deletingTujuan: Tujuan | null;
  setDeletingTujuan: (tujuan: Tujuan | null) => void;
  handleDeleteTujuan: () => void;
  isDeleting: boolean;
  deletingSasaran: Sasaran | null;
  setDeletingSasaran: (sasaran: Sasaran | null) => void;
  handleDeleteSasaran: () => void;
  isDeletingSasaran: boolean;
}

export function RenstraShowDialogs({
  renstra,
  tujuanDialogOpen,
  setTujuanDialogOpen,
  editingTujuan,
  sasaranDialogOpen,
  setSasaranDialogOpen,
  editingSasaran,
  activeTujuanForSasaran,
  indicatorDialogOpen,
  setIndicatorDialogOpen,
  editingIndicator,
  activeTujuanForIndicator,
  activeSasaranForIndicator,
  deletingTujuan,
  setDeletingTujuan,
  handleDeleteTujuan,
  isDeleting,
  deletingSasaran,
  setDeletingSasaran,
  handleDeleteSasaran,
  isDeletingSasaran,
}: RenstraShowDialogsProps) {
  return (
    <>
      <TujuanDialog
        renstra={renstra}
        open={tujuanDialogOpen}
        onOpenChange={setTujuanDialogOpen}
        tujuan={editingTujuan}
      />

      {activeTujuanForSasaran && (
        <SasaranDialog
          tujuan={activeTujuanForSasaran}
          sasaran={editingSasaran}
          open={sasaranDialogOpen}
          onOpenChange={setSasaranDialogOpen}
        />
      )}

      {(activeTujuanForIndicator || activeSasaranForIndicator) && (
        <IndicatorDialog
          open={indicatorDialogOpen}
          onOpenChange={setIndicatorDialogOpen}
          tujuan={activeTujuanForIndicator}
          sasaran={activeSasaranForIndicator}
          indicator={editingIndicator}
          yearStart={renstra.year_start}
          yearEnd={renstra.year_end}
        />
      )}

      <ConfirmDialog
        open={!!deletingTujuan}
        onOpenChange={(open) => !open && setDeletingTujuan(null)}
        onConfirm={handleDeleteTujuan}
        title="Hapus Tujuan"
        description={`Apakah Anda yakin ingin menghapus tujuan "${deletingTujuan?.name}" beserta seluruh sasaran dan indikatornya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />

      <ConfirmDialog
        open={!!deletingSasaran}
        onOpenChange={(open) => !open && setDeletingSasaran(null)}
        onConfirm={handleDeleteSasaran}
        title="Hapus Sasaran"
        description={`Apakah Anda yakin ingin menghapus sasaran "${deletingSasaran?.name}" beserta indikatornya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeletingSasaran}
      />
    </>
  );
}
