import { RiLockLine, RiTimeLine } from '@remixicon/react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

interface NeedLockBannerProps {
  need: Need;
  className?: string;
}
export function NeedLockBanner({ need, className }: NeedLockBannerProps) {
  const isLocked = need.is_locked ?? false;
  const unlockedUntil = need.unlocked_until;

  const formatRemainingTime = (timestamp: string): string => {
    const target = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return 'Waktu perpanjangan telah berakhir';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} hari`);
    }

    if (hours > 0 || days > 0) {
      parts.push(`${hours} jam`);
    }

    if (minutes > 0 || hours > 0 || days > 0) {
      parts.push(`${minutes} menit`);
    }

    parts.push(`${seconds} detik`);

    return parts.join(' ');
  };

  const [timeLeft, setTimeLeft] = useState<string | null>(() =>
    !unlockedUntil || isLocked ? null : formatRemainingTime(unlockedUntil),
  );

  useEffect(() => {
    if (!unlockedUntil || isLocked) {
      return;
    }

    const interval = window.setInterval(() => {
      const updated = formatRemainingTime(unlockedUntil);
      setTimeLeft(updated);

      if (updated === 'Waktu perpanjangan telah berakhir') {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [unlockedUntil, isLocked]);

  // If need has an active extension and is not locked, render extension notice
  if (!isLocked && unlockedUntil) {
    return (
      <Alert
        variant="default"
        className={cn(
          'border-amber-500/50 bg-amber-500/10 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200',
          className,
        )}
      >
        <RiTimeLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="font-semibold text-amber-800 dark:text-amber-300">
          Perpanjangan Waktu Aktif
        </AlertTitle>
        <AlertDescription className="space-y-1 text-sm text-amber-700 dark:text-amber-300/90">
          <p>
            Usulan ini sedang dalam masa perpanjangan pengajuan. Anda dapat
            melakukan perubahan sebelum batas waktu berakhir.
          </p>
          {timeLeft && (
            <p className="font-medium">
              Sisa waktu perpanjangan:{' '}
              <span className="font-mono">{timeLeft}</span>
            </p>
          )}
          {need.lock_reason && (
            <p className="text-xs text-amber-600/90 italic dark:text-amber-400/80">
              Alasan: {need.lock_reason}
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // If not locked and no extension, don't show any banner
  if (!isLocked) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className={cn(
        'border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15',
        className,
      )}
    >
      <RiLockLine className="h-4 w-4" />
      <AlertTitle className="font-semibold">
        Usulan Kebutuhan Terkunci
      </AlertTitle>
      <AlertDescription className="space-y-1 text-sm">
        <p>
          {need.lock_reason ||
            'Usulan kebutuhan ini telah dikunci sehingga tidak dapat diubah atau dihapus.'}
        </p>
        {need.group_submission_end_at && (
          <p className="text-xs opacity-80">
            Batas akhir pengajuan kelompok:{' '}
            {formatDateTime(need.group_submission_end_at)}
          </p>
        )}
        {need.locked_at && (
          <p className="text-xs opacity-80">
            Waktu penguncian: {formatDateTime(need.locked_at)}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
