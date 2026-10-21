import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import PlanningVersionController from '@/actions/App/Http/Controllers/Planning/PlanningVersionController';
import type { PlanningVersion } from '@/types/planning-version';

export interface PlanningVersionConfirmConfig {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  variant?: 'default' | 'destructive';
}

export function usePlanningVersionActions() {
  const [confirmConfig, setConfirmConfig] =
    useState<PlanningVersionConfirmConfig>({
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

  return {
    confirmConfig,
    setConfirmConfig,
    handleCreateRevision,
    handleSetCurrent,
  };
}
