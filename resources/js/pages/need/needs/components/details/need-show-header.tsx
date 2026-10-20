import { Link } from '@inertiajs/react';
import {
  RiEdit2Line,
  RiFileDownloadLine,
  RiLockLine,
  RiLockUnlockLine,
  RiQuillPenLine,
  RiSendPlaneLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import needRoutes from '@/routes/needs';
import type { Need } from '@/types';

import { ExportPdfDialog } from '../export-pdf-dialog';
import type { useNeedShow } from './use-need-show';

interface NeedShowHeaderProps {
  need: Need;
  users: { id: number; name: string; nip: string | null }[];
  showState: ReturnType<typeof useNeedShow>;
}

export function NeedShowHeader({
  need,
  users,
  showState,
}: NeedShowHeaderProps) {
  const {
    isLocked,
    canManageLock,
    canReviewDirector,
    canSubmit,
    setIsReviewDialogOpen,
    setIsLockDialogOpen,
    setIsSubmitDialogOpen,
    setLockModalMode,
  } = showState;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Kelompok Usulan {need.year}</span>
            {need.organizational_unit?.name && (
              <>
                <span>/</span>
                <span>{need.organizational_unit.name}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {need.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canReviewDirector && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReviewDialogOpen(true)}
            className="gap-1.5"
          >
            <RiQuillPenLine className="h-4 w-4" />
            <span>Review Direktur</span>
          </Button>
        )}

        {canManageLock && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLockModalMode(isLocked ? 'unlock' : 'lock');
              setIsLockDialogOpen(true);
            }}
            className="gap-1.5"
          >
            {isLocked ? (
              <>
                <RiLockUnlockLine className="h-4 w-4" />
                <span>Buka Kunci</span>
              </>
            ) : (
              <>
                <RiLockLine className="h-4 w-4" />
                <span>Kunci Usulan</span>
              </>
            )}
          </Button>
        )}

        <ExportPdfDialog
          needId={need.id}
          users={users}
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5">
              <RiFileDownloadLine className="h-4 w-4" />
              <span>Unduh KAK</span>
            </Button>
          }
        />

        {need.can?.update && !isLocked && (
          <Button
            size="sm"
            variant={canSubmit ? 'outline' : 'default'}
            nativeButton={false}
            render={
              <Link href={needRoutes.edit.url({ need: need.id })}>
                <RiEdit2Line data-icon="inline-start" />
                <span>Edit Usulan</span>
              </Link>
            }
          />
        )}

        {canSubmit && (
          <Button size="sm" onClick={() => setIsSubmitDialogOpen(true)}>
            <RiSendPlaneLine data-icon="inline-start" />
            <span>
              {need.status === 'revision' ? 'Ajukan Kembali' : 'Ajukan Usulan'}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
