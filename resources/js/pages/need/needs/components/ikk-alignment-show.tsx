import { Card, CardContent } from '@/components/ui/card';
import type { Need } from '@/types';

import { NeedIkkTable } from './details/need-ikk-table';

interface IkkAlignmentShowProps {
  need: Need;
}

export function IkkAlignmentShow({ need }: IkkAlignmentShowProps) {
  const kpis = need.kpi_indicators || [];

  return (
    <div className="pt-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Penyelarasan KPI (IKK)</h2>
        <p className="text-sm text-muted-foreground">
          Hubungan usulan dengan Indikator Kinerja Kunci (IKK) organisasi.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {kpis.length > 0 ? (
          <NeedIkkTable kpiIndicators={kpis} needYear={need.year} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada Indikator Kinerja Kunci (IKK) yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
