import {
  RiLockFill,
  RiLockUnlockFill,
  RiTimeFill,
  RiAlertLine,
  RiCheckboxCircleFill,
  RiCalendarEventLine,
  RiLockLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatNumber } from '@/lib/formatters';
import type {
  ActiveUnlockItem,
  OperationsLockAnomaly,
  OperationsLockMonitorData,
} from '@/types/needs-dashboard';

import { OperationsExceptionDrawer } from './operations-exception-drawer';

interface OperationsLockMonitorProps {
  groupId?: number;
  lockMonitor?: OperationsLockMonitorData;
  activeUnlocks: ActiveUnlockItem[];
  onOpenLockDialog?: (needId: number, mode: 'lock' | 'unlock') => void;
  borderless?: boolean;
}

export function OperationsLockMonitor({
  lockMonitor,
  activeUnlocks,
  onOpenLockDialog,
  borderless,
}: OperationsLockMonitorProps) {
  const [selectedAnomaly, setSelectedAnomaly] =
    useState<OperationsLockAnomaly | null>(null);

  const timeline = lockMonitor?.timeline;
  const tiers = lockMonitor?.tier_counts;
  const anomalies = lockMonitor?.anomalies ?? [];

  const innerContent = (
    <div className="flex flex-col gap-5">
      {/* 1. Window Timeline with 'Now' marker */}
      {timeline && (
        <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <RiCalendarEventLine className="size-3.5 text-muted-foreground" />
              Jadwal Pengajuan Siklus
            </span>
            <span className="font-mono text-xss text-muted-foreground">
              Waktu Server: {timeline.now_formatted}
            </span>
          </div>

          {/* Progress bar timeline */}
          <div className="relative mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                style={{
                  width:
                    timeline.status === 'closed'
                      ? '100%'
                      : timeline.status === 'upcoming'
                        ? '0%'
                        : '65%',
                }}
                className={
                  timeline.status === 'closed'
                    ? 'h-full rounded-full bg-destructive'
                    : timeline.status === 'upcoming'
                      ? 'h-full rounded-full bg-warning'
                      : 'h-full rounded-full bg-success'
                }
              />
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-between text-xss text-muted-foreground">
            <span>Mulai: {timeline.start_at ?? 'Terbuka'}</span>
            <span className="font-medium text-foreground">
              {timeline.status === 'open' &&
                timeline.days_remaining !== null && (
                  <span className="font-mono text-success-foreground dark:text-success">
                    Tersisa {timeline.days_remaining} hari
                  </span>
                )}
              {timeline.status === 'closed' && (
                <span className="font-mono text-destructive">
                  Batas pengajuan ditutup
                </span>
              )}
            </span>
            <span>Batas: {timeline.end_at ?? 'Tidak ditentukan'}</span>
          </div>
        </div>
      )}

      {/* 2. Lock Tier Breakdown Tiles */}
      <div>
        <span className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Rincian Kategori Kunci (Tiers Breakdown)
        </span>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Tier 2: Dispensasi Aktif */}
          <div className="flex flex-col justify-between rounded-md border border-warning/30 bg-warning/5 p-2.5 dark:bg-warning/10">
            <div className="flex items-center justify-between text-xss text-warning-foreground dark:text-warning">
              <span>Dispensasi</span>
              <RiLockUnlockFill className="size-3 text-warning" />
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-warning-foreground dark:text-warning">
              {formatNumber(tiers?.tier_2_extension ?? activeUnlocks.length)}
            </div>
            <span className="text-xss text-muted-foreground">
              Izin edit sementara
            </span>
          </div>

          {/* Tier 3: Manual Kunci */}
          <div className="flex flex-col justify-between rounded-md border border-border/80 bg-card p-2.5">
            <div className="flex items-center justify-between text-xss text-muted-foreground">
              <span>Manual Kunci</span>
              <RiLockFill className="size-3 text-muted-foreground" />
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-foreground">
              {formatNumber(tiers?.tier_3_manual ?? 0)}
            </div>
            <span className="text-xss text-muted-foreground">
              Oleh tim perencana
            </span>
          </div>

          {/* Tier 4: Disetujui Direktur */}
          <div className="flex flex-col justify-between rounded-md border border-success/30 bg-success/5 p-2.5 dark:bg-success/10">
            <div className="flex items-center justify-between text-xss text-success-foreground dark:text-success">
              <span>Persetujuan Direktur</span>
              <RiCheckboxCircleFill className="size-3 text-success" />
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-success-foreground dark:text-success">
              {formatNumber(tiers?.tier_4_director ?? 0)}
            </div>
            <span className="text-xss text-muted-foreground">
              Terkunci permanen
            </span>
          </div>

          {/* Tier 5: Jadwal Ditutup */}
          <div className="flex flex-col justify-between rounded-md border border-border/80 bg-card p-2.5">
            <div className="flex items-center justify-between text-xss text-muted-foreground">
              <span>Jadwal Tutup</span>
              <RiTimeFill className="size-3 text-muted-foreground" />
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-foreground">
              {formatNumber(tiers?.tier_5_window ?? 0)}
            </div>
            <span className="text-xss text-muted-foreground">
              Kunci otomatis siklus
            </span>
          </div>
        </div>
      </div>

      {/* 3. Anomalies Alert list if any */}
      {anomalies.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-semibold tracking-wide text-destructive uppercase">
            Temuan Anomali Kunci ({anomalies.length})
          </span>

          <div className="flex flex-col divide-y divide-destructive/30 rounded-md border border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
            {anomalies.map((anom) => (
              <button
                key={anom.type}
                type="button"
                onClick={() => setSelectedAnomaly(anom)}
                className="flex w-full cursor-pointer items-center justify-between p-2.5 text-left transition-colors hover:bg-destructive/10"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                    <RiAlertLine className="size-3.5" />
                    <span>{anom.title}</span>
                  </div>
                  <p className="mt-0.5 text-xss text-muted-foreground">
                    {anom.description}
                  </p>
                </div>

                <Badge variant="destructive" className="font-mono">
                  {formatNumber(anom.count)} usulan
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Extensions / Unlock table */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Daftar Izin Buka Kunci Aktif
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {activeUnlocks.length} Usulan
          </span>
        </div>

        {activeUnlocks.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center rounded-md border border-dashed border-border/80 text-center">
            <RiLockLine className="size-5 text-muted-foreground opacity-50" />
            <p className="mt-1 text-xs text-muted-foreground">
              Tidak ada izin buka kunci sementara yang aktif saat ini.
            </p>
          </div>
        ) : (
          <div className="max-h-56 divide-y divide-border/60 overflow-y-auto rounded-md border border-border/80">
            {activeUnlocks.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <span className="block truncate font-medium text-foreground">
                    {item.title}
                  </span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xss text-muted-foreground">
                    <span className="truncate">{item.unit_name}</span>
                    <span>-</span>
                    <span className="font-mono font-medium text-warning-foreground dark:text-warning">
                      Batas:{' '}
                      {item.unlocked_until
                        ? new Date(item.unlocked_until).toLocaleDateString(
                            'id-ID',
                          )
                        : '-'}
                    </span>
                    {item.lock_reason && (
                      <span className="truncate italic">
                        ({item.lock_reason})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {onOpenLockDialog && item.can_lock && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenLockDialog(item.id, 'lock')}
                    >
                      Kunci Kembali
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {borderless ? (
        innerContent
      ) : (
        <Card className="flex flex-col border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <span className="flex items-center gap-2">
                  <RiLockLine className="size-4 text-foreground" />
                  <span>Monitor Kunci & Dispensasi Siklus (Lock Monitor)</span>
                </span>
              </CardTitle>

              <Badge variant="outline" className="font-mono">
                {formatNumber(tiers?.total_locked ?? 0)} Usulan Terkunci
              </Badge>
            </div>
            <CardDescription>
              Status pembatasan edit per tingkatan (5-Tier) dan izin dispensasi
              revisi
            </CardDescription>
          </CardHeader>

          <CardContent>{innerContent}</CardContent>
        </Card>
      )}
      {/* Anomaly drill-down drawer */}
      {selectedAnomaly && (
        <OperationsExceptionDrawer
          open={!!selectedAnomaly}
          onOpenChange={(open) => !open && setSelectedAnomaly(null)}
          title={selectedAnomaly.title}
          description={selectedAnomaly.description}
          severity="warning"
          code="ANOMALI"
          count={selectedAnomaly.count}
          needs={selectedAnomaly.needs}
          onOpenLockDialog={onOpenLockDialog}
        />
      )}
    </>
  );
}
