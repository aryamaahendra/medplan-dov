import { Link } from '@inertiajs/react';
import {
  RiBuildingLine,
  RiSearchLine,
  RiAlertLine,
  RiArrowRightLine,
} from '@remixicon/react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { UnitProgressItem } from '@/types/needs-dashboard';

interface OperationsUnitProgressTableProps {
  groupId?: number;
  allUnitProgress: UnitProgressItem[];
}

export function OperationsUnitProgressTable({
  groupId,
  allUnitProgress,
}: OperationsUnitProgressTableProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'problems_only'>('all');

  const filteredUnits = useMemo(() => {
    return allUnitProgress.filter((unit) => {
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = unit.name.toLowerCase().includes(query);
        const matchesBreadcrumb = unit.breadcrumb
          ?.toLowerCase()
          .includes(query);

        if (!matchesName && !matchesBreadcrumb) {
          return false;
        }
      }

      // Problem units only filter: has 0 submissions OR has exceptions
      if (filterMode === 'problems_only') {
        const hasZeroSubmissions = !unit.has_submission;
        const hasExceptions = (unit.exceptions_count ?? 0) > 0;

        if (!hasZeroSubmissions && !hasExceptions) {
          return false;
        }
      }

      return true;
    });
  }, [allUnitProgress, search, filterMode]);

  return (
    <Card className="flex flex-col border-border/80">
      <CardHeader className="flex flex-col gap-3 px-5 pt-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <RiBuildingLine className="size-4 text-muted-foreground" />
            <span>Progres Pengajuan per Unit Kerja</span>
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Monitoring sebaran usulan, kesiapan berkas, dan unit tanpa pengajuan
          </p>
        </div>

        {/* Toolbar: Search & Mode Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-56">
            <RiSearchLine className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama unit..."
              className="h-7 pl-8 text-xs"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setFilterMode((m) => (m === 'all' ? 'problems_only' : 'all'))
            }
            className={cn(
              'h-7 text-xs font-normal',
              filterMode === 'problems_only' &&
                'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300',
            )}
          >
            {filterMode === 'problems_only' ? (
              <span className="flex items-center gap-1">
                <RiAlertLine className="size-3 text-amber-600" />
                Hanya Masalah ({filteredUnits.length})
              </span>
            ) : (
              'Semua Unit'
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-5 pt-0 pb-4">
        <div className="max-h-[380px] overflow-y-auto rounded-lg border border-border/70">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-xs">
              <TableRow className="text-xs">
                <TableHead className="w-[36%]">Unit Kerja</TableHead>
                <TableHead className="w-[12%] text-center">
                  Total Usulan
                </TableHead>
                <TableHead className="w-[20%] text-center">
                  Komposisi Tahapan
                </TableHead>
                <TableHead className="w-[12%] text-center">
                  Kesiapan Data
                </TableHead>
                <TableHead className="w-[12%] text-right">Anggaran</TableHead>
                <TableHead className="w-[8%] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Tidak ada unit kerja yang sesuai filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((item) => {
                  const depth = item.depth ?? 0;
                  const total = item.total_needs;
                  const draftPct =
                    total > 0 ? (item.draft_count / total) * 100 : 0;
                  const reviewPct =
                    total > 0 ? (item.under_review_count / total) * 100 : 0;
                  const approvedPct =
                    total > 0 ? (item.approved_count / total) * 100 : 0;
                  const rejectedPct =
                    total > 0 ? (item.rejected_count / total) * 100 : 0;

                  return (
                    <TableRow
                      key={item.unit_id}
                      className={cn(
                        'text-xs transition-colors',
                        !item.has_submission &&
                          'bg-amber-500/5 text-muted-foreground dark:bg-amber-500/10',
                      )}
                    >
                      {/* Unit name with hierarchy indentation */}
                      <TableCell className="max-w-[220px]">
                        <div
                          className="flex flex-col"
                          style={{
                            paddingLeft: `${Math.min(depth * 14, 42)}px`,
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            {depth > 0 && (
                              <span className="font-mono text-muted-foreground/60 select-none">
                                └
                              </span>
                            )}
                            <Link
                              href={needRoutes.index.url({
                                query: {
                                  need_group_id: groupId,
                                  organizational_unit_id: [
                                    item.unit_id.toString(),
                                  ],
                                  include_descendants: 1,
                                },
                              })}
                              className="truncate font-semibold text-foreground hover:text-primary hover:underline"
                              title={item.name}
                            >
                              {item.name}
                            </Link>

                            {!item.has_submission && (
                              <Badge
                                variant="outline"
                                className="h-4 border-amber-500/40 px-1 font-mono text-[9px] text-amber-700 dark:text-amber-400"
                              >
                                Belum Mengajukan
                              </Badge>
                            )}
                          </div>

                          {item.breadcrumb && (
                            <span className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                              {item.breadcrumb}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Total needs */}
                      <TableCell className="text-center font-mono font-bold">
                        {formatNumber(item.total_needs)}
                      </TableCell>

                      {/* Stage composition mini-bar */}
                      <TableCell>
                        {total === 0 ? (
                          <div className="text-center font-mono text-[11px] text-muted-foreground">
                            -
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {/* Stacked mini-bar */}
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/60">
                              {approvedPct > 0 && (
                                <div
                                  style={{ width: `${approvedPct}%` }}
                                  className="h-full bg-emerald-600 dark:bg-emerald-500"
                                  title={`Disetujui: ${item.approved_count}`}
                                />
                              )}
                              {reviewPct > 0 && (
                                <div
                                  style={{ width: `${reviewPct}%` }}
                                  className="h-full bg-amber-500"
                                  title={`Menunggu Review: ${item.under_review_count}`}
                                />
                              )}
                              {draftPct > 0 && (
                                <div
                                  style={{ width: `${draftPct}%` }}
                                  className="h-full bg-blue-500/70"
                                  title={`Draf: ${item.draft_count}`}
                                />
                              )}
                              {rejectedPct > 0 && (
                                <div
                                  style={{ width: `${rejectedPct}%` }}
                                  className="h-full bg-rose-500"
                                  title={`Ditolak: ${item.rejected_count}`}
                                />
                              )}
                            </div>

                            {/* Counts legend */}
                            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                              <span>Draf: {item.draft_count}</span>
                              <span className="text-amber-700 dark:text-amber-400">
                                Rev: {item.under_review_count}
                              </span>
                              <span className="text-emerald-700 dark:text-emerald-400">
                                Selesai: {item.approved_count}
                              </span>
                            </div>
                          </div>
                        )}
                      </TableCell>

                      {/* Readiness */}
                      <TableCell className="text-center font-mono">
                        {item.readiness !== undefined && item.readiness > 0 ? (
                          <span
                            className={cn(
                              'font-semibold',
                              item.readiness >= 85
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400',
                            )}
                          >
                            {item.readiness}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Total budget */}
                      <TableCell className="text-right font-mono font-medium">
                        {formatCompactIDR(item.total_budget)}
                      </TableCell>

                      {/* Link action */}
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          nativeButton={false}
                          render={
                            <Link
                              href={needRoutes.index.url({
                                query: {
                                  need_group_id: groupId,
                                  organizational_unit_id: [
                                    item.unit_id.toString(),
                                  ],
                                  include_descendants: 1,
                                },
                              })}
                              title={`Buka usulan ${item.name}`}
                            >
                              <RiArrowRightLine className="size-3.5" />
                            </Link>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
