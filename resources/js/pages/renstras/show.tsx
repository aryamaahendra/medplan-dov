import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TujuanController from '@/actions/App/Http/Controllers/TujuanController';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import renstraRoutes from '@/routes/renstras';
import type { Indicator, Renstra, Tujuan } from '@/types';

import { IndicatorDialog } from '../indicators/components/indicator-dialog';
import { IndicatorTable } from './components/indicator-table';
import { TujuanDialog } from './components/tujuan-dialog';

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

  const [deletingTujuan, setDeletingTujuan] = useState<Tujuan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Indicator Handlers
  const onCreateIndicator = (tujuan: Tujuan) => {
    setActiveTujuanForIndicator(tujuan);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onEditIndicator = (indicator: Indicator, tujuan: Tujuan) => {
    setActiveTujuanForIndicator(tujuan);
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

        <Card>
          <CardHeader>
            <CardTitle>{renstra.name}</CardTitle>
            <CardDescription>
              Periode: {renstra.year_start} - {renstra.year_end} | Status:{' '}
              <span
                className={
                  renstra.is_active
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground'
                }
              >
                {renstra.is_active ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h4 className="mb-1 text-sm font-medium">Deskripsi</h4>
                <p className="text-sm text-muted-foreground">
                  {renstra.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Tujuan dan Indikator Kinerja
              </h2>
              <p className="text-sm text-muted-foreground">
                Daftar Tujuan strategis beserta indikatornya.
              </p>
            </div>
            <Button onClick={onCreateTujuan}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tujuan
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            {!renstra.tujuans || renstra.tujuans.length === 0 ? (
              <div className="rounded-md border p-8 text-center text-muted-foreground">
                Belum ada tujuan strategis.
              </div>
            ) : (
              renstra.tujuans.map((tujuan) => (
                <Card key={tujuan.id} className="gap-0 overflow-hidden py-0">
                  <div className="flex flex-col border-b bg-muted/40 p-4 md:flex-row">
                    <div className="flex-1">
                      <h3 className="font-semibold">{tujuan.name}</h3>
                      {tujuan.description && (
                        <p className="mt-1 max-w-[75ch] text-sm whitespace-normal text-muted-foreground">
                          {tujuan.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-start justify-end gap-2 md:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreateIndicator(tujuan)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Indikator
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => onEditTujuan(tujuan)}
                      >
                        <Edit />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={() => setDeletingTujuan(tujuan)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <div className="p-0">
                    <IndicatorTable
                      indicators={tujuan.indicators || []}
                      onEdit={(indicator) => onEditIndicator(indicator, tujuan)}
                      yearStart={renstra.year_start}
                      yearEnd={renstra.year_end}
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <TujuanDialog
        renstra={renstra}
        open={tujuanDialogOpen}
        onOpenChange={setTujuanDialogOpen}
        tujuan={editingTujuan}
      />

      {activeTujuanForIndicator && (
        <IndicatorDialog
          open={indicatorDialogOpen}
          onOpenChange={setIndicatorDialogOpen}
          tujuan={activeTujuanForIndicator}
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
        description={`Apakah Anda yakin ingin menghapus tujuan "${deletingTujuan?.name}" beserta seluruh indikatornya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
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
