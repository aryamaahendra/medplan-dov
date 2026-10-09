import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import needExportActions from '@/actions/App/Http/Controllers/Need/NeedExportController';
import { useDataTable } from '@/hooks/use-data-table';
import { useViewMode } from '@/hooks/use-view-mode';
import { getNeedWorkflowStage } from '@/lib/need-workflow';
import needRoutes from '@/routes/needs';
import type { Need, PaginatedNeeds } from '@/types';
import { getNeedColumns } from '../components/need-columns';

export type StageTabKey =
  'all' | 'draft' | 'under_review' | 'approved' | 'rejected' | 'locked';

export type AttentionFilterKey =
  | 'low_checklist'
  | 'revision_closing'
  | 'submission_closing'
  | 'has_notes'
  | 'priority_only';

export interface UseNeedsIndexProps {
  needs: PaginatedNeeds;
  currentGroup: { id: number; name: string; year?: number };
}

export function useNeedsIndex({ needs, currentGroup }: UseNeedsIndexProps) {
  const [viewMode, setViewMode] = useViewMode();
  const [selectedDrawerNeed, setSelectedDrawerNeed] = useState<Need | null>(
    null,
  );
  const [currentStageTab, setCurrentStageTab] = useState<StageTabKey>('all');
  const [attentionFilter, setAttentionFilter] =
    useState<AttentionFilterKey | null>(null);

  const [deletingNeed, setDeletingNeed] = useState<Need | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewingNeedId, setReviewingNeedId] = useState<number | null>(null);
  const [lockingNeed, setLockingNeed] = useState<Need | null>(null);
  const [lockDialogMode, setLockDialogMode] = useState<'lock' | 'unlock'>(
    'lock',
  );
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  const dataTable = useDataTable({ only: ['needs', 'filters'] });

  const onEdit = (need: Need) => {
    router.visit(needRoutes.edit.url({ need: need.id }));
  };

  const onCreate = () => {
    router.visit(
      needRoutes.create.url({ query: { need_group_id: currentGroup.id } }),
    );
  };

  const onDelete = (need: Need) => {
    setDeletingNeed(need);
  };

  const onReview = (need: Need) => {
    setReviewingNeedId(need.id);
  };

  const onLock = (need: Need) => {
    setLockingNeed(need);
    setLockDialogMode('lock');
    setIsLockDialogOpen(true);
  };

  const onUnlock = (need: Need) => {
    setLockingNeed(need);
    setLockDialogMode('unlock');
    setIsLockDialogOpen(true);
  };

  const onExport = () => {
    const params = new URLSearchParams(window.location.search);

    if (!params.has('need_group_id')) {
      params.set('need_group_id', currentGroup.id.toString());
    }

    window.location.href = needExportActions.url({
      query: Object.fromEntries(params) as any,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingNeed) {
      return;
    }

    setIsDeleting(true);

    router.delete(needRoutes.destroy.url({ need: deletingNeed.id }), {
      onSuccess: () => {
        toast.success('Usulan kebutuhan berhasil dihapus.');
        setDeletingNeed(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const columns = useMemo(
    () =>
      getNeedColumns(
        onEdit,
        onDelete,
        onReview,
        (need) => setSelectedDrawerNeed(need),
        onLock,
        onUnlock,
      ),
    [],
  );

  const stageCounts = useMemo(() => {
    const counts = {
      all: needs.data.length,
      draft: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      locked: 0,
    };

    for (const need of needs.data) {
      const stage = getNeedWorkflowStage(need);
      counts[stage] = (counts[stage] || 0) + 1;

      if (need.is_locked) {
        counts.locked += 1;
      }
    }

    return counts;
  }, [needs.data]);

  const processedNeeds = useMemo(() => {
    const now = new Date().getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    return needs.data.filter((need) => {
      if (currentStageTab !== 'all') {
        if (currentStageTab === 'locked') {
          if (!need.is_locked) {
            return false;
          }
        } else {
          const stage = getNeedWorkflowStage(need);

          if (stage !== currentStageTab) {
            return false;
          }
        }
      }

      if (attentionFilter) {
        switch (attentionFilter) {
          case 'low_checklist': {
            const pct = Number(need.checklist_percentage || 0);

            if (pct >= 85 || pct === 0) {
              return false;
            }

            break;
          }
          case 'revision_closing': {
            if (!need.unlocked_until) {
              return false;
            }

            const revDiff = new Date(need.unlocked_until).getTime() - now;

            if (revDiff <= 0 || revDiff > threeDaysMs) {
              return false;
            }

            break;
          }
          case 'submission_closing': {
            if (!need.group_submission_end_at) {
              return false;
            }

            const subDiff =
              new Date(need.group_submission_end_at).getTime() - now;

            if (subDiff <= 0 || subDiff > threeDaysMs) {
              return false;
            }

            break;
          }
          case 'has_notes':
            if (!need.notes) {
              return false;
            }

            break;
          case 'priority_only':
            if (!need.is_priority) {
              return false;
            }

            break;
        }
      }

      return true;
    });
  }, [needs.data, currentStageTab, attentionFilter]);

  return {
    state: {
      viewMode,
      selectedDrawerNeed,
      currentStageTab,
      attentionFilter,
      deletingNeed,
      isDeleting,
      reviewingNeedId,
      lockingNeed,
      lockDialogMode,
      isLockDialogOpen,
      stageCounts,
      processedNeeds,
      columns,
    },
    actions: {
      setViewMode,
      setSelectedDrawerNeed,
      setCurrentStageTab,
      setAttentionFilter,
      setDeletingNeed,
      setReviewingNeedId,
      setIsLockDialogOpen,
      onEdit,
      onCreate,
      onDelete,
      onReview,
      onLock,
      onUnlock,
      onExport,
      handleConfirmDelete,
    },
    dataTable,
  };
}
