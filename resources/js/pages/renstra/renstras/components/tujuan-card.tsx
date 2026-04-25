import { Edit, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/use-permission';
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
      <TujuanHeader
        tujuan={tujuan}
        onCreateSasaran={onCreateSasaran}
        onCreateIndicator={onCreateIndicator}
        onEditTujuan={onEditTujuan}
        onDeleteTujuan={onDeleteTujuan}
      />
      <div className="p-0">
        <IndicatorTable
          indicators={tujuan.indicators || []}
          onEdit={(indicator) => onEditIndicator(indicator, tujuan)}
          yearStart={yearStart}
          yearEnd={yearEnd}
        />

        <div className="h-4 border-y"></div>

        <SasaranList
          tujuan={tujuan}
          sasarans={tujuan.sasarans || []}
          yearStart={yearStart}
          yearEnd={yearEnd}
          onCreateIndicator={onCreateSasaranIndicator}
          onEditSasaran={onEditSasaran}
          onDeleteSasaran={onDeleteSasaran}
          onEditIndicator={onEditSasaranIndicator}
        />
      </div>
    </Card>
  );
}

function TujuanHeader({
  tujuan,
  onCreateSasaran,
  onCreateIndicator,
  onEditTujuan,
  onDeleteTujuan,
}: {
  tujuan: Tujuan;
  onCreateSasaran: (tujuan: Tujuan) => void;
  onCreateIndicator: (tujuan: Tujuan) => void;
  onEditTujuan: (tujuan: Tujuan) => void;
  onDeleteTujuan: (tujuan: Tujuan) => void;
}) {
  const { hasPermission } = usePermission();

  return (
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
        {(hasPermission('create sasarans') ||
          hasPermission('create indicators')) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus />
                Tambah
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasPermission('create sasarans') && (
                <DropdownMenuItem onClick={() => onCreateSasaran(tujuan)}>
                  <Plus className="mr-1" />
                  Sasaran
                </DropdownMenuItem>
              )}
              {hasPermission('create indicators') && (
                <DropdownMenuItem onClick={() => onCreateIndicator(tujuan)}>
                  <Plus className="mr-1" />
                  Indikator
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {hasPermission('update tujuans') && (
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onEditTujuan(tujuan)}
          >
            <Edit />
          </Button>
        )}
        {hasPermission('delete tujuans') && (
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={() => onDeleteTujuan(tujuan)}
          >
            <Trash2 />
          </Button>
        )}
      </div>
    </div>
  );
}

function SasaranList({
  tujuan,
  sasarans,
  yearStart,
  yearEnd,
  onCreateIndicator,
  onEditSasaran,
  onDeleteSasaran,
  onEditIndicator,
}: {
  tujuan: Tujuan;
  sasarans: Sasaran[];
  yearStart: number;
  yearEnd: number;
  onCreateIndicator: (sasaran: Sasaran) => void;
  onEditSasaran: (sasaran: Sasaran, tujuan: Tujuan) => void;
  onDeleteSasaran: (sasaran: Sasaran) => void;
  onEditIndicator: (indicator: Indicator, sasaran: Sasaran) => void;
}) {
  if (sasarans.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/40 pl-4">
      {sasarans.map((sasaran, idx) => (
        <div key={sasaran.id} className="border-l">
          <SasaranCard
            sasaran={sasaran}
            yearStart={yearStart}
            yearEnd={yearEnd}
            onCreateIndicator={onCreateIndicator}
            onEditSasaran={(s) => onEditSasaran(s, tujuan)}
            onDeleteSasaran={onDeleteSasaran}
            onEditIndicator={onEditIndicator}
          />

          {idx !== sasarans.length - 1 && (
            <div className="h-4 border-y bg-background"></div>
          )}
        </div>
      ))}
    </div>
  );
}
