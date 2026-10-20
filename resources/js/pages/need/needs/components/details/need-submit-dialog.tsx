import { RiAlertLine, RiSendPlaneLine } from '@remixicon/react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Need } from '@/types';

interface NeedSubmitDialogProps {
  need: Need | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function NeedSubmitDialog({
  need,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: NeedSubmitDialogProps) {
  if (!need) {
    return null;
  }

  const isRevision = need.status === 'revision';
  const title = isRevision
    ? 'Ajukan Kembali Usulan Kebutuhan'
    : 'Ajukan Usulan Kebutuhan';
  const confirmText = isRevision ? 'Ya, Ajukan Kembali' : 'Ya, Ajukan Usulan';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-foreground">
              <RiSendPlaneLine className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
            {isRevision ? (
              <>
                Apakah Anda yakin ingin mengajukan kembali usulan{' '}
                <strong className="text-foreground">"{need.title}"</strong>?
                Pastikan seluruh catatan revisi dari Direktur telah diperbaiki.
                Setelah diajukan kembali, usulan akan terkunci untuk proses
                evaluasi dan review eksekutif.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin mengajukan usulan{' '}
                <strong className="text-foreground">"{need.title}"</strong>?
                Setelah diajukan, usulan akan otomatis terkunci (read-only) dan
                masuk ke antrean evaluasi dan review eksekutif.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isRevision && need.notes && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground">
            <div className="flex items-start gap-2">
              <RiAlertLine className="mt-0.5 size-4 shrink-0 text-warning" />
              <div>
                <p className="font-semibold text-foreground">
                  Catatan Revisi Direktur:
                </p>
                <p className="mt-1 line-clamp-3 text-muted-foreground">
                  {need.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="gap-1.5"
          >
            <RiSendPlaneLine data-icon="inline-start" />
            <span>{loading ? 'Memproses...' : confirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
