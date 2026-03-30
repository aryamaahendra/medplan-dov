import { Edit, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Indicator, Sasaran, Tujuan } from '@/types';

import { IndicatorTable } from './indicator-table';
import { SasaranCard } from './sasaran-card';

interface TujuanCardProps {
  tujuan: Tujuan;
  yearStart: number;
  yearEnd: number;
  onCreateSasaran: (tujuan: Tujuan) => void;
  onCreateIndicator: (tujuan: Tujuan) => void;
  onEditTujuan: (tujuan: Tujuan) => void;
  onDeleteTujuan: (tujuan: Tujuan) => void;
  onEditIndicator: (indicator: Indicator, tujuan: Tujuan) => void;

  onCreateSasaranIndicator: (sasaran: Sasaran) => void;
  onEditSasaran: (sasaran: Sasaran, tujuan: Tujuan) => void;
  onDeleteSasaran: (sasaran: Sasaran) => void;
  onEditSasaranIndicator: (indicator: Indicator, sasaran: Sasaran) => void;
}

export function TujuanCard({
  tujuan,
  yearStart,
  yearEnd,
  onCreateSasaran,
  onCreateIndicator,
  onEditTujuan,
  onDeleteTujuan,
  onEditIndicator,
  onCreateSasaranIndicator,
  onEditSasaran,
  onDeleteSasaran,
  onEditSasaranIndicator,
}: TujuanCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col border-b bg-muted/40 p-4 md:flex-row">
        <div className="flex-1">
          <h3 className="font-semibold">Tujuan: {tujuan.name}</h3>
          {tujuan.description && (
            <p className="mt-1 max-w-[75ch] text-sm whitespace-normal text-muted-foreground">
              {tujuan.description}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-start justify-end gap-2 md:mt-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onCreateSasaran(tujuan)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Sasaran
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateIndicator(tujuan)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Indikator
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onEditTujuan(tujuan)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={() => onDeleteTujuan(tujuan)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-0">
        <IndicatorTable
          indicators={tujuan.indicators || []}
          onEdit={(indicator) => onEditIndicator(indicator, tujuan)}
          yearStart={yearStart}
          yearEnd={yearEnd}
        />

        <div className="h-4 border-y"></div>

        {tujuan.sasarans && tujuan.sasarans.length > 0 && (
          <div className="bg-muted/40 pl-4">
            {tujuan.sasarans.map((sasaran) => (
              <SasaranCard
                key={sasaran.id}
                sasaran={sasaran}
                yearStart={yearStart}
                yearEnd={yearEnd}
                onCreateIndicator={onCreateSasaranIndicator}
                onEditSasaran={(s) => onEditSasaran(s, tujuan)}
                onDeleteSasaran={onDeleteSasaran}
                onEditIndicator={onEditSasaranIndicator}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
