import { Building2, Calendar, Layers } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div
      className={cn('flex items-center justify-between px-4 py-3', className)}
    >
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
      <CardHeader className="border-b bg-muted/30 px-4 py-3">
        <CardTitle className="text-sm font-semibold">Informasi Umum</CardTitle>
      </CardHeader>
      <CardContent className="divide-y p-0">
        <InfoRow label="Unit Kerja">
          <p className="text-sm font-medium">
            {need.organizational_unit?.name}
          </p>
        </InfoRow>

        <InfoRow label="Tahun Anggaran">
          <p className="text-sm font-medium">{need.year}</p>
        </InfoRow>

        <InfoRow label="Jenis Kebutuhan">
          <p className="text-sm font-medium">{need.need_type?.name}</p>
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
