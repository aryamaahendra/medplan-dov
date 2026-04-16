import React, { Fragment } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { formatCurrency } from '../columns';
import type { Need } from '../columns';

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  labelClassName?: string;
}

function InfoRow({
  label,
  children,
  icon: Icon,
  className,
  labelClassName,
}: InfoRowProps) {
  return (
    <div className={cn('grid grid-cols-2 px-4 py-3', className)}>
      <div className={cn('text-sm text-muted-foreground', labelClassName)}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {children}
      </div>
    </div>
  );
}

interface NeedGeneralInfoProps {
  need: Need;
}

export function NeedGeneralInfo({ need }: NeedGeneralInfoProps) {
  return (
    <Card className="gap-0 p-0">
      <CardContent className="divide-y p-0">
        <InfoRow label="Kelompok Kebutuhan">
          <p className="text-sm font-medium">
            {need.needGroup ? `${need.needGroup.name}` : '-'}
          </p>
        </InfoRow>

        <InfoRow label="Unit Kerja">
          <div className="flex flex-col gap-0.5">
            {(() => {
              const getOrgUnitPath = (unit: any): string[] => {
                const path: string[] = [unit.name];
                let current = unit.parents_recursive;

                while (current) {
                  path.unshift(current.name);
                  current = current.parents_recursive;
                }

                return path;
              };

              if (!need.organizational_unit) {
                return <p className="text-sm">-</p>;
              }

              const paths = getOrgUnitPath(need.organizational_unit);

              if (paths.length <= 1) {
                return <p className="text-sm font-medium">{paths[0]}</p>;
              }

              return (
                <>
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                    {paths.slice(0, -1).map((name, i) => (
                      <Fragment key={i}>
                        <span>{name}</span>
                        {i < paths.length - 2 && <span>/</span>}
                      </Fragment>
                    ))}
                  </div>
                  <p className="text-sm leading-tight font-medium">
                    {paths[paths.length - 1]}
                  </p>
                </>
              );
            })()}
          </div>
        </InfoRow>

        <InfoRow label="Tahun Anggaran">
          <p className="text-sm font-medium">{need.year}</p>
        </InfoRow>

        <InfoRow label="Kategori Kebutuhan">
          <p className="text-sm font-medium">{need.need_type?.name}</p>
        </InfoRow>

        <InfoRow label="Kondisi Saat Ini">
          <p className="text-sm">{need.current_condition}</p>
        </InfoRow>

        <InfoRow label="Kebutuhan Kondisi">
          <p className="text-sm">{need.required_condition}</p>
        </InfoRow>

        <InfoRow label="Deskripsi / Justifikasi">
          <p className="text-sm">
            {need.description || (
              <span className="text-muted-foreground/60 italic">
                Tidak ada deskripsi
              </span>
            )}
          </p>
        </InfoRow>

        <InfoRow label="Volume & Satuan">
          <p className="text-sm font-medium">
            {Number(need.volume).toLocaleString('id-ID')} {need.unit}
          </p>
        </InfoRow>

        <InfoRow label="Harga Satuan">
          <p className="text-sm font-medium">
            {formatCurrency(need.unit_price)}
          </p>
        </InfoRow>

        <InfoRow
          label="Total Kebutuhan Biaya"
          className="bg-primary/5"
          labelClassName="text-primary/70 font-bold"
        >
          <p className="font-mono text-lg font-bold text-primary">
            {formatCurrency(need.total_price)}
          </p>
        </InfoRow>
      </CardContent>
    </Card>
  );
}
