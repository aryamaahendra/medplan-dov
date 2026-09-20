import { Link } from '@inertiajs/react';
import {
  RiArrowLeftLine,
  RiEdit2Line,
  RiQuillPenLine,
  RiErrorWarningLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

import { NeedDirectorReviewDialog } from './need-director-review-dialog';
import { NeedStatusOverview } from './need-status-overview';

interface NeedSidebarProps {
  need: Need;
}

export function NeedSidebar({ need }: NeedSidebarProps) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={needRoutes.index.url()}>
            <RiArrowLeftLine />
            Kembali
          </Link>
        </Button>
        <Button variant={'outline'} asChild>
          <Link href={needRoutes.edit.url({ need: need.id })}>
            <RiEdit2Line />
            Edit Usulan
          </Link>
        </Button>
      </div>

      <Button
        className="relative w-full"
        onClick={() => setIsReviewDialogOpen(true)}
      >
        <RiQuillPenLine />
        Review Direktur
        {need.notes && (
          <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
            <RiErrorWarningLine />
          </span>
        )}
      </Button>

      <NeedStatusOverview need={need} />

      <NeedDirectorReviewDialog
        need={need}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
      />
    </div>
  );
}
