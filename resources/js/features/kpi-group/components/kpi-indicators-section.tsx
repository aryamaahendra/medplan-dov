import {
  RiAddLine,
  RiLayoutGridLine,
  RiTableLine as TableIcon,
} from '@remixicon/react';

import { KpiIndicatorTree } from '@/components/kpis/kpi-indicator-tree';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePermission } from '@/hooks/use-permission';
import type { KpiGroup, KpiIndicator } from '@/types';

import { KpiGroupTable } from './kpi-group-table';

interface KpiIndicatorsSectionProps {
  group: KpiGroup;
  indicators: KpiIndicator[];
  view: 'card' | 'table';
  onViewChange: (view: 'card' | 'table') => void;
  onCreateIndicator?: () => void;
  onEditIndicator?: (indicator: KpiIndicator) => void;
  onCreateChildIndicator?: (parent: KpiIndicator) => void;
}

export function KpiIndicatorsSection({
  group,
  indicators,
  view,
  onViewChange,
  onCreateIndicator,
  onEditIndicator,
  onCreateChildIndicator,
}: KpiIndicatorsSectionProps) {
  const { hasPermission } = usePermission();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 px-0.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Struktur Indikator
          </h2>
          <p className="text-xs text-muted-foreground italic">
            {indicators.length} indikator/kategori ditemukan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup
            value={[view]}
            onValueChange={(val) => {
              if (val[0]) {
                onViewChange(val[0] as 'card' | 'table');
              }
            }}
            variant="outline"
          >
            <ToggleGroupItem value="table" aria-label="Table View">
              <TableIcon className="mr-2 h-4 w-4" />
              Table
            </ToggleGroupItem>
            <ToggleGroupItem value="card" aria-label="Card View">
              <RiLayoutGridLine className="mr-2 h-4 w-4" />
              Card
            </ToggleGroupItem>
          </ToggleGroup>

          {hasPermission('create kpi-indicators') && onCreateIndicator && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Button onClick={onCreateIndicator}>
                <RiAddLine data-icon="inline-start" />
                Tambah Indikator Utama
              </Button>
            </>
          )}
        </div>
      </div>

      {view === 'table' ? (
        <KpiGroupTable
          group={group}
          indicators={indicators}
          onEdit={
            hasPermission('update kpi-indicators') ? onEditIndicator : undefined
          }
          onCreateChild={
            hasPermission('create kpi-indicators')
              ? onCreateChildIndicator
              : undefined
          }
          onCreateFirst={
            hasPermission('create kpi-indicators')
              ? onCreateIndicator
              : undefined
          }
        />
      ) : (
        <KpiIndicatorTree
          indicators={indicators}
          yearStart={group.start_year}
          yearEnd={group.end_year}
          onEdit={
            hasPermission('update kpi-indicators') ? onEditIndicator : undefined
          }
          onCreateChild={
            hasPermission('create kpi-indicators')
              ? onCreateChildIndicator
              : undefined
          }
          onCreateFirst={
            hasPermission('create kpi-indicators')
              ? onCreateIndicator
              : undefined
          }
          emptyMessage="Belum ada indikator atau kategori untuk periode ini."
        />
      )}
    </div>
  );
}
