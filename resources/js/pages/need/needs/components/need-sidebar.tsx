import { Link } from '@inertiajs/react';
import { ArrowLeft, PencilLine, Signature } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import needRoutes from '@/routes/needs';
import type { Need } from '../columns';
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
            <ArrowLeft />
            Kembali
          </Link>
        </Button>
        <Button variant={'outline'} asChild>
          <Link href={needRoutes.edit.url({ need: need.id })}>
            <PencilLine />
            Edit Usulan
          </Link>
        </Button>
      </div>

      <Button className="w-full" onClick={() => setIsReviewDialogOpen(true)}>
        <Signature />
        Review Direktur
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
