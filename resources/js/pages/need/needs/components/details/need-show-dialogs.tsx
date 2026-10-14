import type { Need } from '@/types';

import { NeedDirectorReviewDialog } from '../need-director-review-dialog';
import { NeedLockDialog } from '../need-lock-dialog';
import type { useNeedShow } from './use-need-show';

interface NeedShowDialogsProps {
  need: Need;
  showState: ReturnType<typeof useNeedShow>;
}

export function NeedShowDialogs({ need, showState }: NeedShowDialogsProps) {
  return (
    <>
      <NeedDirectorReviewDialog
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
    </>
  );
}
