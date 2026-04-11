import { Card, CardContent } from '@/components/ui/card';

import type { Sasaran, Tujuan } from '../columns';
import { TujuanAlignmentCard } from './tujuan-alignment-card';

interface StrategicAlignmentSectionProps {
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
}

export function StrategicAlignmentSection({
  groupedRenstra,
}: StrategicAlignmentSectionProps) {
  return (
    <div className="pt-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Penyelarasan Strategis</h2>
        <p className="text-sm text-muted-foreground">
          Keterkaitan usulan dengan Rencana Strategis (Renstra) melalui Tujuan,
          Sasaran, dan Indikator Kinerja.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {groupedRenstra.length > 0 ? (
          <div className="space-y-4">
            {groupedRenstra.map((tujuan) => (
              <TujuanAlignmentCard key={tujuan.id} tujuan={tujuan} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada penyelarasan strategis yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
