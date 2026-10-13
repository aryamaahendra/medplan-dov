import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import needExportActions from '@/actions/App/Http/Controllers/Need/NeedExportController';
import type { UseDataTableReturn } from '@/hooks/use-data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { useViewMode } from '@/hooks/use-view-mode';
import type { NeedsIndexFilters } from '@/pages/need/needs';
import needRoutes from '@/routes/needs';
import type {
  AttentionCounts,
  Need,
  PaginatedNeeds,
  StageCounts,
} from '@/types';
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
  stageCounts?: StageCounts;
  attentionCounts?: AttentionCounts;
  filters?: NeedsIndexFilters;
}

export interface UseNeedsIndexState {
  viewMode: 'table' | 'grid' | 'list' | 'loading';
  currentStageTab: StageTabKey;
  attentionFilter: AttentionFilterKey | null;
  deletingNeed: Need | null;
  isDeleting: boolean;
  reviewingNeedId: number | null;
  lockingNeed: Need | null;
  lockDialogMode: 'lock' | 'unlock';
  isLockDialogOpen: boolean;
  stageCounts: StageCounts;
  processedNeeds: Need[];
  columns: ColumnDef<Need, unknown>[];
}

export interface UseNeedsIndexActions {
  setViewMode: (mode: 'table' | 'grid' | 'list') => void;
  setCurrentStageTab: (stage: StageTabKey) => void;
  setAttentionFilter: (key: AttentionFilterKey | null) => void;
  setDeletingNeed: (need: Need | null) => void;
  setReviewingNeedId: (id: number | null) => void;
  setIsLockDialogOpen: (open: boolean) => void;
  onEdit: (need: Need) => void;
  onCreate: () => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
  onLock: (need: Need) => void;
  onUnlock: (need: Need) => void;
  onExport: () => void;
  handleConfirmDelete: () => void;
}

export interface UseNeedsIndexReturn {
  state: UseNeedsIndexState;
  actions: UseNeedsIndexActions;
  dataTable: UseDataTableReturn;
}
export function useNeedsIndex({
  needs,
  currentGroup,
  stageCounts: serverStageCounts,
  filters,
}: UseNeedsIndexProps): UseNeedsIndexReturn {
  const [viewMode, setViewMode] = useViewMode();

  const [deletingNeed, setDeletingNeed] = useState<Need | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewingNeedId, setReviewingNeedId] = useState<number | null>(null);
  const [lockingNeed, setLockingNeed] = useState<Need | null>(null);
  const [lockDialogMode, setLockDialogMode] = useState<'lock' | 'unlock'>(
    'lock',
  );
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  const dataTable = useDataTable({
    only: ['needs', 'filters', 'stageCounts', 'attentionCounts'],
  });

  const currentStageTab: StageTabKey =
    ((Array.isArray(filters?.stage)
      ? filters.stage[0]
      : filters?.stage) as StageTabKey) || 'all';

  const setCurrentStageTab = useCallback(
    (stage: StageTabKey) => {
      dataTable.mergeParams({
        stage: stage === 'all' ? undefined : stage,
        page: 1,
      });
    },
    [dataTable],
  );

  const attentionFilter: AttentionFilterKey | null =
    ((Array.isArray(filters?.attention)
      ? filters.attention[0]
      : filters?.attention) as AttentionFilterKey) || null;

  const setAttentionFilter = useCallback(
    (key: AttentionFilterKey | null) => {
      dataTable.mergeParams({
        attention: key || undefined,
        page: 1,
      });
    },
    [dataTable],
  );
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
      query: Object.fromEntries(params) as unknown as Record<string, string>,
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
      getNeedColumns(onEdit, onDelete, onReview, undefined, onLock, onUnlock),
    [],
  );

  const stageCounts = useMemo(() => {
    if (serverStageCounts) {
      return serverStageCounts;
    }

    return {
      all: needs.total ?? needs.data.length,
      draft: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      locked: 0,
    };
  }, [serverStageCounts, needs.total, needs.data.length]);

  const processedNeeds = needs.data;

  return {
    state: {
      viewMode,
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
