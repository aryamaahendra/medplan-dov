import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { OrganizationalUnitDialog } from '@/features/organizational-unit/components/organizational-unit-dialog';
import { useOrganizationalUnitsIndex } from '@/features/organizational-unit/hooks/use-organizational-units-index';
import type { OrganizationalUnitsIndexProps } from '@/features/organizational-unit/hooks/use-organizational-units-index';
import organizationalUnitRoutes from '@/routes/organizational-units';

export default function OrganizationalUnitsIndex(
  props: OrganizationalUnitsIndexProps,
) {
  const { state, handlers, table, hasPermission, units, allUnits, filters } =
    useOrganizationalUnitsIndex(props);

  return (
    <>
      <Head title="Unit Organisasi" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Unit Kerja
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola struktur organisasi, bidang, dan subbagian.
            </p>
          </div>
          {hasPermission('create organizational-units') && (
            <Button onClick={handlers.onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Unit
            </Button>
          )}
        </div>

        <DataTable
          columns={table.columns}
          data={units.data}
          meta={units}
          filters={filters}
          onSearch={table.onSearch}
          onSort={table.onSort}
          onPageChange={table.onPageChange}
          onPerPageChange={table.onPerPageChange}
          onReset={table.onReset}
          searchPlaceholder="Cari berdasarkan nama atau kode..."
        />
      </div>

      <OrganizationalUnitDialog
        key={state.editingUnit?.id ?? 'new'}
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
    </>
  );
}

OrganizationalUnitsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Unit Kerja',
      href: organizationalUnitRoutes.index.url(),
    },
  ],
};
