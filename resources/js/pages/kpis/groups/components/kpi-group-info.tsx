import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { KpiGroup } from '@/types';

interface KpiGroupInfoProps {
  group: KpiGroup;
}

export function KpiGroupInfo({ group }: KpiGroupInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
        <CardDescription>
          Periode: {group.start_year} - {group.end_year} | Status:{' '}
          <span
            className={
              group.is_active
                ? 'font-medium text-primary'
                : 'text-muted-foreground'
            }
          >
            {group.is_active ? 'Aktif' : 'Tidak Aktif'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <h4 className="mb-1 text-sm font-medium">Deskripsi</h4>
            <p className="text-sm text-muted-foreground">
              {group.description || 'Tidak ada deskripsi.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
