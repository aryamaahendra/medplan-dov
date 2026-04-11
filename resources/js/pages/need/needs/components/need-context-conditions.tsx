import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Need } from '../columns';

interface NeedContextConditionsProps {
  need: Need;
}

export function NeedContextConditions({ need }: NeedContextConditionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="gap-0 p-0">
        <CardHeader className="border-b bg-muted/30 px-4 py-3!">
          <CardTitle className="text-sm">Kondisi Saat Ini</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm/relaxed whitespace-pre-wrap">
            {need.current_condition || (
              <span className="text-muted-foreground/60 italic">
                Tidak ada data
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 p-0">
        <CardHeader className="border-b bg-muted/30 px-4 py-3!">
          <CardTitle className="text-sm">Kebutuhan Kondisi</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm/relaxed whitespace-pre-wrap">
            {need.required_condition || (
              <span className="text-muted-foreground/60 italic">
                Tidak ada data
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 p-0 sm:col-span-2">
        <CardHeader className="border-b bg-muted/30 px-4 py-3!">
          <CardTitle className="text-sm">Deskripsi / Justifikasi</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
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
