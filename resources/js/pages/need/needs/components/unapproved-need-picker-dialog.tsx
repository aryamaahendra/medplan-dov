import { RiHistoryLine, RiSearchLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  RolloverCandidateTable,
  useRolloverCandidates,
} from '@/features/need/rollover';

export interface UnapprovedNeedPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetGroupId: number | string;
  onSelect: (sourceNeed: any) => void;
}

export function UnapprovedNeedPickerDialog({
  open,
  onOpenChange,
  targetGroupId,
  onSelect,
}: UnapprovedNeedPickerDialogProps) {
  const controller = useRolloverCandidates({
    targetGroupId,
    open,
    mode: 'single',
    onSelectSource: onSelect,
    onOpenChange,
  });

  const { loading, search, setSearch, fetchCandidates } = controller;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[850px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <RiHistoryLine className="h-5 w-5 text-foreground" />
            <DialogTitle>
              Pilih dari Usulan Sebelumnya yang Belum Disetujui
            </DialogTitle>
          </div>
          <DialogDescription>
            Pilih usulan dari kelompok/periode sebelumnya untuk disalin ke
            formulir usulan baru. Semua rincian KAK dan keselarasan akan dimuat
            dan dapat disesuaikan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <div className="relative flex-1">
            <RiSearchLine className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau uraian usulan..."
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void fetchCandidates();
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => void fetchCandidates()}
            disabled={loading}
          >
            Cari
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-md border">
          <RolloverCandidateTable
            controller={controller}
            emptyMessage="Tidak ada usulan sebelumnya yang tersedia untuk disalin."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
