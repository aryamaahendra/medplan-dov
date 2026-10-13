import {
  FormGrid,
  InputField,
  SelectField,
  TextareaField,
} from '@/components/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
          <SelectField
            id="parent_id"
            label="Induk (Parent)"
            value={parentId}
            onValueChange={onParentChange}
            placeholder="Pilih induk (opsional)"
            options={[
              { label: 'Tanpa Induk', value: 'none' },
              ...parents
                .filter(
                  (p) =>
                    p.id !== activity?.id &&
                    p.code &&
                    !/[a-zA-Z]$/.test(p.code),
                )
                .map((parent) => ({
                  label: `${parent.code} - ${parent.name}`,
                  value: parent.id.toString(),
                })),
            ]}
            error={errors.parent_id}
          />
          <input
            type="hidden"
            name="parent_id"
            value={parentId === 'none' ? '' : parentId}
          />

          <FormGrid cols={3}>
            <InputField
              id="code"
              name="code"
              label="Kode"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="Contoh: 1.02.01"
              className={codeExists ? 'border-destructive' : ''}
              description={
                codeExists
                  ? 'Kode ini sudah digunakan dalam versi ini.'
                  : undefined
              }
              error={errors.code}
            />

            <SelectField
              id="type"
              name="type"
              label="Tipe"
              value={type}
              onValueChange={(val) => {
                if (val) {
                  onTypeChange(val);
                }
              }}
              placeholder="Pilih Tipe"
              options={activityTypes}
              error={errors.type}
            />
            <input type="hidden" name="type" value={type} />

            <InputField
              id="sort_order"
              name="sort_order"
              type="number"
              label="Urutan (Sort Order)"
              defaultValue={activity?.sort_order ?? 0}
              placeholder="0"
              error={errors.sort_order}
            />
          </FormGrid>

          <TextareaField
            id="name"
            name="name"
            label="Nama Nomenklatur"
            defaultValue={activity?.name ?? ''}
            className="min-h-[100px]"
            required
            error={errors.name}
          />

          <InputField
            id="perangkat_daerah"
            name="perangkat_daerah"
            label="Perangkat Daerah"
            defaultValue={activity?.perangkat_daerah ?? ''}
            error={errors.perangkat_daerah}
          />

          <TextareaField
            id="keterangan"
            name="keterangan"
            label="Keterangan"
            defaultValue={activity?.keterangan ?? ''}
            error={errors.keterangan}
          />
        </div>
      </CardContent>
    </Card>
  );
}
