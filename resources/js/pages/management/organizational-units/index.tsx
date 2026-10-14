import { Head } from '@inertiajs/react';
import { RiAddLine, RiAlertLine, RiDeleteBinLine } from '@remixicon/react';

import { DataTable } from '@/components/data-table/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OrganizationalUnitModals } from '@/features/organizational-unit/components/organizational-unit-modals';
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
          {!state.isTrash && hasPermission('create organizational-units') && (
            <Button onClick={handlers.onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Unit
            </Button>
          )}
        </div>

        {state.isTrash && (
          <Alert
            variant="default"
            className="border-warning/40 bg-warning/10 text-warning-foreground dark:border-warning/30 dark:bg-warning/20"
          >
            <RiAlertLine className="text-warning" />
            <AlertTitle className="font-semibold text-warning-foreground">
              Mode Tempat Sampah
            </AlertTitle>
            <AlertDescription className="text-sm text-warning-foreground/90">
              Anda sedang melihat unit organisasi yang telah dihapus (soft
              delete). Data di sini tidak aktif dalam operasional sistem.
            </AlertDescription>
          </Alert>
        )}

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
          toolbarChildren={
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 px-3 py-1.5 shadow-xs">
              <RiDeleteBinLine className="size-4 text-muted-foreground" />
              <Label
                htmlFor="trash-mode-switch"
                className="cursor-pointer text-xs font-medium text-foreground select-none"
              >
                Lihat Tempat Sampah
              </Label>
              <Switch
                id="trash-mode-switch"
                size="sm"
                checked={state.isTrash}
                onCheckedChange={handlers.onToggleTrash}
                aria-label="Tampilkan unit organisasi yang dihapus"
              />
            </div>
          }
        />
      </div>

      <OrganizationalUnitModals
        state={state}
        handlers={handlers}
        allUnits={allUnits}
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
