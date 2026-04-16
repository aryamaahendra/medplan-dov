import { router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
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
  const [deletingIndicator, setDeletingIndicator] =
    useState<KpiIndicator | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
                  {years.map((year) => (
                    <TableHead key={year} className="w-1 border-r text-center">
                      {year}
                    </TableHead>
                  ))}
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

                    return (
                      <TableCell
                        key={year}
                        className="border-r py-2 text-center font-mono text-sm"
                      >
                        {target?.target_value || '-'}
                      </TableCell>
                    );
                  })}

                  {showActions && (
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(indicator)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {(onEdit || onDelete) && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingIndicator(indicator)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
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
