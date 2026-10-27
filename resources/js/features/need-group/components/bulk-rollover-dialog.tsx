import { RiHistoryLine, RiLoader4Line, RiSearchLine } from '@remixicon/react';

import {
  RolloverCandidateTable,
  useRolloverCandidates,
} from '@/components/rollover';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatIDR } from '@/lib/formatters';

import type { NeedGroup } from '../types/need-group.types';

export interface BulkRolloverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needGroup?: NeedGroup | null;
  targetYear?: number;
  initialSelectedIds?: number[];
  onSelectIds?: (selectedIds: number[]) => void;
}

export function BulkRolloverDialog({
  open,
  onOpenChange,
  needGroup,
  targetYear,
  initialSelectedIds = [],
  onSelectIds,
}: BulkRolloverDialogProps) {
  const groupDisplayName = needGroup?.name ?? 'Kelompok Usulan Baru';
  const groupYear = needGroup?.year ?? targetYear ?? new Date().getFullYear();

  const controller = useRolloverCandidates({
    targetGroupId: needGroup?.id,
    targetNeedGroupName: groupDisplayName,
    open,
    mode: 'multiple',
    initialSelectedIds,
    onSelectIds,
    onOpenChange,
  });

  const {
    selectedIds,
    selectedBudget,
    loading,
    submitting,
    search,
    setSearch,
    fetchCandidates,
    commitBatch,
  } = controller;

  const handleSubmit = () => {
    if (needGroup) {
      void commitBatch(needGroup.id, needGroup.name);
    } else if (onSelectIds) {
      onSelectIds(selectedIds);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <RiHistoryLine className="h-5 w-5 text-foreground" />
            <DialogTitle>Tarik Usulan Belum Disetujui</DialogTitle>
          </div>
          <DialogDescription>
            Pilih usulan dari periode sebelumnya untuk ditarik ke kelompok{' '}
            <strong>{groupDisplayName}</strong> (Tahun Anggaran {groupYear}).
            Usulan yang ditarik akan disalin dengan status draf.
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
            emptyMessage="Semua usulan sebelumnya telah disetujui atau sudah ditarik ke kelompok ini."
          />
        </div>

        <DialogFooter className="flex flex-col items-center justify-between gap-2 border-t pt-3 sm:flex-row">
          <div className="text-xs text-muted-foreground">
            Terpilih: <strong>{selectedIds.length}</strong> usulan
            {selectedIds.length > 0 && (
              <>
                {' '}
                • Total: <strong>{formatIDR(selectedBudget)}</strong>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={selectedIds.length === 0 || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <RiLoader4Line
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                  Menarik Usulan...
                </>
              ) : onSelectIds ? (
                `Gunakan ${selectedIds.length} Usulan Terpilih`
              ) : (
                `Tarik ${selectedIds.length} Usulan Terpilih`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
