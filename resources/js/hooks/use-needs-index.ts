import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import needExportActions from '@/actions/App/Http/Controllers/Need/NeedExportController';
import needGroupRoutes from '@/routes/need-groups';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

interface UseNeedsIndexProps {
  currentGroup: { id: number; name: string };
}

export function useNeedsIndex({ currentGroup }: UseNeedsIndexProps) {
  const [deletingNeed, setDeletingNeed] = useState<Need | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewingNeedId, setReviewingNeedId] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isDeletingGroupLoading, setIsDeletingGroupLoading] = useState(false);

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

  const handleConfirmDeleteGroup = () => {
    setIsDeletingGroupLoading(true);

    router.delete(
      needGroupRoutes.destroy.url({ need_group: currentGroup.id }),
      {
        onSuccess: () => {
          toast.success('Kelompok usulan berhasil dihapus.');
          router.visit(needGroupRoutes.index.url());
        },
        onFinish: () => setIsDeletingGroupLoading(false),
      },
    );
  };

  return {
    state: {
      deletingNeed,
      isDeleting,
      reviewingNeedId,
      showDashboard,
      isGroupDialogOpen,
      isDeletingGroup,
      isDeletingGroupLoading,
    },
    actions: {
      setDeletingNeed,
      setReviewingNeedId,
      setShowDashboard,
      setIsGroupDialogOpen,
      setIsDeletingGroup,
      onEdit,
      onCreate,
      onDelete,
      onReview,
      onExport,
      handleConfirmDelete,
      handleConfirmDeleteGroup,
    },
  };
}
