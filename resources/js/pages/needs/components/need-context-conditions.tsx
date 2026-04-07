import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Need } from '../columns';

interface NeedContextConditionsProps {
  need: Need;
}

export function NeedContextConditions({ need }: NeedContextConditionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Kondisi Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm/relaxed whitespace-pre-wrap">
            {need.current_condition || (
              <span className="text-muted-foreground/60 italic">
                Tidak ada data
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Kebutuhan Kondisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm/relaxed whitespace-pre-wrap">
            {need.required_condition || (
              <span className="text-muted-foreground/60 italic">
                Tidak ada data
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Deskripsi / Justifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm/relaxed whitespace-pre-wrap">
            {need.description || (
              <span className="text-muted-foreground/60 italic">
                Tidak ada deskripsi
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
