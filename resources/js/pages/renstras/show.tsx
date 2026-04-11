import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import renstraRoutes from '@/routes/renstras';
import type { Indicator, Renstra, Sasaran, Tujuan } from '@/types';

import { IndicatorDialog } from '../indicators/components/indicator-dialog';
import { RenstraInfo } from './components/renstra-info';
import { RenstraSection } from './components/renstra-section';
import { RenstraTable } from './components/renstra-table';
import { SasaranDialog } from './components/sasaran-dialog';
import { TujuanCard } from './components/tujuan-card';
import { TujuanDialog } from './components/tujuan-dialog';
import SasaranController from '@/actions/App/Http/Controllers/SasaranController';
import TujuanController from '@/actions/App/Http/Controllers/TujuanController';

interface RenstraShowProps {
  renstra: Renstra;
}

export default function RenstraShow({ renstra }: RenstraShowProps) {
  const [tujuanDialogOpen, setTujuanDialogOpen] = useState(false);
  const [editingTujuan, setEditingTujuan] = useState<Tujuan | null>(null);

  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(
    null,
  );
  const [activeTujuanForIndicator, setActiveTujuanForIndicator] =
    useState<Tujuan | null>(null);
  const [activeSasaranForIndicator, setActiveSasaranForIndicator] =
    useState<Sasaran | null>(null);

  const [sasaranDialogOpen, setSasaranDialogOpen] = useState(false);
  const [editingSasaran, setEditingSasaran] = useState<Sasaran | null>(null);
  const [activeTujuanForSasaran, setActiveTujuanForSasaran] =
    useState<Tujuan | null>(null);

  const [deletingSasaran, setDeletingSasaran] = useState<Sasaran | null>(null);
  const [isDeletingSasaran, setIsDeletingSasaran] = useState(false);

  const [deletingTujuan, setDeletingTujuan] = useState<Tujuan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [view, setView] = useState<'card' | 'table'>('card');

  // Tujuan Handlers
  const onCreateTujuan = () => {
    setEditingTujuan(null);
    setTujuanDialogOpen(true);
  };

  const onEditTujuan = (tujuan: Tujuan) => {
    setEditingTujuan(tujuan);
    setTujuanDialogOpen(true);
  };

  const handleDeleteTujuan = () => {
    if (!deletingTujuan) {
      return;
    }

    setIsDeleting(true);
    router.delete(TujuanController.destroy.url({ tujuan: deletingTujuan.id }), {
      onSuccess: () => {
        toast.success('Tujuan berhasil dihapus.');
        setDeletingTujuan(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  // Sasaran Handlers
  const onCreateSasaran = (tujuan: Tujuan) => {
    setActiveTujuanForSasaran(tujuan);
    setEditingSasaran(null);
    setSasaranDialogOpen(true);
  };

  const onEditSasaran = (sasaran: Sasaran, tujuan: Tujuan) => {
    setActiveTujuanForSasaran(tujuan);
    setEditingSasaran(sasaran);
    setSasaranDialogOpen(true);
  };

  const handleDeleteSasaran = () => {
    if (!deletingSasaran) {
      return;
    }

    setIsDeletingSasaran(true);
    router.delete(
      SasaranController.destroy.url({ sasaran: deletingSasaran.id }),
      {
        onSuccess: () => {
          toast.success('Sasaran berhasil dihapus.');
          setDeletingSasaran(null);
        },
        onFinish: () => setIsDeletingSasaran(false),
      },
    );
  };

  // Indicator Handlers
  const onCreateIndicator = (tujuan: Tujuan) => {
    setActiveSasaranForIndicator(null);
    setActiveTujuanForIndicator(tujuan);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onEditIndicator = (indicator: Indicator, tujuan: Tujuan) => {
    setActiveSasaranForIndicator(null);
    setActiveTujuanForIndicator(tujuan);
    setEditingIndicator(indicator);
    setIndicatorDialogOpen(true);
  };

  const onCreateIndicatorForSasaran = (sasaran: Sasaran) => {
    setActiveTujuanForIndicator(null);
    setActiveSasaranForIndicator(sasaran);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onEditIndicatorForSasaran = (
    indicator: Indicator,
    sasaran: Sasaran,
  ) => {
    setActiveTujuanForIndicator(null);
    setActiveSasaranForIndicator(sasaran);
    setEditingIndicator(indicator);
    setIndicatorDialogOpen(true);
  };

  return (
    <>
      <Head title={`Detail Renstra: ${renstra.name}`} />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Detail Rencana Strategis
            </h1>
            <p className="text-sm text-muted-foreground">
              Informasi lengkap dan indikator kinerja untuk periode{' '}
              {renstra.year_start} - {renstra.year_end}.
            </p>
          </div>
        </div>

        <RenstraInfo renstra={renstra} />

        <Separator />

        <RenstraSection
          title="Tujuan dan Indikator Kinerja"
          description="Daftar Tujuan strategis beserta indikatornya."
          action={
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(val) => val && setView(val as 'card' | 'table')}
                variant="outline"
              >
                <ToggleGroupItem value="card" aria-label="Card View">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Card
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table View">
                  <TableIcon className="mr-2 h-4 w-4" />
                  Table
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="flex items-center">
                <Separator orientation="vertical" className="h-4" />
              </div>
              <Button onClick={onCreateTujuan}>
                <Plus />
                Tambah Tujuan
              </Button>
            </div>
          }
        >
          {view === 'card' ? (
            <div className="flex flex-col gap-6">
              {!renstra.tujuans || renstra.tujuans.length === 0 ? (
                <div className="rounded-md border p-8 text-center text-muted-foreground">
                  Belum ada tujuan strategis.
                </div>
              ) : (
                renstra.tujuans.map((tujuan) => (
                  <TujuanCard
                    key={tujuan.id}
                    tujuan={tujuan}
                    yearStart={renstra.year_start}
                    yearEnd={renstra.year_end}
                    onCreateSasaran={onCreateSasaran}
                    onCreateIndicator={onCreateIndicator}
                    onEditTujuan={onEditTujuan}
                    onDeleteTujuan={setDeletingTujuan}
                    onEditIndicator={onEditIndicator}
                    onCreateSasaranIndicator={onCreateIndicatorForSasaran}
                    onEditSasaran={onEditSasaran}
                    onDeleteSasaran={setDeletingSasaran}
                    onEditSasaranIndicator={onEditIndicatorForSasaran}
                  />
                ))
              )}
            </div>
          ) : (
            <RenstraTable renstra={renstra} />
          )}
        </RenstraSection>
      </div>

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

RenstraShow.layout = {
  breadcrumbs: [
    {
      title: 'Manajemen Renstra',
      href: renstraRoutes.index.url(),
    },
    {
      title: 'Detail',
    },
  ],
};
