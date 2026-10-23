import { RiAlertLine, RiHistoryLine } from '@remixicon/react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Need } from '@/types';
import { NeedLockBanner } from '../need-lock-banner';

interface NeedShowBannersProps {
  need: Need;
  isOrphaned: boolean;
}

export function NeedShowBanners({ need, isOrphaned }: NeedShowBannersProps) {
  return (
    <div className="m-0! space-y-4 [&>*:last-child]:mb-12">
      <NeedLockBanner need={need} />

      {need.status === 'revision' && need.notes && (
        <Alert className="border-warning/50 bg-warning/10 text-warning-foreground">
          <RiAlertLine className="h-4 w-4 text-warning" />
          <AlertTitle className="font-semibold text-foreground">
            Arahan Revisi Direktur
          </AlertTitle>
          <AlertDescription className="text-sm whitespace-pre-wrap text-foreground/90">
            {need.notes}
          </AlertDescription>
        </Alert>
      )}

      {need.status === 'submitted' && need.notes && (
        <Alert className="border-info/50 bg-info/10 text-info-foreground">
          <RiHistoryLine className="h-4 w-4 text-info" />
          <AlertTitle className="font-semibold text-foreground">
            Usulan Telah Diperbaiki & Diajukan Kembali
          </AlertTitle>
          <AlertDescription className="text-sm text-foreground/90">
            <span className="font-medium text-muted-foreground">
              Catatan revisi sebelumnya:
            </span>{' '}
            <span className="whitespace-pre-wrap">{need.notes}</span>
          </AlertDescription>
        </Alert>
      )}

      {isOrphaned && (
        <Alert variant="destructive">
          <RiAlertLine className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            Unit Kerja Tidak Aktif
          </AlertTitle>
          <AlertDescription className="text-sm">
            Unit kerja sebelumnya telah dihapus atau tidak aktif.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
