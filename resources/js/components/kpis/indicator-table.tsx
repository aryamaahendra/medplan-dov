import { router } from '@inertiajs/react';
import { RiEditLine, RiMoreFill, RiDeleteBinLine } from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';

import KpiIndicatorController from '@/actions/App/Http/Controllers/Kpi/KpiIndicatorController';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import type { KpiIndicator } from '@/types';

interface IndicatorTableProps {
  indicators: KpiIndicator[];
  onEdit?: (indicator: KpiIndicator) => void;
  onDelete?: (indicator: KpiIndicator) => void;
  yearStart?: number;
  yearEnd?: number;
  hideHeader?: boolean;
}

export function IndicatorTable({
  indicators,
  onEdit,
  onDelete,
  yearStart,
  yearEnd,
  hideHeader = false,
}: IndicatorTableProps) {
  const { hasPermission } = usePermission();
  const [deletingIndicator, setDeletingIndicator] =
    useState<KpiIndicator | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentYear = new Date().getFullYear();
  const years =
    yearStart && yearEnd
      ? Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i)
      : [];
  const handleDelete = () => {
    if (!deletingIndicator) {
      return;
    }

    if (onDelete) {
      onDelete(deletingIndicator);
      setDeletingIndicator(null);

      return;
    }

    setIsDeleting(true);
    router.delete(
      KpiIndicatorController.destroy.url({ indicator: deletingIndicator.id }),
      {
        onSuccess: () => {
          toast.success('Indikator berhasil dihapus.');
          setDeletingIndicator(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  const showActions = !!onEdit || !!onDelete;

  return (
    <>
      <div className="overflow-x-auto bg-background">
        <Table className="min-w-full border-collapse">
          {!hideHeader && (
            <TableHeader>
              <TableRow className="hover:bg-background">
                <TableHead
                  rowSpan={2}
                  className="w-[50px] border-r text-center"
                >
                  No
                </TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] border-r">
                  Indikator
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="w-[100px] border-r text-center"
                >
                  Satuan
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="w-[100px] border-r text-center"
                >
                  Baseline
                </TableHead>
                {years.length > 0 && (
                  <TableHead
                    colSpan={years.length}
                    className="border-r border-b text-center"
                  >
                    Target Tahunan
                  </TableHead>
                )}
                {showActions && (
                  <TableHead
                    rowSpan={2}
                    className="w-1 text-center"
                  ></TableHead>
                )}
              </TableRow>
              {years.length > 0 && (
                <TableRow className="hover:bg-background">
                  {years.map((year) => {
                    const isCurrent = year === currentYear;

                    return (
                      <TableHead
                        key={year}
                        className={cn(
                          'w-1 border-r text-center transition-colors',
                          isCurrent &&
                            'bg-muted/60 font-bold text-foreground ring-1 ring-border ring-inset',
                        )}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{year}</span>
                          {isCurrent && (
                            <span className="py-0.2 rounded-full bg-foreground/10 px-1.5 text-xss font-semibold text-foreground">
                              Saat ini
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              )}
            </TableHeader>
          )}
          <TableBody>
            {indicators.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4 + years.length + (showActions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  Belum ada indikator.
                </TableCell>
              </TableRow>
            ) : (
              indicators.map((indicator, index) => (
                <TableRow key={indicator.id}>
                  {!hideHeader && (
                    <>
                      <TableCell className="border-r text-center font-mono text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="border-r">
                        <div className="font-medium">{indicator.name}</div>
                      </TableCell>
                    </>
                  )}

                  {hideHeader && (
                    <TableCell className="w-[150px] border-r bg-muted/20 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Baseline & Targets
                    </TableCell>
                  )}

                  <TableCell className="border-r py-2 text-center font-mono text-sm">
                    {indicator.unit || '-'}
                  </TableCell>
                  <TableCell className="border-r py-2 text-center font-mono text-sm">
                    {indicator.baseline_value || '-'}
                  </TableCell>

                  {years.map((year) => {
                    const target = indicator.annual_targets?.find(
                      (t) => t.year === year,
                    );
                    const isCurrent = year === currentYear;

                    return (
                      <TableCell
                        key={year}
                        className={cn(
                          'border-r py-2 text-center font-mono text-sm transition-colors',
                          isCurrent &&
                            'bg-muted/40 font-bold text-foreground ring-1 ring-border ring-inset',
                        )}
                      >
                        {target?.target_value ? (
                          <span
                            className={cn(
                              isCurrent &&
                                'inline-block rounded bg-foreground/10 px-1.5 py-0.5 font-semibold text-foreground',
                            )}
                          >
                            {target.target_value}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    );
                  })}

                  {showActions && (
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" />}
                        >
                          <RiMoreFill />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          {onEdit && hasPermission('update kpi-indicators') && (
                            <DropdownMenuItem onClick={() => onEdit(indicator)}>
                              <RiEditLine />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {(onEdit || onDelete) && <DropdownMenuSeparator />}
                          {hasPermission('delete kpi-indicators') && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingIndicator(indicator)}
                            >
                              <RiDeleteBinLine />
                              Hapus
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deletingIndicator}
        onOpenChange={(open) => !open && setDeletingIndicator(null)}
        onConfirm={handleDelete}
        title="Hapus Indikator"
        description={`Apakah Anda yakin ingin menghapus indikator "${deletingIndicator?.name}"?`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
