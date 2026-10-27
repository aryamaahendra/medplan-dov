import {
  RiAddLine,
  RiLayoutGridLine,
  RiTableLine as TableIcon,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Indicator, Renstra, Sasaran, Tujuan } from '@/types';

import { RenstraSection } from './renstra-section';
import { RenstraTable } from './renstra-table';
import { TujuanCard } from './tujuan-card';

interface RenstraGoalsSectionProps {
  renstra: Renstra;
  view: 'card' | 'table';
  onViewChange: (view: 'card' | 'table') => void;
  onCreateTujuan: () => void;
  onEditTujuan: (tujuan: Tujuan) => void;
  onDeleteTujuan: (tujuan: Tujuan | null) => void;
  onCreateSasaran: (tujuan: Tujuan) => void;
  onEditSasaran: (sasaran: Sasaran, tujuan: Tujuan) => void;
  onDeleteSasaran: (sasaran: Sasaran | null) => void;
  onCreateIndicator: (tujuan: Tujuan) => void;
  onEditIndicator: (indicator: Indicator, tujuan: Tujuan) => void;
  onCreateIndicatorForSasaran: (sasaran: Sasaran) => void;
  onEditIndicatorForSasaran: (indicator: Indicator, sasaran: Sasaran) => void;
}

export function RenstraGoalsSection({
  renstra,
  view,
  onViewChange,
  onCreateTujuan,
  onEditTujuan,
  onDeleteTujuan,
  onCreateSasaran,
  onEditSasaran,
  onDeleteSasaran,
  onCreateIndicator,
  onEditIndicator,
  onCreateIndicatorForSasaran,
  onEditIndicatorForSasaran,
}: RenstraGoalsSectionProps) {
  return (
    <RenstraSection
      title="Tujuan dan Indikator Kinerja"
      description="Daftar Tujuan strategis beserta indikatornya."
      action={
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
            <ToggleGroupItem value="card" aria-label="Card View">
              <RiLayoutGridLine className="mr-2 h-4 w-4" />
              Card
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table View">
              <TableIcon className="mr-2 h-4 w-4" />
              Table
            </ToggleGroupItem>
          </ToggleGroup>
          <Separator orientation="vertical" className="h-4" />
          <Button onClick={onCreateTujuan}>
            <RiAddLine data-icon="inline-start" />
            Tambah Tujuan
          </Button>
        </div>
      }
    >
      {view === 'card' ? (
        <div className="flex flex-col gap-6">
          {!renstra.tujuans || renstra.tujuans.length === 0 ? (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
              Belum ada tujuan strategis.
            </div>
          ) : (
            renstra.tujuans.map((tujuan) => (
              <TujuanCard
                key={tujuan.id}
                tujuan={tujuan}
                yearStart={renstra.year_start}
                yearEnd={renstra.year_end}
                onCreateSasaran={onCreateSasaran}
                onCreateIndicator={onCreateIndicator}
                onEditTujuan={onEditTujuan}
                onDeleteTujuan={onDeleteTujuan}
                onEditIndicator={onEditIndicator}
                onCreateSasaranIndicator={onCreateIndicatorForSasaran}
                onEditSasaran={onEditSasaran}
                onDeleteSasaran={onDeleteSasaran}
                onEditSasaranIndicator={onEditIndicatorForSasaran}
              />
            ))
          )}
        </div>
      ) : (
        <RenstraTable renstra={renstra} />
      )}
    </RenstraSection>
  );
}
