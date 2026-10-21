import { DirectorReviewDialog } from '@/features/need/director-review';
import type { Need } from '@/types';

import { NeedLockDialog } from '../need-lock-dialog';
import { NeedSubmitDialog } from './need-submit-dialog';
import type { useNeedShow } from './use-need-show';

interface NeedShowDialogsProps {
  need: Need;
  showState: ReturnType<typeof useNeedShow>;
}

export function NeedShowDialogs({ need, showState }: NeedShowDialogsProps) {
  return (
    <>
      <DirectorReviewDialog
        need={need}
        open={showState.isReviewDialogOpen}
        onOpenChange={showState.setIsReviewDialogOpen}
      />

      <NeedLockDialog
        need={need}
        open={showState.isLockDialogOpen}
        onOpenChange={showState.setIsLockDialogOpen}
        mode={showState.lockModalMode}
      />

      <NeedSubmitDialog
        need={need}
        open={showState.isSubmitDialogOpen}
        onOpenChange={showState.setIsSubmitDialogOpen}
        onConfirm={showState.handleSubmitNeed}
        loading={showState.isSubmitting}
      />
    </>
  );
}
