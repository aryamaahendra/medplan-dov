import { ClipboardList } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { Need } from '../columns';

interface RlsAlignmentShowProps {
  need: Need;
}

export function RlsAlignmentShow({ need }: RlsAlignmentShowProps) {
  const plans = need.strategic_service_plans || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          Rencana Layanan Strategis (RLS)
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Kaitan usulan dengan rencana layanan dan program strategis organisasi.
      </p>

      {plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden">
              <div className="border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold tracking-wide">
                    Program: {plan.strategic_program}
                  </span>
                  {plan.year && (
                    <Badge
                      variant="outline"
                      className="shrink-0 font-mono text-[10px]"
                    >
                      Tahun {plan.year}
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-0">
                <div className="bg-background p-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Rencana Layanan
                    </p>
                    <p className="text-sm text-foreground">
                      {plan.service_plan}
                    </p>
                  </div>
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
  );
}
