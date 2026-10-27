import { useForm } from '@inertiajs/react';
import { RiLockLine, RiLockUnlockLine } from '@remixicon/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import NeedLockController from '@/actions/App/Http/Controllers/Need/NeedLockController';
import { InputField, TextareaField } from '@/components/form';
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

interface NeedLockDialogProps {
  need: Need | null;
  mode: 'lock' | 'unlock';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NeedLockDialog({
  need,
  mode,
  open,
  onOpenChange,
}: NeedLockDialogProps) {
  const isLockMode = mode === 'lock';

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    lock_reason: '',
    unlocked_until: '',
    inherit_schedule: false,
  });

  useEffect(() => {
    if (open) {
      setData({
        lock_reason: '',
        unlocked_until: '',
        inherit_schedule: false,
      });
      clearErrors();
    }
  }, [open, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!need) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockMode) {
      post(NeedLockController.lock.url(need), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Usulan kebutuhan berhasil dikunci.');
          onOpenChange(false);
        },
        onError: (err) => {
          const message =
            Object.values(err).flat()[0] ||
            'Terjadi kesalahan saat mengunci usulan.';
          toast.error(message);
        },
      });
    } else {
      post(NeedLockController.unlock.url(need), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Kunci usulan kebutuhan berhasil dibuka.');
          onOpenChange(false);
        },
        onError: (err) => {
          const message =
            Object.values(err).flat()[0] ||
            'Terjadi kesalahan saat membuka kunci usulan.';
          toast.error(message);
        },
      });
    }
  };

  const handleRevokeOverride = () => {
    post(
      NeedLockController.unlock.url(need, {
        query: {
          inherit_schedule: 1,
          lock_reason: 'Mencabut override dan kembali ke jadwal kelompok',
        },
      }),
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(
            'Override kunci berhasil dicabut dan jadwal kelompok dipulihkan.',
          );
          onOpenChange(false);
        },
        onError: (err) => {
          const message =
            Object.values(err).flat()[0] ||
            'Terjadi kesalahan saat mencabut override.';
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isLockMode ? (
                <>
                  <RiLockLine className="h-5 w-5 text-destructive" />
                  Kunci Usulan Kebutuhan
                </>
              ) : (
                <>
                  <RiLockUnlockLine className="h-5 w-5 text-foreground" />
                  Buka Kunci / Beri Perpanjangan
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isLockMode
                ? `Kunci usulan "${need.title}" untuk membekukan perubahan oleh unit kerja.`
                : `Buka kunci usulan "${need.title}" atau tentukan batas waktu perpanjangan revisi.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <TextareaField
              id="lock_reason"
              label={`Alasan ${isLockMode ? 'Penguncian' : 'Pembukaan / Perpanjangan'}`}
              required
              placeholder={
                isLockMode
                  ? 'Contoh: Pembekuan sementara untuk evaluasi perencana'
                  : 'Contoh: Memberikan kesempatan revisi dokumen spesifikasi teknis'
              }
              value={data.lock_reason}
              onChange={(e) => setData('lock_reason', e.target.value)}
              rows={3}
              error={errors.lock_reason}
            />

            {!isLockMode && (
              <InputField
                id="unlocked_until"
                type="datetime-local"
                label="Batas Waktu Perpanjangan (Opsional)"
                description="Kosongkan jika ingin membuka kunci tanpa batas waktu (override manual). Jika diisi, usulan otomatis terkunci kembali setelah waktu berakhir."
                value={data.unlocked_until}
                onChange={(e) => setData('unlocked_until', e.target.value)}
                error={errors.unlocked_until}
              />
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between sm:gap-0">
            <div>
              {!isLockMode &&
                (need.is_locked !== null || !!need.unlocked_until) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleRevokeOverride}
                    disabled={processing}
                  >
                    Cabut Override & Ikuti Jadwal
                  </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant={isLockMode ? 'destructive' : 'default'}
                disabled={processing}
              >
                {isLockMode ? 'Kunci Usulan' : 'Simpan Perubahan'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
