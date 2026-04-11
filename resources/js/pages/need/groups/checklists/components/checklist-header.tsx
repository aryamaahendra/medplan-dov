import { Badge } from '@/components/ui/badge';

interface Props {
  name: string;
  year: number;
}

export function ChecklistHeader({ name, year }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Kelola Checklist: {name}
        </h1>
        <Badge variant="outline">Tahun {year}</Badge>
      </div>
      <p className="text-muted-foreground">
        Tentukan pertanyaan mana yang harus dijawab saat menginput usulan di
        kelompok ini.
      </p>
    </div>
  );
}
