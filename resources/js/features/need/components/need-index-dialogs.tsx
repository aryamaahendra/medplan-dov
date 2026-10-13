import { ConfirmDialog } from '@/components/confirm-dialog';
import { NeedDirectorReviewDialog } from '@/pages/need/needs/components/need-director-review-dialog';
import { NeedLockDialog } from '@/pages/need/needs/components/need-lock-dialog';
import type { Need } from '@/types';

interface NeedIndexDialogsProps {
  needs: Need[];
  deletingNeed: Need | null;
  onDeletingNeedChange: (need: Need | null) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  reviewingNeedId: number | null;
  onReviewingNeedIdChange: (id: number | null) => void;
  lockingNeed: Need | null;
  lockDialogMode: 'lock' | 'unlock';
  isLockDialogOpen: boolean;
  onLockDialogOpenChange: (open: boolean) => void;
}

export function NeedIndexDialogs({
  needs,
  deletingNeed,
  onDeletingNeedChange,
  onConfirmDelete,
  isDeleting,
  reviewingNeedId,
  onReviewingNeedIdChange,
  lockingNeed,
  lockDialogMode,
  isLockDialogOpen,
  onLockDialogOpenChange,
}: NeedIndexDialogsProps) {
  const reviewingNeed = reviewingNeedId
    ? needs.find((n) => n.id === reviewingNeedId)
    : null;

  return (
    <>
      <ConfirmDialog
        open={!!deletingNeed}
        onOpenChange={(open) => !open && onDeletingNeedChange(null)}
        onConfirm={onConfirmDelete}
        title="Hapus Usulan Kebutuhan"
        description={`Apakah Anda yakin ingin menghapus "${deletingNeed?.title}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />

      {reviewingNeed && (
        <NeedDirectorReviewDialog
          key={reviewingNeed.id}
          need={reviewingNeed}
          open={!!reviewingNeedId}
          onOpenChange={(open) => !open && onReviewingNeedIdChange(null)}
        />
      )}

      <NeedLockDialog
        need={lockingNeed}
        mode={lockDialogMode}
        open={isLockDialogOpen}
        onOpenChange={onLockDialogOpenChange}
      />
    </>
  );
}
