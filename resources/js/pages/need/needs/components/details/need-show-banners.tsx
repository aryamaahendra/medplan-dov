import { RiAlertLine } from '@remixicon/react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Need } from '@/types';

import { NeedLockBanner } from '../need-lock-banner';

interface NeedShowBannersProps {
  need: Need;
  isOrphaned: boolean;
}

export function NeedShowBanners({ need, isOrphaned }: NeedShowBannersProps) {
  return (
    <div className="space-y-4">
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
