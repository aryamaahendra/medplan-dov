import { Head, router } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import PlanningVersionController from '@/actions/App/Http/Controllers/Planning/PlanningVersionController';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { getColumns } from '@/features/planning-version/components/planning-version-columns';
import { VersionDialog } from '@/features/planning-version/components/planning-version-dialog';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import { useResourceIndexController } from '@/hooks/use-resource-index-controller';
import type { PaginatedData } from '@/hooks/use-resource-index-controller';
import planningVersions from '@/routes/planning-versions';
import type { PlanningVersion } from '@/types/planning-version';

interface PlanningVersionsIndexProps {
  versions: PaginatedData<PlanningVersion>;
  filters: DataTableFilters;
}

interface ConfirmConfig {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  variant?: 'default' | 'destructive';
}

export default function PlanningVersionsIndex({
  versions,
  filters,
}: PlanningVersionsIndexProps) {
  const { hasPermission } = usePermission();

  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const closeConfirm = useCallback(() => {
    setConfirmConfig((prev) => ({ ...prev, open: false }));
  }, []);

  const handleCreateRevision = useCallback(
    (version: PlanningVersion) => {
      setConfirmConfig({
        open: true,
        title: 'Buat Revisi',
        description: `Apakah Anda yakin ingin membuat revisi dari "${version.name}"?`,
        confirmText: 'Buat Revisi',
        onConfirm: () => {
          router.post(
            PlanningVersionController.createRevision.url({
              planning_version: version.id,
            }),
            {},
            {
              onSuccess: () => {
                toast.success('Revisi berhasil dibuat');
                closeConfirm();
              },
            },
          );
        },
      });
    },
    [closeConfirm],
  );

  const handleSetCurrent = useCallback(
    (version: PlanningVersion) => {
      setConfirmConfig({
        open: true,
        title: 'Jadikan Versi Utama',
        description: `Jadikan "${version.name}" sebagai versi utama untuk periode ${version.year_start} - ${version.year_end}?`,
        confirmText: 'Jadikan Utama',
        onConfirm: () => {
          router.post(
            PlanningVersionController.setCurrent.url({
              planning_version: version.id,
            }),
            {},
            {
              onSuccess: () => {
                toast.success('Versi utama diperbarui');
                closeConfirm();
              },
            },
          );
        },
      });
    },
    [closeConfirm],
  );

  const controller = useResourceIndexController<PlanningVersion>({
    data: versions,
    filters,
    only: ['versions', 'filters'],
    resourceName: 'Versi perencanaan',
    deleteUrl: (version) =>
      PlanningVersionController.destroy.url({ planning_version: version.id }),
    getColumns: ({ onEdit, onDelete }) =>
      getColumns(
        onEdit,
        handleCreateRevision,
        handleSetCurrent,
        onDelete,
        hasPermission,
      ),
    searchPlaceholder: 'Cari nama versi atau tahun...',
  });

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
            <Button onClick={controller.dialog.openCreate}>
              <RiAddLine data-icon="inline-start" />
              Buat Versi Baru
            </Button>
          )}
        </div>

        <DataTable {...controller.tableProps} />

        <VersionDialog
          version={controller.dialog.editingItem}
          open={controller.dialog.isOpen}
          onOpenChange={controller.dialog.setIsOpen}
        />

        <ConfirmDialog
          open={controller.deleteDialog.isOpen}
          onOpenChange={controller.deleteDialog.setIsOpen}
          onConfirm={controller.deleteDialog.confirmDelete}
          title="Hapus Versi"
          description={`Apakah Anda yakin ingin menghapus versi "${controller.deleteDialog.deletingItem?.name}"? Semua snapshot data dalam versi ini akan ikut terhapus.`}
          confirmText="Hapus Versi"
          variant="destructive"
          loading={controller.deleteDialog.isDeleting}
        />

        <ConfirmDialog
          {...confirmConfig}
          onOpenChange={(open) =>
            setConfirmConfig((prev) => ({ ...prev, open }))
          }
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
