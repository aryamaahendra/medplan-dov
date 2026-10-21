import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import needGroups from '@/routes/need-groups';
import { unapprovedCandidates, unapprovedSource } from '@/routes/needs';

import {
  calculateSelectedBudget,
  sortCandidates,
  toggleSelectionAll,
  toggleSelectionOne,
} from './rollover-engine';
import type { CandidateNeed } from './rollover-engine';
import type {
  RolloverCandidatesController,
  UseRolloverCandidatesOptions,
} from './types';

export function useRolloverCandidates({
  targetGroupId,
  open,
  mode = 'multiple',
  initialSelectedIds = [],
  onSelectSource,
  onSelectIds,
  onOpenChange,
  targetNeedGroupName,
}: UseRolloverCandidatesOptions): RolloverCandidatesController {
  const [candidates, setCandidates] = useState<CandidateNeed[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const fetchCandidates = useCallback(async () => {
    if (!open) {
      return;
    }

    setLoading(true);

    try {
      const url = unapprovedCandidates.url({
        query: {
          target_need_group_id: targetGroupId ? targetGroupId : undefined,
          search: search.trim() ? search.trim() : undefined,
        },
      });

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal memuat usulan');
      }

      const json = await response.json();
      const rawCandidates: CandidateNeed[] = json.data || [];
      const sorted = sortCandidates(rawCandidates);

      setCandidates(sorted);
      setSelectedIds([]);
    } catch {
      toast.error('Gagal mengambil daftar usulan yang belum disetujui');
    } finally {
      setLoading(false);
    }
  }, [open, search, targetGroupId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      void fetchCandidates();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [open, fetchCandidates]);

  const handleToggleOne = useCallback((id: number) => {
    setSelectedIds((prev) => toggleSelectionOne(prev, id));
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => toggleSelectionAll(prev, candidates));
  }, [candidates]);

  const isSelected = useCallback(
    (id: number) => selectedSet.has(id),
    [selectedSet],
  );

  const selectedBudget = useMemo(
    () => calculateSelectedBudget(candidates, selectedIds),
    [candidates, selectedIds],
  );

  const isAllSelected = useMemo(
    () => candidates.length > 0 && selectedIds.length === candidates.length,
    [candidates.length, selectedIds.length],
  );

  const commitBatch = useCallback(
    async (needGroupId: number, needGroupName?: string) => {
      if (onSelectIds) {
        onSelectIds(selectedIds);
        onOpenChange?.(false);

        return;
      }

      if (!needGroupId || selectedIds.length === 0) {
        return;
      }

      setSubmitting(true);

      const targetName =
        needGroupName ?? targetNeedGroupName ?? 'kelompok tujuan';

      router.post(
        needGroups.rollover.url({ need_group: needGroupId }),
        { need_ids: selectedIds },
        {
          onSuccess: () => {
            toast.success(
              `${selectedIds.length} usulan berhasil ditarik ke kelompok ${targetName}.`,
            );
            onOpenChange?.(false);
          },
          onError: () => {
            toast.error('Gagal menarik usulan ke kelompok ini.');
          },
          onFinish: () => {
            setSubmitting(false);
          },
        },
      );
    },
    [onOpenChange, onSelectIds, selectedIds, targetNeedGroupName],
  );

  const pickSingle = useCallback(
    async (candidateId: number) => {
      setSelectingId(candidateId);

      try {
        const url = unapprovedSource.url({ need: candidateId });
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil rincian usulan');
        }

        const json = await response.json();

        onSelectSource?.(json.data);
        toast.success('Data usulan lama berhasil dimuat ke formulir.');
        onOpenChange?.(false);
      } catch {
        toast.error('Terjadi kesalahan saat memuat rincian usulan');
      } finally {
        setSelectingId(null);
      }
    },
    [onOpenChange, onSelectSource],
  );

  return {
    candidates,
    selectedIds,
    selectedBudget,
    loading,
    submitting,
    selectingId,
    search,
    isAllSelected,
    mode,
    setSearch,
    fetchCandidates,
    toggleSelectOne: handleToggleOne,
    toggleSelectAll: handleToggleAll,
    isSelected,
    commitBatch,
    pickSingle,
  };
}
