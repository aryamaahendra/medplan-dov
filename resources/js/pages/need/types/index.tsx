import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { NeedTypeDialog } from '@/features/need-type/components/need-type-dialog';
import { useNeedTypesIndex } from '@/features/need-type/hooks/use-need-types-index';
import type { PaginatedNeedTypes } from '@/features/need-type/types/need-type.types';
import type { DataTableFilters } from '@/hooks/use-data-table';
import needTypeRoutes from '@/routes/need-types';

interface NeedTypesIndexProps {
  needTypes: PaginatedNeedTypes;
  filters: DataTableFilters;
}

export default function NeedTypesIndex({
  needTypes,
  filters,
}: NeedTypesIndexProps) {
  const { state, actions, hasPermission, dataTable } = useNeedTypesIndex();

  return (
    <>
      <Head title="Kategori Kebutuhan" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Kategori Kebutuhan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola master data kategori kebutuhan.
            </p>
          </div>
          {hasPermission('create need-types') && (
            <Button onClick={actions.onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Jenis
            </Button>
          )}
        </div>

        <DataTable
          columns={state.columns}
          data={needTypes.data}
          meta={needTypes}
          filters={filters}
          onSearch={dataTable.onSearch}
          onSort={dataTable.onSort}
          onPageChange={dataTable.onPageChange}
          onPerPageChange={dataTable.onPerPageChange}
          onReset={dataTable.onReset}
          searchPlaceholder="Cari berdasarkan nama atau kode..."
        />
      </div>

      <NeedTypeDialog
        key={state.editingNeedType?.id ?? 'new'}
        open={state.dialogOpen}
        onOpenChange={actions.setDialogOpen}
        needType={state.editingNeedType}
      />

      <ConfirmDialog
        open={!!state.deletingNeedType}
        onOpenChange={(open) => !open && actions.setDeletingNeedType(null)}
        onConfirm={actions.handleConfirmDelete}
        title="Hapus Kategori Kebutuhan"
        description={`Apakah Anda yakin ingin menghapus "${state.deletingNeedType?.name}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={state.isDeleting}
      />
    </>
  );
}

NeedTypesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Kategori Kebutuhan',
      href: needTypeRoutes.index.url(),
    },
  ],
};
