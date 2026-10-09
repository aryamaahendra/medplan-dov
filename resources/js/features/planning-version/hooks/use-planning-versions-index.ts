import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import PlanningVersionController from '@/actions/App/Http/Controllers/Planning/PlanningVersionController';
import { useDataTable } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import type { PlanningVersion } from '@/types/planning-version';

import { getColumns } from '../components/planning-version-columns';

interface ConfirmConfig {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  variant?: 'default' | 'destructive';
}

export function usePlanningVersionsIndex() {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<PlanningVersion | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const { onSearch, onSort, onReset, onPageChange, onPerPageChange } =
    useDataTable({
      only: ['versions', 'filters'],
    });

  const closeConfirm = useCallback(() => {
    setConfirmConfig((prev) => ({ ...prev, open: false }));
  }, []);

  const onEdit = useCallback((version: PlanningVersion) => {
    setSelectedVersion(version);
    setDialogOpen(true);
  }, []);

  const openCreateDialog = useCallback(() => {
    setSelectedVersion(null);
    setDialogOpen(true);
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

  const handleDelete = useCallback(
    (version: PlanningVersion) => {
      setConfirmConfig({
        open: true,
        title: 'Hapus Versi',
        description: `Apakah Anda yakin ingin menghapus versi "${version.name}"? Semua snapshot data dalam versi ini akan ikut terhapus.`,
        confirmText: 'Hapus Versi',
        variant: 'destructive',
        onConfirm: () => {
          router.delete(
            PlanningVersionController.destroy.url({
              planning_version: version.id,
            }),
            {
              onSuccess: () => {
                toast.success('Versi berhasil dihapus');
                closeConfirm();
              },
            },
          );
        },
      });
    },
    [closeConfirm],
  );

  const columns = useMemo(
    () =>
      getColumns(
        onEdit,
        handleCreateRevision,
        handleSetCurrent,
        handleDelete,
        hasPermission,
      ),
    [
      onEdit,
      handleCreateRevision,
      handleSetCurrent,
      handleDelete,
      hasPermission,
    ],
  );

  return {
    hasPermission,
    dialogOpen,
    setDialogOpen,
    selectedVersion,
    confirmConfig,
    setConfirmConfig,
    closeConfirm,
    openCreateDialog,
    columns,
    dataTable: {
      onSearch,
      onSort,
      onReset,
      onPageChange,
      onPerPageChange,
    },
  };
}
