import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

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
import type { Indicator, Renstra } from '@/types';

import { IndicatorDialog } from '../indicators/components/indicator-dialog';
import { IndicatorTable } from './components/indicator-table';

interface RenstraShowProps {
  renstra: Renstra;
}

export default function RenstraShow({ renstra }: RenstraShowProps) {
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(
    null,
  );

  const onCreateIndicator = () => {
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onEditIndicator = (indicator: Indicator) => {
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
              <h2 className="text-xl font-semibold">Indikator Kinerja</h2>
              <p className="text-sm text-muted-foreground">
                Daftar indikator dan target tahunan.
              </p>
            </div>
            <Button onClick={onCreateIndicator}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Indikator
            </Button>
          </div>

          <IndicatorTable
            indicators={renstra.indicators || []}
            onEdit={onEditIndicator}
            yearStart={renstra.year_start}
            yearEnd={renstra.year_end}
          />
        </div>
      </div>

      <IndicatorDialog
        open={indicatorDialogOpen}
        onOpenChange={setIndicatorDialogOpen}
        renstra={renstra}
        indicator={editingIndicator}
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
