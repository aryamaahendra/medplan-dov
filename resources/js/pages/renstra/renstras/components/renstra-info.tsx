import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Renstra } from '@/types';

interface RenstraInfoProps {
  renstra: Renstra;
}

export function RenstraInfo({ renstra }: RenstraInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{renstra.name}</CardTitle>
        <CardDescription>
          Periode: {renstra.year_start} - {renstra.year_end} | Status:{' '}
          <span
            className={
              renstra.is_active
                ? 'font-medium text-primary'
                : 'text-muted-foreground'
            }
          >
            {renstra.is_active ? 'Aktif' : 'Tidak Aktif'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <h4 className="mb-1 text-sm font-medium">Deskripsi</h4>
            <p className="text-sm text-muted-foreground">
              {renstra.description || 'Tidak ada deskripsi.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
