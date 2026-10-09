import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Need } from '@/types';

interface NeedContextConditionsProps {
  need: Need;
}

export function NeedContextConditions({ need }: NeedContextConditionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card size="sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Kondisi Saat Ini</CardTitle>
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

      <Card size="sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Kebutuhan Kondisi</CardTitle>
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

      <Card size="sm" className="sm:col-span-2">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Deskripsi / Justifikasi</CardTitle>
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
