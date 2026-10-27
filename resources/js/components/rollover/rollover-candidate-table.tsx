import {
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from '@remixicon/react';

import { NextCycleRecommendationChip } from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';

import { isCandidateRecommended } from './rollover-engine';
import type { RolloverCandidatesController } from './types';

interface RolloverCandidateTableProps {
  controller: RolloverCandidatesController;
  emptyMessage?: string;
  className?: string;
}

export function RolloverCandidateTable({
  controller,
  emptyMessage = 'Tidak ada usulan sebelumnya yang tersedia untuk ditarik.',
  className,
}: RolloverCandidateTableProps) {
  const {
    candidates,
    loading,
    selectingId,
    mode,
    isAllSelected,
    isSelected,
    toggleSelectAll,
    toggleSelectOne,
    pickSingle,
  } = controller;

  if (loading) {
    return (
      <div
        className={cn(
          'flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground',
          className,
        )}
      >
        <RiLoader4Line className="h-6 w-6 animate-spin" />
        <span className="text-sm">Memuat daftar usulan...</span>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div
        className={cn(
          'flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground',
          className,
        )}
      >
        <RiErrorWarningLine className="h-6 w-6" />
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {mode === 'multiple' ? (
              <TableHead className="w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Pilih semua usulan"
                />
              </TableHead>
            ) : (
              <TableHead className="w-20 text-center">Aksi</TableHead>
            )}
            <TableHead>Usulan</TableHead>
            <TableHead className="hidden md:table-cell">
              Unit Pengusul
            </TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Volume
            </TableHead>
            <TableHead className="text-right">Total Anggaran</TableHead>
            <TableHead className="text-center">Status Rekomendasi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => {
            const selected = isSelected(candidate.id);
            const isSelectingThis = selectingId === candidate.id;
            const hasRec = isCandidateRecommended(candidate);

            return (
              <TableRow
                key={candidate.id}
                className={cn(
                  'transition-colors',
                  selected && mode === 'multiple' && 'bg-muted/50',
                  hasRec && 'bg-amber-50/30 dark:bg-amber-950/10',
                )}
              >
                {mode === 'multiple' ? (
                  <TableCell>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleSelectOne(candidate.id)}
                      aria-label={`Pilih ${candidate.title}`}
                    />
                  </TableCell>
                ) : (
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={selectingId !== null}
                      onClick={() => pickSingle(candidate.id)}
                      className="h-8 gap-1 px-2.5 text-xs"
                    >
                      {isSelectingThis ? (
                        <RiLoader4Line className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RiCheckLine className="h-3.5 w-3.5" />
                      )}
                      Pilih
                    </Button>
                  </TableCell>
                )}
                <TableCell>
                  <div className="font-medium">{candidate.title}</div>
                  {candidate.description && (
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {candidate.description}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {candidate.need_group && (
                      <Badge variant="outline" className="text-xss">
                        {candidate.need_group.name} ({candidate.need_group.year}
                        )
                      </Badge>
                    )}
                    {candidate.need_type && (
                      <Badge variant="secondary" className="text-xss">
                        {candidate.need_type.name}
                      </Badge>
                    )}
                    <span className="text-xss text-muted-foreground md:hidden">
                      {candidate.organizational_unit?.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {candidate.organizational_unit?.name || '-'}
                </TableCell>
                <TableCell className="hidden text-right text-xs sm:table-cell">
                  {candidate.volume != null
                    ? `${candidate.volume} ${candidate.unit ?? ''}`
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatIDR(candidate.total_price)}
                </TableCell>
                <TableCell className="text-center">
                  <NextCycleRecommendationChip
                    isRecommended={hasRec}
                    recommendedVolume={candidate.recommended_volume}
                    unit={candidate.unit}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
