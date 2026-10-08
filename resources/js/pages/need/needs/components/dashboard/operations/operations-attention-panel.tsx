import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiTimeLine,
  RiErrorWarningLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import needRoutes from '@/routes/needs';
import type {
  OperationExceptionItem,
  OperationsPayload,
} from '@/types/needs-dashboard';

import { OperationsExceptionDrawer } from './operations-exception-drawer';

interface OperationsAttentionPanelProps {
  groupId?: number;
  operations?: OperationsPayload;
  onOpenLockDialog?: (needId: number, mode: 'lock' | 'unlock') => void;
}

export function OperationsAttentionPanel({
  groupId,
  operations,
  onOpenLockDialog,
}: OperationsAttentionPanelProps) {
  const readyQueue = operations?.ready_for_verification;
  const exceptions = operations?.exceptions ?? [];

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerException, setActiveDrawerException] =
    useState<OperationExceptionItem | null>(null);
  const [isReadyQueueDrawer, setIsReadyQueueDrawer] = useState(false);

  const handleOpenException = (item: OperationExceptionItem) => {
    setIsReadyQueueDrawer(false);
    setActiveDrawerException(item);
    setDrawerOpen(true);
  };

  const handleOpenReadyQueue = () => {
    setIsReadyQueueDrawer(true);
    setActiveDrawerException(null);
    setDrawerOpen(true);
  };

  // Group exceptions by severity
  const criticalItems = exceptions.filter((e) => e.severity === 'critical');
  const warningItems = exceptions.filter((e) => e.severity === 'warning');
  const infoItems = exceptions.filter((e) => e.severity === 'info');

  const totalExceptionsCount = exceptions.reduce((sum, e) => sum + e.count, 0);

  return (
    <>
      <Card className="flex h-full flex-col border-border/80">
        <CardHeader className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <RiAlertLine className="size-4 text-warning" />
              <span>Perlu Perhatian (Exceptions)</span>
            </CardTitle>

            <Badge
              variant={totalExceptionsCount > 0 ? 'destructive' : 'secondary'}
              className="font-mono text-xs"
            >
              {totalExceptionsCount > 0
                ? `${totalExceptionsCount} Pengecualian`
                : 'Tertib'}
            </Badge>
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Usulan macet, syarat kelengkapan kurang, atau batas revisi mendekat
          </p>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-0 pb-4">
          {/* Positive Queue Header Banner: "Siap Diverifikasi" */}
          {readyQueue && (
            <div className="rounded-lg border border-success/40 bg-success/5 p-3 dark:bg-success/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success-foreground dark:text-success">
                    <RiCheckboxCircleLine className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-success-foreground dark:text-success">
                        Siap Diverifikasi
                      </span>
                      <Badge
                        variant="default"
                        className="h-4.5 bg-success px-1.5 font-mono text-[10px] text-success-foreground"
                      >
                        {formatNumber(readyQueue.count)}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-success-foreground/80 dark:text-success/80">
                      Draf dengan checklist &ge; 85% dan kelengkapan dokumen
                      penuh
                      {readyQueue.budget > 0 &&
                        ` (${formatCompactIDR(readyQueue.budget)})`}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenReadyQueue}
                  className="h-7 border-success/40 text-xs text-success-foreground hover:bg-success/10 dark:text-success"
                >
                  <span>Lihat Antrean</span>
                  <RiArrowRightLine className="ml-1 size-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Exception Lists grouped by severity */}
          {exceptions.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 text-center">
              <RiCheckboxCircleLine className="mb-1.5 size-7 text-success opacity-60" />
              <p className="text-xs font-semibold text-foreground">
                Tidak ada yang tertahan
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Seluruh tahapan usulan berjalan sesuai tata kelola.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 1. Critical Severity Group */}
              {criticalItems.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-destructive uppercase">
                    <RiErrorWarningLine className="size-3.5" />
                    <span>Kritis (Tindakan Segera)</span>
                  </div>

                  <div className="flex flex-col divide-y divide-border/60 rounded-md border border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
                    {criticalItems.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleOpenException(item)}
                        className="flex w-full cursor-pointer items-center justify-between p-2.5 text-left transition-colors hover:bg-destructive/10"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-destructive">
                              {item.code}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              {item.title}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="destructive"
                            className="font-mono text-xs"
                          >
                            {formatNumber(item.count)}
                          </Badge>
                          <RiArrowRightLine className="size-3.5 text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Warning Severity Group */}
              {warningItems.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-warning-foreground uppercase dark:text-warning">
                    <RiAlertLine className="size-3.5" />
                    <span>Peringatan (Perlu Pemantauan)</span>
                  </div>

                  <div className="flex flex-col divide-y divide-border/60 rounded-md border border-border/80">
                    {warningItems.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleOpenException(item)}
                        className="flex w-full cursor-pointer items-center justify-between p-2.5 text-left transition-colors hover:bg-accent/40"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {item.code}
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {item.title}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-warning/40 font-mono text-xs text-warning-foreground dark:text-warning"
                          >
                            {formatNumber(item.count)}
                          </Badge>
                          <RiArrowRightLine className="size-3.5 text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Info Severity Group */}
              {infoItems.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    <RiTimeLine className="size-3.5" />
                    <span>Informasi / Siklus Lanjutan</span>
                  </div>

                  <div className="flex flex-col divide-y divide-border/60 rounded-md border border-border/80">
                    {infoItems.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleOpenException(item)}
                        className="flex w-full cursor-pointer items-center justify-between p-2.5 text-left transition-colors hover:bg-accent/40"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {item.code}
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {item.title}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs"
                          >
                            {formatNumber(item.count)}
                          </Badge>
                          <RiArrowRightLine className="size-3.5 text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exception Drill-Down Side Drawer */}
      {isReadyQueueDrawer && readyQueue ? (
        <OperationsExceptionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Usulan Siap Diverifikasi"
          description="Daftar usulan draf yang telah melengkapi seluruh keterkaitan berkas dan memperoleh skor checklist minimal 85%."
          severity="ready"
          code="READY"
          count={readyQueue.count}
          budget={readyQueue.budget}
          needs={readyQueue.needs}
          filterUrl={needRoutes.index.url({
            query: {
              need_group_id: groupId,
              status: ['draft'],
              attention: ['ready_for_verification'],
            },
          })}
          onOpenLockDialog={onOpenLockDialog}
        />
      ) : activeDrawerException ? (
        <OperationsExceptionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={activeDrawerException.title}
          description={activeDrawerException.description}
          severity={activeDrawerException.severity}
          code={activeDrawerException.code}
          count={activeDrawerException.count}
          budget={activeDrawerException.budget}
          needs={activeDrawerException.needs}
          filterUrl={
            activeDrawerException.code !== 'E8'
              ? needRoutes.index.url({
                  query: {
                    need_group_id: groupId,
                    attention: [activeDrawerException.code],
                    ...(activeDrawerException.query_filter ?? {}),
                  },
                })
              : undefined
          }
          onOpenLockDialog={onOpenLockDialog}
        />
      ) : null}
    </>
  );
}
