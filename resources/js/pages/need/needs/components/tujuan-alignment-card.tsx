import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import type { Indicator, Sasaran, Tujuan as BaseTujuan } from '../columns';

interface TujuanAlignmentCardProps {
  tujuan: BaseTujuan;
}

export function TujuanAlignmentCard({ tujuan }: TujuanAlignmentCardProps) {
  return (
    <Card className="gap-0 p-0">
      <TujuanHeader name={tujuan.name} />
      <CardContent className="p-0">
        <div className="divide-y">
          {tujuan.sasarans.map((sasaran) => (
            <SasaranItem key={sasaran.id} sasaran={sasaran} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TujuanHeader({ name }: { name: string }) {
  return (
    <CardHeader className="border-b bg-muted/30 p-4">
      <CardTitle className="text-sm">Tujuan: {name}</CardTitle>
    </CardHeader>
  );
}

function SasaranItem({ sasaran }: { sasaran: Sasaran }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 border-b px-4 py-3">
        <span className="">Sasaran: {sasaran.name}</span>
      </div>

      <div className="bg-muted pl-4">
        <div className="border-l bg-background">
          {sasaran.indicators && sasaran.indicators.length > 0 ? (
            sasaran.indicators.map((indicator, idx) => (
              <IndicatorItem
                key={indicator.id}
                indicator={indicator}
                isLast={idx === (sasaran.indicators?.length ?? 0) - 1}
              />
            ))
          ) : (
            <p className="py-4 pl-6 text-[11px] font-medium text-muted-foreground/70 italic">
              Belum ada indikator terpilih untuk sasaran ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function IndicatorItem({
  indicator,
  isLast,
}: {
  indicator: Indicator;
  isLast: boolean;
}) {
  return (
    <div className="group/indicator">
      <div className="border-b p-3">
        <span className="text-sm">{indicator.name}</span>
      </div>

      <div className="no-scrollbar flex overflow-x-auto">
        {indicator.baseline && (
          <IndicatorMetric label="Baseline" value={indicator.baseline} />
        )}

        {indicator.targets && indicator.targets.length > 0 ? (
          indicator.targets.map((target) => (
            <IndicatorMetric
              key={target.id}
              label={target.year}
              value={target.target}
              isPrimary
            />
          ))
        ) : (
          <div className="px-4 py-3 text-[10px] font-medium text-muted-foreground/60 italic">
            Belum ada target tahunan
          </div>
        )}
      </div>
      {!isLast && <Separator className="mt-4 bg-muted-foreground/5" />}
    </div>
  );
}

function IndicatorMetric({
  label,
  value,
  isPrimary = false,
}: {
  label: string | number;
  value: string;
  isPrimary?: boolean;
}) {
  return (
    <div className="min-w-22 flex-1 border-r px-4 py-2 last:border-r-0">
      <p className="text-xs whitespace-nowrap text-muted-foreground/60">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-semibold whitespace-nowrap ${isPrimary ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </p>
    </div>
  );
}
