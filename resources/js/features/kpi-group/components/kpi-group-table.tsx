import { router } from '@inertiajs/react';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFolderLine,
  RiLineChartLine,
  RiMoreFill,
} from '@remixicon/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import KpiIndicatorController from '@/actions/App/Http/Controllers/Kpi/KpiIndicatorController';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { buildIndicatorTree } from '@/lib/kpi-utils';
import { cn } from '@/lib/utils';
import type { KpiGroup, KpiIndicator } from '@/types';

interface KpiGroupTableProps {
  group: KpiGroup;
  indicators: KpiIndicator[];
  onEdit?: (indicator: KpiIndicator) => void;
  onDelete?: (indicator: KpiIndicator) => void;
  onCreateChild?: (parent: KpiIndicator) => void;
  onCreateFirst?: () => void;
}

interface FlattenedIndicatorRow {
  indicator: KpiIndicator;
  depth: number;
  hierarchicalNumber: string;
}

export function KpiGroupTable({
  group,
  indicators,
  onEdit,
  onDelete,
  onCreateChild,
  onCreateFirst,
}: KpiGroupTableProps) {
  const { hasPermission } = usePermission();
  const [deletingIndicator, setDeletingIndicator] =
    useState<KpiIndicator | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearStart = group.start_year;
  const yearEnd = group.end_year;

  const years = useMemo(() => {
    if (!yearStart || !yearEnd || yearEnd < yearStart) {
      return [];
    }

    return Array.from(
      { length: yearEnd - yearStart + 1 },
      (_, i) => yearStart + i,
    );
  }, [yearStart, yearEnd]);

  // Flatten the hierarchical tree for table rows with accurate depth and numbers
  const flattenedRows = useMemo(() => {
    const tree = buildIndicatorTree(indicators);
    const result: FlattenedIndicatorRow[] = [];

    function traverse(nodes: KpiIndicator[], depth: number, prefix: string) {
      nodes.forEach((node, index) => {
        const itemNumber = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
        result.push({
          indicator: node,
          depth,
          hierarchicalNumber: itemNumber,
        });

        if (node.indicators && node.indicators.length > 0) {
          traverse(node.indicators, depth + 1, itemNumber);
        }
      });
    }

    traverse(tree, 0, '');

    return result;
  }, [indicators]);

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

  const showActions = !!onEdit || !!onDelete || !!onCreateChild;

  return (
    <>
      <Card>
        <CardContent className="p-0 sm:p-2">
          <div className="overflow-x-auto">
            <Table className="border-collapse [&_td]:border [&_td]:p-2.5 [&_td:first-child]:border-l-0 [&_td:last-child]:border-r-0 [&_th]:border [&_th]:p-2.5 [&_th:first-child]:border-l-0 [&_th:last-child]:border-r-0">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead
                    rowSpan={2}
                    className="w-[70px] border-r text-center font-semibold"
                  >
                    No
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="min-w-[280px] border-r font-semibold"
                  >
                    Kategori & Indikator Kunci
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="w-[100px] border-r text-center font-semibold"
                  >
                    Satuan
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="w-[100px] border-r text-center font-semibold"
                  >
                    Baseline
                  </TableHead>
                  {years.length > 0 && (
                    <TableHead
                      colSpan={years.length}
                      className="border-r border-b text-center font-semibold"
                    >
                      Target Tahunan
                    </TableHead>
                  )}
                  {showActions && (
                    <TableHead
                      rowSpan={2}
                      className="w-[60px] text-center font-semibold"
                    >
                      Aksi
                    </TableHead>
                  )}
                </TableRow>
                {years.length > 0 && (
                  <TableRow>
                    {years.map((year) => {
                      const isCurrent = year === currentYear;

                      return (
                        <TableHead
                          key={year}
                          className={cn(
                            'w-[90px] border-r text-center transition-colors',
                            isCurrent &&
                              'bg-primary/15 font-bold text-primary ring-1 ring-primary/30 ring-inset',
                          )}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{year}</span>
                            {isCurrent && (
                              <span className="py-0.2 rounded-full bg-primary/20 px-1.5 text-[9px] font-semibold text-primary">
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

              <TableBody>
                {flattenedRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4 + years.length + (showActions ? 1 : 0)}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <p>
                        Belum ada indikator atau kategori untuk periode ini.
                      </p>
                      {onCreateFirst &&
                        hasPermission('create kpi-indicators') && (
                          <Button
                            variant="link"
                            onClick={onCreateFirst}
                            className="mt-2 text-primary"
                          >
                            <RiAddLine data-icon="inline-start" />
                            Buat indikator pertama
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ) : (
                  flattenedRows.map(
                    ({ indicator, depth, hierarchicalNumber }) => {
                      const isCategory = indicator.is_category;

                      return (
                        <TableRow
                          key={indicator.id}
                          className={cn(
                            'transition-colors hover:bg-muted/40',
                            isCategory &&
                              depth === 0 &&
                              'bg-muted/30 font-semibold',
                            isCategory &&
                              depth > 0 &&
                              'bg-muted/15 font-medium',
                          )}
                        >
                          <TableCell className="border-r text-center font-mono text-xs text-muted-foreground">
                            {hierarchicalNumber}
                          </TableCell>

                          <TableCell className="border-r">
                            <div
                              className="flex items-center gap-2"
                              style={{
                                paddingLeft: `${depth * 1.5}rem`,
                              }}
                            >
                              {isCategory ? (
                                <RiFolderLine className="h-4 w-4 shrink-0 text-amber-500" />
                              ) : (
                                <RiLineChartLine className="h-4 w-4 shrink-0 text-primary" />
                              )}
                              <span
                                className={cn(
                                  'text-sm leading-tight text-foreground',
                                  isCategory ? 'font-semibold' : 'font-normal',
                                )}
                              >
                                {indicator.name}
                              </span>
                              {isCategory && (
                                <Badge
                                  variant="secondary"
                                  className="ml-auto shrink-0 text-[10px]"
                                >
                                  Kategori L{depth + 1}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="border-r text-center font-mono text-sm">
                            {isCategory ? '-' : indicator.unit || '-'}
                          </TableCell>

                          <TableCell className="border-r text-center font-mono text-sm">
                            {isCategory ? '-' : indicator.baseline_value || '-'}
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
                                  'border-r text-center font-mono text-sm transition-colors',
                                  isCurrent &&
                                    'bg-primary/10 font-bold text-primary ring-1 ring-primary/20 ring-inset',
                                )}
                              >
                                {isCategory ? (
                                  <span className="text-muted-foreground/50">
                                    -
                                  </span>
                                ) : target?.target_value ? (
                                  <span
                                    className={cn(
                                      isCurrent &&
                                        'inline-block rounded bg-primary/20 px-1.5 py-0.5 font-semibold text-primary',
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
                                  render={
                                    <Button variant="ghost" size="icon-sm" />
                                  }
                                >
                                  <RiMoreFill className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                  {isCategory &&
                                    onCreateChild &&
                                    hasPermission('create kpi-indicators') && (
                                      <DropdownMenuItem
                                        onClick={() => onCreateChild(indicator)}
                                      >
                                        <RiAddLine />
                                        Tambah Sub-Indikator
                                      </DropdownMenuItem>
                                    )}
                                  {onEdit &&
                                    hasPermission('update kpi-indicators') && (
                                      <DropdownMenuItem
                                        onClick={() => onEdit(indicator)}
                                      >
                                        <RiEditLine />
                                        Edit
                                      </DropdownMenuItem>
                                    )}
                                  {(onEdit || onDelete || onCreateChild) && (
                                    <DropdownMenuSeparator />
                                  )}
                                  {hasPermission('delete kpi-indicators') && (
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() =>
                                        setDeletingIndicator(indicator)
                                      }
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
                      );
                    },
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingIndicator}
        onOpenChange={(open) => !open && setDeletingIndicator(null)}
        onConfirm={handleDelete}
        title="Hapus Indikator"
        description={`Apakah Anda yakin ingin menghapus "${deletingIndicator?.name}"?`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
