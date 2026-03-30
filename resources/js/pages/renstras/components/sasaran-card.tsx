import { Edit, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Indicator, Sasaran } from '@/types';

import { IndicatorTable } from './indicator-table';

interface SasaranCardProps {
  sasaran: Sasaran;
  yearStart: number;
  yearEnd: number;
  onCreateIndicator: (sasaran: Sasaran) => void;
  onEditSasaran: (sasaran: Sasaran) => void;
  onDeleteSasaran: (sasaran: Sasaran) => void;
  onEditIndicator: (indicator: Indicator, sasaran: Sasaran) => void;
}

export function SasaranCard({
  sasaran,
  yearStart,
  yearEnd,
  onCreateIndicator,
  onEditSasaran,
  onDeleteSasaran,
  onEditIndicator,
}: SasaranCardProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-none border border-t-0 py-0 ring-0 last:border-b-0">
      <div className="flex flex-col border-b bg-muted/40 p-4 md:flex-row">
        <div className="flex-1">
          <h4 className="font-semibold">Sasaran: {sasaran.name}</h4>
          {sasaran.description && (
            <p className="mt-1 max-w-[75ch] text-sm whitespace-normal text-muted-foreground">
              {sasaran.description}
            </p>
          )}
        </div>
        <div className="mt-4 flex items-start justify-end gap-2 md:mt-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateIndicator(sasaran)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Indikator
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onEditSasaran(sasaran)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={() => onDeleteSasaran(sasaran)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border-t p-0">
        <IndicatorTable
          indicators={sasaran.indicators || []}
          onEdit={(indicator) => onEditIndicator(indicator, sasaran)}
          yearStart={yearStart}
          yearEnd={yearEnd}
        />
      </div>
    </Card>
  );
}
