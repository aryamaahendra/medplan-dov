import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import PlanningVersionController from '@/actions/App/Http/Controllers/PlanningVersionController';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import planningVersions from '@/routes/planning-versions';
import type { PlanningVersion } from '@/types/planning-version';

import { getColumns } from './columns';
import { VersionDialog } from './version-dialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<PlanningVersion | null>(null);

  const { onSearch, onSort, onReset, onPageChange, onPerPageChange } =
    useDataTable({
      only: ['versions', 'filters'],
    });

  const onEdit = (version: PlanningVersion) => {
    setSelectedVersion(version);
    setDialogOpen(true);
  };

  const handleCreateRevision = (version: PlanningVersion) => {
    if (
      confirm(`Apakah Anda yakin ingin membuat revisi dari "${version.name}"?`)
    ) {
      router.post(
        PlanningVersionController.createRevision.url({
          planning_version: version.id,
        }),
        {},
        {
          onSuccess: () => toast.success('Revisi berhasil dibuat'),
        },
      );
    }
  };

  const handleSetCurrent = (version: PlanningVersion) => {
    if (
      confirm(
        `Jadikan "${version.name}" sebagai versi utama untuk tahun ${version.fiscal_year}?`,
      )
    ) {
      router.post(
        PlanningVersionController.setCurrent.url({
          planning_version: version.id,
        }),
        {},
        {
          onSuccess: () => toast.success('Versi utama diperbarui'),
        },
      );
    }
  };

  const handleDelete = (version: PlanningVersion) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus versi "${version.name}"? Semua snapshot data dalam versi ini akan ikut terhapus.`,
      )
    ) {
      router.delete(
        PlanningVersionController.destroy.url({
          planning_version: version.id,
        }),
        {
          onSuccess: () => toast.success('Versi berhasil dihapus'),
        },
      );
    }
  };

  const columns = useMemo(
    () =>
      getColumns(onEdit, handleCreateRevision, handleSetCurrent, handleDelete),
    [],
  );

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
          <Button
            onClick={() => {
              setSelectedVersion(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Buat Versi Baru
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={versions.data}
          meta={versions}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari nama versi atau tahun..."
        />

        <VersionDialog
          version={selectedVersion}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
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
