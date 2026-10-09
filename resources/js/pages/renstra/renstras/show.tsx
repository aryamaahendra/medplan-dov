import { Head } from '@inertiajs/react';

import { Separator } from '@/components/ui/separator';
import { RenstraGoalsSection } from '@/features/renstra/components/renstra-goals-section';
import { RenstraInfo } from '@/features/renstra/components/renstra-info';
import { RenstraShowDialogs } from '@/features/renstra/components/renstra-show-dialogs';
import { useRenstraShow } from '@/features/renstra/hooks/use-renstra-show';
import renstraRoutes from '@/routes/renstras';
import type { Renstra } from '@/types';


interface RenstraShowProps {
  renstra: Renstra;
}

export default function RenstraShow({ renstra }: RenstraShowProps) {
  const {
    view,
    setView,
    onCreateTujuan,
    onEditTujuan,
    onCreateSasaran,
    onEditSasaran,
    onCreateIndicator,
    onEditIndicator,
    onCreateIndicatorForSasaran,
    onEditIndicatorForSasaran,
    ...dialogProps
  } = useRenstraShow();

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

        <RenstraGoalsSection
          renstra={renstra}
          view={view}
          onViewChange={setView}
          onCreateTujuan={onCreateTujuan}
          onEditTujuan={onEditTujuan}
          onDeleteTujuan={dialogProps.setDeletingTujuan}
          onCreateSasaran={onCreateSasaran}
          onEditSasaran={onEditSasaran}
          onDeleteSasaran={dialogProps.setDeletingSasaran}
          onCreateIndicator={onCreateIndicator}
          onEditIndicator={onEditIndicator}
          onCreateIndicatorForSasaran={onCreateIndicatorForSasaran}
          onEditIndicatorForSasaran={onEditIndicatorForSasaran}
        />
      </div>

      <RenstraShowDialogs renstra={renstra} {...dialogProps} />
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
