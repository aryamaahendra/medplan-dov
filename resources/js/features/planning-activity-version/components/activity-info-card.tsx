import InputError from '@/components/input-error';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PlanningActivityVersion } from '@/types/planning-version';

interface ActivityInfoCardProps {
  activity?: PlanningActivityVersion;
  parents: Pick<PlanningActivityVersion, 'id' | 'name' | 'code'>[];
  activityTypes: { value: string; label: string }[];
  parentId: string;
  onParentChange: (id: string | null) => void;
  code: string;
  onCodeChange: (code: string) => void;
  codeExists: boolean;
  type: string;
  onTypeChange: (type: string) => void;
  errors: Record<string, string | undefined>;
}

export function ActivityInfoCard({
  activity,
  parents,
  activityTypes,
  parentId,
  onParentChange,
  code,
  onCodeChange,
  codeExists,
  type,
  onTypeChange,
  errors,
}: ActivityInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Nomenklatur</CardTitle>
        <CardDescription>
          Pilih induk dan tentukan kode serta nama nomenklatur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="parent_id">Induk (Parent)</Label>
            <Select value={parentId} onValueChange={onParentChange}>
              <SelectTrigger
                id="parent_id"
                className="w-full max-w-full truncate"
              >
                <SelectValue placeholder="Pilih induk (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa Induk</SelectItem>
                {parents
                  .filter(
                    (p) =>
                      p.id !== activity?.id &&
                      p.code &&
                      !/[a-zA-Z]$/.test(p.code),
                  )
                  .map((parent) => (
                    <SelectItem key={parent.id} value={parent.id.toString()}>
                      {parent.code} - {parent.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              name="parent_id"
              value={parentId === 'none' ? '' : parentId}
            />
            <InputError message={errors.parent_id} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode</Label>
              <Input
                id="code"
                name="code"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="Contoh: 1.02.01"
                className={codeExists ? 'border-destructive' : ''}
              />
              {codeExists && (
                <p className="text-xs text-destructive">
                  Kode ini sudah digunakan dalam versi ini.
                </p>
              )}
              <InputError message={errors.code} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipe</Label>
              <Select
                value={type}
                onValueChange={(val) => {
                  if (val) {
                    onTypeChange(val);
                  }
                }}
                name="type"
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={type} />
              <InputError message={errors.type} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Urutan (Sort Order)</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={activity?.sort_order ?? 0}
                placeholder="0"
              />
              <InputError message={errors.sort_order} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nama Nomenklatur</Label>
            <Textarea
              id="name"
              name="name"
              defaultValue={activity?.name ?? ''}
              className="min-h-[100px]"
              required
            />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="perangkat_daerah">Perangkat Daerah</Label>
            <Input
              id="perangkat_daerah"
              name="perangkat_daerah"
              defaultValue={activity?.perangkat_daerah ?? ''}
            />
            <InputError message={errors.perangkat_daerah} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              defaultValue={activity?.keterangan ?? ''}
            />
            <InputError message={errors.keterangan} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
