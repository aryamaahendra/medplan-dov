import { router } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import IndicatorController from '@/actions/App/Http/Controllers/Renstra/IndicatorController';
import { ActionDropdown } from '@/components/action-dropdown';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import type { Indicator } from '@/types';

interface IndicatorTableProps {
  indicators: Indicator[];
  onEdit: (indicator: Indicator) => void;
  yearStart: number;
  yearEnd: number;
}

export function IndicatorTable({
  indicators,
  onEdit,
  yearStart,
  yearEnd,
}: IndicatorTableProps) {
  const { hasPermission } = usePermission();
  const [deletingIndicator, setDeletingIndicator] = useState<Indicator | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const years = Array.from(
    { length: yearEnd - yearStart + 1 },
    (_, i) => yearStart + i,
  );

  const handleDelete = () => {
    if (!deletingIndicator) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      IndicatorController.destroy.url({ indicator: deletingIndicator.id }),
      {
        onSuccess: () => {
          toast.success('Indikator berhasil dihapus.');
          setDeletingIndicator(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  return (
    <>
      <div className="overflow-hidden bg-background">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="hover:bg-background">
              <TableHead rowSpan={2} className="w-[50px] border-r text-center">
                No
              </TableHead>
              <TableHead rowSpan={2} className="min-w-[200px] border-r">
                Indikator
              </TableHead>
              <TableHead rowSpan={2} className="w-[120px] border-r">
                Baseline
              </TableHead>
              <TableHead
                colSpan={years.length}
                className="border-r border-b text-center"
              >
                Target
              </TableHead>
              <TableHead rowSpan={2} className="w-1 text-center"></TableHead>
            </TableRow>
            <TableRow className="hover:bg-background">
              {years.map((year) => (
                <TableHead key={year} className="w-1 border-r text-center">
                  {year}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicators.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3 + years.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  Belum ada indikator.
                </TableCell>
              </TableRow>
            ) : (
              indicators.map((indicator, index) => (
                <TableRow key={indicator.id}>
                  <TableCell className="border-r text-center font-mono text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-r">
                    <div className="font-medium">{indicator.name}</div>
                    {indicator.description && (
                      <div className="w-[85ch] max-w-[85ch] text-xs whitespace-normal text-muted-foreground">
                        {indicator.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="border-r text-center font-mono">
                    {indicator.baseline || '-'}
                  </TableCell>
                  {years.map((year) => {
                    const target = indicator.targets?.find(
                      (t) => t.year === year,
                    );

                    return (
                      <TableCell
                        key={year}
                        className="border-r text-center font-mono"
                      >
                        {target?.target || '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <ActionDropdown
                      actions={
                        [
                          hasPermission('update indicators') && {
                            label: 'Edit',
                            icon: Edit,
                            onClick: () => onEdit(indicator),
                          },
                          hasPermission('update indicators') &&
                            hasPermission('delete indicators') &&
                            'separator',
                          hasPermission('delete indicators') && {
                            label: 'Hapus',
                            icon: Trash2,
                            onClick: () => setDeletingIndicator(indicator),
                            variant: 'destructive',
                          },
                        ].filter(Boolean) as any
                      }
                    />
                  </TableCell>
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
        description={`Apakah Anda yakin ingin menghapus indikator "${deletingIndicator?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
