import { Card, CardContent } from '@/components/ui/card';

import type { Need } from '../columns';

interface RlsAlignmentShowProps {
  need: Need;
}

function RlsInfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground">
        {value || (
          <span className="text-muted-foreground/50 italic">
            Tidak ada data
          </span>
        )}
      </p>
    </div>
  );
}

export function RlsAlignmentShow({ need }: RlsAlignmentShowProps) {
  const plans = need.strategic_service_plans || [];

  return (
    <div className="pt-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">
          Rencana Layanan Strategis (RLS)
        </h2>
        <p className="text-sm text-muted-foreground">
          Kaitan usulan dengan rencana layanan dan program strategis organisasi.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {plans.length > 0 ? (
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="gap-0 p-0">
                <div className="border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium tracking-wide">
                      Program: {plan.strategic_program}
                    </span>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y bg-background">
                    <RlsInfoItem label="Tahun" value={plan.year} />
                    <RlsInfoItem
                      label="Rencana Layanan"
                      value={plan.service_plan}
                    />
                    <RlsInfoItem label="Target" value={plan.target} />
                    <RlsInfoItem
                      label="Arah Kebijakan"
                      value={plan.policy_direction}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada Rencana Layanan Strategis (RLS) yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
