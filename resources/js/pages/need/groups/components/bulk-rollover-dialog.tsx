import { router } from '@inertiajs/react';
import {
  RiHistoryLine,
  RiSearchLine,
  RiLoader4Line,
  RiErrorWarningLine,
} from '@remixicon/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatIDR } from '@/lib/formatters';
import needGroups from '@/routes/need-groups';
import { unapprovedCandidates } from '@/routes/needs';

import type { NeedGroup } from '../columns';

interface CandidateNeed {
  id: number;
  title: string;
  description: string | null;
  year: number;
  total_price: string | number;
  need_group?: { id: number; name: string; year: number } | null;
  organizational_unit?: { id: number; name: string } | null;
  need_type?: { id: number; name: string } | null;
}

interface BulkRolloverDialogProps {
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
  const [candidates, setCandidates] = useState<CandidateNeed[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCandidates = useCallback(async () => {
    if (!open) {
      return;
    }

    setLoading(true);

    try {
      const url = unapprovedCandidates.url({
        query: {
          target_need_group_id: needGroup?.id,
          search: search.trim() ? search.trim() : undefined,
        },
      });
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal memuat usulan');
      }

      const json = await response.json();
      setCandidates(json.data || []);
      setSelectedIds([]);
    } catch {
      toast.error('Gagal mengambil daftar usulan yang belum disetujui');
    } finally {
      setLoading(false);
    }
  }, [needGroup, open, search]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      void fetchCandidates();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [open, fetchCandidates]);

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectedTotalBudget = candidates
    .filter((c) => selectedIds.includes(c.id))
    .reduce((sum, c) => sum + (parseFloat(String(c.total_price)) || 0), 0);

  const handleSubmit = () => {
    if (onSelectIds) {
      onSelectIds(selectedIds);
      onOpenChange(false);

      return;
    }

    if (!needGroup || selectedIds.length === 0) {
      return;
    }

    setSubmitting(true);

    router.post(
      needGroups.rollover.url({ need_group: needGroup.id }),
      { need_ids: selectedIds },
      {
        onSuccess: () => {
          toast.success(
            `${selectedIds.length} usulan berhasil ditarik ke kelompok ${needGroup.name}.`,
          );
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Gagal menarik usulan ke kelompok ini.');
        },
        onFinish: () => {
          setSubmitting(false);
        },
      },
    );
  };

  const groupDisplayName = needGroup?.name ?? 'Kelompok Usulan Baru';
  const groupYear = needGroup?.year ?? targetYear ?? new Date().getFullYear();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <RiHistoryLine className="h-5 w-5 text-primary" />
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
                  fetchCandidates();
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchCandidates}
            disabled={loading}
          >
            Cari
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-md border">
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <RiLoader4Line className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Memuat usulan sebelumnya...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <RiErrorWarningLine className="h-8 w-8" />
              <p className="font-medium">
                Tidak ada usulan belum disetujui yang tersedia
              </p>
              <p className="text-xs text-muted-foreground">
                Semua usulan sebelumnya telah disetujui atau sudah ditarik ke
                kelompok ini.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        candidates.length > 0 &&
                        selectedIds.length === candidates.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Pilih semua"
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">Tahun</TableHead>
                  <TableHead>Usulan Kebutuhan</TableHead>
                  <TableHead>Unit Kerja</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Total Anggaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((need) => {
                  const isSelected = selectedIds.includes(need.id);

                  return (
                    <TableRow
                      key={need.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSelectOne(need.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(need.id)}
                          aria-label={`Pilih ${need.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <Badge variant="outline">{need.year}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {need.title}
                        </div>
                        {need.need_group && (
                          <span className="text-xs text-muted-foreground">
                            Kelompok: {need.need_group.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {need.organizational_unit?.name ?? '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {need.need_type?.name ?? '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {formatIDR(need.total_price)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter className="flex flex-col items-center justify-between gap-2 border-t pt-3 sm:flex-row">
          <div className="text-xs text-muted-foreground">
            Terpilih: <strong>{selectedIds.length}</strong> usulan
            {selectedIds.length > 0 && (
              <>
                {' '}
                • Total: <strong>{formatIDR(selectedTotalBudget)}</strong>
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
                  <RiLoader4Line className="mr-1.5 h-4 w-4 animate-spin" />
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
