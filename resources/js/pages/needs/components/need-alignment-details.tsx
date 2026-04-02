import { useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Need, Sasaran, Tujuan } from '../columns';
import { TujuanAlignmentCard } from './tujuan-alignment-card';

interface NeedAlignmentDetailsProps {
  need: Need | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NeedAlignmentDetails({
  need,
  open,
  onOpenChange,
}: NeedAlignmentDetailsProps) {
  const groupedData = useMemo(() => {
    if (!need?.sasarans) {
      return [];
    }

    const tujuanMap = new Map<number, Tujuan & { sasarans: Sasaran[] }>();

    need.sasarans.forEach((sasaran) => {
      const tujuan = sasaran.tujuan;

      if (!tujuan) {
        return;
      }

      if (!tujuanMap.has(tujuan.id)) {
        tujuanMap.set(tujuan.id, { ...tujuan, sasarans: [] });
      }

      // Find indicators for this sasaran
      const indicators =
        need.indicators?.filter((i) => i.sasaran_id === sasaran.id) ?? [];

      tujuanMap.get(tujuan.id)?.sasarans.push({
        ...sasaran,
        indicators,
      });
    });

    return Array.from(tujuanMap.values());
  }, [need]);

  if (!need) {
    return null;
  }

  const hasData = groupedData.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{need.title}</DialogTitle>
          <DialogDescription className="mt-1 text-left text-sm text-muted-foreground">
            Penyelarasan strategis usulan kebutuhan dengan sasaran dan indikator
            kinerja.
          </DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar max-h-[70vh] flex-1 overflow-y-auto">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium text-foreground">
                Belum ada penyelarasan strategis.
              </h3>
              <p className="mt-1 max-w-[300px] text-sm text-muted-foreground">
                Usulan ini belum dihubungkan dengan sasaran atau indikator
                strategis organisasi.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-px pb-4">
              {groupedData.map((tujuan) => (
                <TujuanAlignmentCard key={tujuan.id} tujuan={tujuan} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
