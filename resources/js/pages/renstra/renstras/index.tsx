import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { RenstraDialog } from '@/features/renstra/components/renstra-dialog';
import { useRenstrasIndex } from '@/features/renstra/hooks/use-renstras-index';
import type { DataTableFilters } from '@/hooks/use-data-table';
import renstraRoutes from '@/routes/renstras';
import type { Renstra } from '@/types';

interface PaginatedRenstras {
  data: Renstra[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface RenstrasIndexProps {
  renstras: PaginatedRenstras;
  filters: DataTableFilters;
}

export default function RenstrasIndex({
  renstras,
  filters,
}: RenstrasIndexProps) {
  const {
    hasPermission,
    dialogOpen,
    setDialogOpen,
    editingRenstra,
    deletingRenstra,
    setDeletingRenstra,
    isDeleting,
    onCreate,
    handleConfirmDelete,
    columns,
    dataTable,
  } = useRenstrasIndex();

  return (
    <>
      <Head title="Manajemen Renstra" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Rencana Strategis (Renstra)
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola data rencana strategis instansi. Hanya satu renstra yang
              dapat aktif di satu waktu.
            </p>
          </div>
          {hasPermission('create renstras') && (
            <Button onClick={onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Renstra
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={renstras.data}
          meta={renstras}
          filters={filters}
          {...dataTable}
          searchPlaceholder="Cari renstra..."
        />
      </div>

      <RenstraDialog
        key={editingRenstra?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        renstra={editingRenstra}
      />

      <ConfirmDialog
        open={!!deletingRenstra}
        onOpenChange={(open) => !open && setDeletingRenstra(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Renstra"
        description={`Apakah Anda yakin ingin menghapus "${deletingRenstra?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

RenstrasIndex.layout = {
  breadcrumbs: [
    {
      title: 'Manajemen Renstra',
      href: renstraRoutes.index.url(),
    },
  ],
};
