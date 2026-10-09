import { Link } from '@inertiajs/react';
import {
  RiAlertLine,
  RiTimeLine,
  RiBuildingLine,
  RiExternalLinkLine,
  RiLockLine,
  RiCheckboxCircleLine,
  RiFileTextLine,
} from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { OperationNeedDrawerItem } from '@/types/needs-dashboard';

interface OperationsExceptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  severity?: 'critical' | 'warning' | 'info' | 'ready';
  code?: string;
  count: number;
  budget?: number;
  needs: OperationNeedDrawerItem[];
  filterUrl?: string;
  onOpenLockDialog?: (needId: number, mode: 'lock' | 'unlock') => void;
}

export function OperationsExceptionDrawer({
  open,
  onOpenChange,
  title,
  description,
  severity = 'warning',
  code,
  count,
  budget,
  needs,
  filterUrl,
  onOpenLockDialog,
}: OperationsExceptionDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl md:max-w-2xl"
      >
        <SheetHeader className="border-b border-border/80 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {code && (
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                {code}
              </span>
            )}
            {severity === 'critical' ? (
              <Badge variant="destructive" className="font-mono">
                Kritis
              </Badge>
            ) : severity === 'ready' ? (
              <Badge
                variant="default"
                className="bg-success font-mono text-success-foreground hover:bg-success/90"
              >
                Siap Verifikasi
              </Badge>
            ) : severity === 'info' ? (
              <Badge variant="secondary" className="font-mono">
                Info
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-warning/40 font-mono text-warning-foreground dark:text-warning"
              >
                Peringatan
              </Badge>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {formatNumber(count)} Usulan Terdampak
            </span>
            {budget !== undefined && budget > 0 && (
              <span className="font-mono text-xs font-medium text-foreground">
                (Total: {formatCompactIDR(budget)})
              </span>
            )}
          </div>

          <SheetTitle className="mt-2 text-base font-bold text-foreground">
            {title}
          </SheetTitle>

          <SheetDescription className="mt-1 text-xs text-muted-foreground">
            {description}
          </SheetDescription>

          {filterUrl && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={filterUrl} onClick={() => onOpenChange(false)}>
                    <span>Buka Semua di Daftar Usulan</span>
                    <RiExternalLinkLine data-icon="inline-end" />
                  </Link>
                }
              />
            </div>
          )}
        </SheetHeader>

        {/* List of needs */}
        <div className="flex-1 overflow-y-auto p-5">
          {needs.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 text-center">
              <RiAlertLine className="mb-2 size-8 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium text-foreground">
                Tidak ada usulan dalam kategori ini
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Semua usulan telah memenuhi kriteria atau ditindaklanjuti.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {needs.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-2 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.stage === 'approved' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success-foreground dark:text-success">
                            <RiCheckboxCircleLine className="size-3" />
                            Disetujui
                          </span>
                        ) : item.stage === 'under_review' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground dark:text-warning">
                            <RiTimeLine className="size-3" />
                            Menunggu Review
                          </span>
                        ) : item.stage === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                            Ditolak / Revisi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <RiFileTextLine className="size-3" />
                            Draf
                          </span>
                        )}

                        {item.is_priority && (
                          <Badge className="bg-warning text-warning-foreground">
                            Prioritas
                          </Badge>
                        )}
                        {item.is_locked && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <RiLockLine className="size-3" />
                            Terkunci
                          </span>
                        )}
                      </div>

                      <Link
                        href={needRoutes.index.url({
                          query: { search: item.title },
                        })}
                        className="mt-1 block font-medium text-foreground hover:text-primary hover:underline"
                      >
                        <span className="text-xs leading-snug font-semibold">
                          {item.title}
                        </span>
                      </Link>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <RiBuildingLine className="size-3 shrink-0" />
                          {item.unit_name}
                        </span>
                        <span>-</span>
                        <span className="font-mono font-medium text-foreground">
                          {formatCompactIDR(item.total_price)}
                        </span>
                        <span>-</span>
                        <span
                          className={cn(
                            'font-mono',
                            item.checklist_percentage >= 85
                              ? 'text-success-foreground dark:text-success'
                              : item.checklist_percentage > 0
                                ? 'text-warning-foreground dark:text-warning'
                                : 'text-muted-foreground',
                          )}
                        >
                          Checklist: {item.checklist_percentage}%
                        </span>
                        <span>-</span>
                        <span
                          className={cn(
                            'font-mono',
                            item.idle_days >= 7
                              ? 'font-semibold text-destructive'
                              : 'text-muted-foreground',
                          )}
                        >
                          Tidak aktif {item.idle_days} hari
                        </span>
                      </div>

                      {item.lock_reason && (
                        <p className="mt-1 text-[11px] text-muted-foreground italic">
                          Alasan kunci: {item.lock_reason}
                        </p>
                      )}
                      {item.unlocked_until && (
                        <p className="mt-0.5 text-[11px] font-medium text-warning-foreground dark:text-warning">
                          Dispensasi sampai: {item.unlocked_until}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 pt-1">
                      {onOpenLockDialog && item.is_locked && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onOpenLockDialog(item.id, 'unlock')}
                        >
                          Buka Kunci
                        </Button>
                      )}
                      {onOpenLockDialog && !item.is_locked && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onOpenLockDialog(item.id, 'lock')}
                        >
                          Kunci
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
