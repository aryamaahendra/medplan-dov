import { useForm } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/Need/NeedController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Editor } from '@/components/ui/editor';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Need } from '../columns';

interface NeedDirectorReviewDialogProps {
  need: Need;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NeedDirectorReviewDialog({
  need,
  open,
  onOpenChange,
}: NeedDirectorReviewDialogProps) {
  const { data, setData, patch, processing, errors, reset, transform } =
    useForm({
      notes: need.notes ?? '',
      is_approved: !!need.approved_by_director_at,
    });

  const notesRef = useRef(data.notes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    transform((data) => ({
      ...data,
      notes: notesRef.current,
    }));

    patch(NeedController.updateDirectorReview.url(need), {
      onSuccess: () => {
        toast.success('Review direktur berhasil disimpan');
        onOpenChange(false);
      },
      onError: (err) => {
        const message =
          Object.values(err).flat()[0] ||
          'Terjadi kesalahan saat menyimpan review';
        toast.error(message);
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }

    onOpenChange(open);
  };

  // Sync with prop changes to ensure fresh data after server updates
  useEffect(() => {
    if (open) {
      notesRef.current = need.notes ?? '';
      setData((d) => ({
        ...d,
        notes: need.notes ?? '',
        is_approved: !!need.approved_by_director_at,
      }));
    }
  }, [need.notes, need.approved_by_director_at, open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Review Direktur</DialogTitle>
            <DialogDescription>
              Berikan catatan dan tentukan status persetujuan direktur untuk
              usulan ini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Review</Label>
              <div className="no-scrollbar max-h-[400px] overflow-auto rounded-xl border p-4">
                <div className="min-h-[200px]">
                  <Editor
                    id="notes"
                    value={data.notes}
                    onChange={(val) => {
                      notesRef.current = val;
                    }}
                    placeholder="Ketik catatan di sini..."
                    className="min-h-[200px] border-0 bg-background p-0 hover:ring-0"
                  />
                </div>
              </div>
              <InputError message={errors.notes} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Persetujuan Direktur</Label>
                <p className="text-sm text-muted-foreground">
                  Tandai usulan ini sebagai telah disetujui oleh direktur.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {data.is_approved ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground/50" />
                )}
                <Switch
                  checked={data.is_approved}
                  onCheckedChange={(val) => setData('is_approved', val)}
                />
              </div>
            </div>
            <InputError message={errors.is_approved} className="mt-0" />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Menyimpan...' : 'Simpan Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
