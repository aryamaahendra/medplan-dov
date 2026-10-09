import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { VersionDialog } from '@/features/planning-version/components/planning-version-dialog';
import { usePlanningVersionsIndex } from '@/features/planning-version/hooks/use-planning-versions-index';
import type { DataTableFilters } from '@/hooks/use-data-table';
import planningVersions from '@/routes/planning-versions';
import type { PlanningVersion } from '@/types/planning-version';

interface PaginatedVersions {
  data: PlanningVersion[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PlanningVersionsIndexProps {
  versions: PaginatedVersions;
  filters: DataTableFilters;
}

export default function PlanningVersionsIndex({
  versions,
  filters,
}: PlanningVersionsIndexProps) {
  const {
    hasPermission,
    dialogOpen,
    setDialogOpen,
    selectedVersion,
    confirmConfig,
    setConfirmConfig,
    openCreateDialog,
    columns,
    dataTable,
  } = usePlanningVersionsIndex();

  return (
    <>
      <Head title="Versi Perencanaan" />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Versi Perencanaan
            </h1>
            <p className="text-muted-foreground">
              Kelola siklus dan revisi perencanaan anggaran tahunan.
            </p>
          </div>
          {hasPermission('create planning-versions') && (
            <Button onClick={openCreateDialog}>
              <RiAddLine data-icon="inline-start" />
              Buat Versi Baru
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={versions.data}
          meta={versions}
          filters={filters}
          {...dataTable}
          searchPlaceholder="Cari nama versi atau tahun..."
        />

        <VersionDialog
          version={selectedVersion}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        <ConfirmDialog
          {...confirmConfig}
          onOpenChange={(open) =>
            setConfirmConfig((prev) => ({ ...prev, open }))
          }
          cancelText="Batal"
        />
      </div>
    </>
  );
}

PlanningVersionsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Versi Perencanaan',
      href: planningVersions.index.url(),
    },
  ],
};
