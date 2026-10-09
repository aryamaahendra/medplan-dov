import { Link } from '@inertiajs/react';
import {
  RiArrowLeftLine,
  RiEdit2Line,
  RiQuillPenLine,
  RiErrorWarningLine,
  RiLockLine,
  RiLockUnlockLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

import { NeedDirectorReviewDialog } from './need-director-review-dialog';
import { NeedLockDialog } from './need-lock-dialog';
import { NeedStatusOverview } from './need-status-overview';

interface NeedSidebarProps {
  need: Need;
}

export function NeedSidebar({ need }: NeedSidebarProps) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [lockModalMode, setLockModalMode] = useState<'lock' | 'unlock'>('lock');
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          render={
            <Link
              href={needRoutes.index.url({
                query: { need_group_id: need.need_group_id },
              })}
            >
              <RiArrowLeftLine />
              Kembali
            </Link>
          }
        />
        <Button
          variant="outline"
          render={
            <Link href={needRoutes.edit.url({ need: need.id })}>
              <RiEdit2Line />
              Edit Usulan
            </Link>
          }
        />
      </div>

      {need.can?.lock && !need.is_locked && (
        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            setLockModalMode('lock');
            setIsLockDialogOpen(true);
          }}
        >
          <RiLockLine data-icon="inline-start" />
          Kunci Usulan
        </Button>
      )}
      {need.can?.unlock && (need.is_locked || !!need.unlocked_until) && (
        <Button
          variant="outline"
          className="w-full text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => {
            setLockModalMode('unlock');
            setIsLockDialogOpen(true);
          }}
        >
          <RiLockUnlockLine data-icon="inline-start" />
          Buka Kunci / Beri Perpanjangan
        </Button>
      )}

      <Button
        className="relative w-full"
        onClick={() => setIsReviewDialogOpen(true)}
      >
        <RiQuillPenLine data-icon="inline-start" />
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

      <NeedLockDialog
        need={need}
        mode={lockModalMode}
        open={isLockDialogOpen}
        onOpenChange={setIsLockDialogOpen}
      />
    </div>
  );
}
