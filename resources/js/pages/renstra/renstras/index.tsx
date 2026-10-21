import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { getColumns } from '@/features/renstra/components/renstra-columns';
import { RenstraDialog } from '@/features/renstra/components/renstra-dialog';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import { useResourceIndexController } from '@/hooks/use-resource-index-controller';
import type { PaginatedData } from '@/hooks/use-resource-index-controller';
import renstraRoutes from '@/routes/renstras';
import type { Renstra } from '@/types';

interface RenstrasIndexProps {
  renstras: PaginatedData<Renstra>;
  filters: DataTableFilters;
}

export default function RenstrasIndex({
  renstras,
  filters,
}: RenstrasIndexProps) {
  const { hasPermission } = usePermission();

  const controller = useResourceIndexController<Renstra>({
    data: renstras,
    filters,
    only: ['renstras', 'filters'],
    resourceName: 'Renstra',
    deleteUrl: (renstra) => renstraRoutes.destroy.url({ renstra: renstra.id }),
    getColumns: ({ onEdit, onDelete }) =>
      getColumns(onEdit, onDelete, hasPermission),
    searchPlaceholder: 'Cari renstra...',
  });

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
            <Button onClick={controller.dialog.openCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Renstra
            </Button>
          )}
        </div>

        <DataTable {...controller.tableProps} />
      </div>

      <RenstraDialog
        key={controller.dialog.editingItem?.id ?? 'new'}
        open={controller.dialog.isOpen}
        onOpenChange={controller.dialog.setIsOpen}
        renstra={controller.dialog.editingItem}
      />

      <ConfirmDialog
        open={controller.deleteDialog.isOpen}
        onOpenChange={controller.deleteDialog.setIsOpen}
        onConfirm={controller.deleteDialog.confirmDelete}
        title="Hapus Renstra"
        description={`Apakah Anda yakin ingin menghapus "${controller.deleteDialog.deletingItem?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={controller.deleteDialog.isDeleting}
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
