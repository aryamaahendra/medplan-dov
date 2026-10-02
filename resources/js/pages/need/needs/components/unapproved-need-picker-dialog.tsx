import {
  RiSearchLine,
  RiHistoryLine,
  RiCheckLine,
  RiLoader4Line,
  RiErrorWarningLine,
} from '@remixicon/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatIDR } from '@/lib/formatters';
import { unapprovedCandidates, unapprovedSource } from '@/routes/needs';

interface CandidateNeed {
  id: number;
  title: string;
  description: string | null;
  year: number;
  volume: string | number;
  unit: string;
  total_price: string | number;
  need_group?: { id: number; name: string; year: number } | null;
  organizational_unit?: { id: number; name: string } | null;
  need_type?: { id: number; name: string } | null;
  notes?: string | null;
}

interface UnapprovedNeedPickerDialogProps {
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
  const [candidates, setCandidates] = useState<CandidateNeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!targetGroupId || !open) {
      return;
    }

    setLoading(true);

    try {
      const url = unapprovedCandidates.url({
        query: {
          target_need_group_id: targetGroupId,
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
        throw new Error('Gagal memuat usulan sebelumnya');
      }

      const json = await response.json();
      setCandidates(json.data || []);
    } catch {
      toast.error('Gagal mengambil daftar usulan yang belum disetujui');
    } finally {
      setLoading(false);
    }
  }, [targetGroupId, open, search]);

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

  const handleSelect = async (candidateId: number) => {
    setSelectingId(candidateId);

    try {
      const url = unapprovedSource.url({ need: candidateId });
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil rincian usulan');
      }

      const json = await response.json();
      onSelect(json.data);
      toast.success('Data usulan lama berhasil dimuat ke formulir.');
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan saat memuat rincian usulan');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[850px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <RiHistoryLine className="h-5 w-5 text-primary" />
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
                Tidak ada usulan belum disetujui yang ditemukan
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
                  <TableHead className="w-[80px]">Tahun</TableHead>
                  <TableHead>Usulan Kebutuhan</TableHead>
                  <TableHead>Unit Kerja</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Total Anggaran</TableHead>
                  <TableHead className="w-[100px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((need) => (
                  <TableRow key={need.id} className="hover:bg-muted/50">
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
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={selectingId !== null}
                        onClick={() => handleSelect(need.id)}
                      >
                        {selectingId === need.id ? (
                          <RiLoader4Line className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RiCheckLine className="mr-1 h-4 w-4" />
                            Pilih
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
