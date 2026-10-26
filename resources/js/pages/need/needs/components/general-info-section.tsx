import {
  FieldWrapper,
  FormGrid,
  InputField,
  SelectField,
  TextareaField,
} from '@/components/form';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TreeSelect } from '@/components/ui/tree-select';
import { normalizeVolume } from '@/lib/formatters';

const formatIDR = (value: string | number) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const strValue = value.toString().replace(',', '.');
  const [intPart, decPart] = strValue.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
};

const parseIDR = (value: string) => {
  return value.replace(/\./g, '').replace(',', '.');
};

const UNIT_OPTIONS = [
  'pcs',
  'unit',
  'orang',
  'paket',
  'set',
  'buah',
  'lembar',
  'kg',
  'liter',
  'meter',
] as const;

interface GeneralInfoSectionProps {
  data: any;
  setData: (key: any, value: any) => void;
  errors: any;
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  handleVolumeChange: (value: string) => void;
  handleUnitPriceChange: (value: string) => void;
}

export function GeneralInfoSection({
  data,
  setData,
  errors,
  organizationalUnits,
  needTypes,
  handleVolumeChange,
  handleUnitPriceChange,
}: GeneralInfoSectionProps) {
  return (
    <div className="space-y-6">
      <FormGrid cols={2} density="comfortable">
        <FieldWrapper
          id="organizational_unit_id"
          label="Unit Kerja"
          error={errors.organizational_unit_id}
        >
          {({ id }) => (
            <TreeSelect
              id={id}
              items={organizationalUnits}
              value={data.organizational_unit_id}
              onValueChange={(v) => setData('organizational_unit_id', v)}
              placeholder="Pilih unit kerja"
              className="bg-muted/20 transition-colors hover:bg-muted/40"
            />
          )}
        </FieldWrapper>

        <SelectField
          id="need_type_id"
          label="Kategori Kebutuhan"
          value={data.need_type_id?.toString()}
          onValueChange={(v) => setData('need_type_id', v)}
          placeholder="Pilih kategori kebutuhan"
          options={needTypes.map((t) => ({
            label: t.name,
            value: t.id.toString(),
          }))}
          error={errors.need_type_id}
        />
      </FormGrid>

      <div className="flex flex-col items-start gap-5 md:flex-row">
        <div className="w-full shrink-0 md:w-32">
          <InputField
            id="year"
            name="year"
            type="number"
            label="Tahun"
            min="2000"
            max="2100"
            value={data.year}
            onChange={(e) => setData('year', e.target.value)}
            required
            className="bg-muted/20"
            error={errors.year}
          />
        </div>

        <div className="w-full flex-1">
          <InputField
            id="title"
            name="title"
            label="Judul Usulan"
            placeholder="Contoh: Pengadaan Komputer untuk Bidang A"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            required
            className="border-primary/20 bg-muted/20 shadow-xs transition-all focus:border-primary"
            error={errors.title}
          />
        </div>
      </div>

      <TextareaField
        id="description"
        name="description"
        label="Detail Usulan"
        placeholder="Uraikan detail usulan kebutuhan..."
        value={data.description}
        onChange={(e) => setData('description', e.target.value)}
        rows={3}
        className="resize-none bg-muted/10"
        error={errors.description}
      />

      <TextareaField
        id="current_condition"
        name="current_condition"
        label="Kondisi Saat Ini"
        placeholder="Apa kendala saat ini?"
        value={data.current_condition}
        onChange={(e) => setData('current_condition', e.target.value)}
        rows={2}
        className="resize-none bg-muted/5 text-sm"
        error={errors.current_condition}
      />

      <TextareaField
        id="required_condition"
        name="required_condition"
        label="Kondisi Optimal"
        placeholder="Target yang diharapkan?"
        value={data.required_condition}
        onChange={(e) => setData('required_condition', e.target.value)}
        rows={2}
        className="resize-none bg-muted/5 text-sm"
        error={errors.required_condition}
      />

      <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-2">
          <Label
            htmlFor="volume"
            className="text-xs font-semibold tracking-tight text-muted-foreground uppercase"
          >
            Satuan & Volume
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              value={data.unit ? [data.unit] : []}
              onValueChange={(v) => {
                setData('unit', v[0] ?? '');
              }}
              variant="outline"
              className="flex-wrap items-center justify-start"
            >
              {UNIT_OPTIONS.map((u) => (
                <ToggleGroupItem
                  key={u}
                  value={u}
                  className="h-8 min-w-10 rounded-md border px-2.5 text-xs capitalize data-pressed:bg-primary data-pressed:text-primary-foreground"
                >
                  {u}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="min-w-[120px] flex-1">
              <Input
                id="volume"
                name="volume"
                type="number"
                min="0"
                step="0.0001"
                value={data.volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                onBlur={() => handleVolumeChange(normalizeVolume(data.volume))}
                required
                className="bg-background text-center font-medium"
              />
            </div>
          </div>
          <InputError message={errors.unit || errors.volume} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="unit_price"
              className="text-xs font-semibold text-muted-foreground"
            >
              Harga Satuan (Rp)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                Rp
              </span>
              <Input
                id="unit_price"
                name="unit_price"
                type="text"
                placeholder="0"
                value={formatIDR(data.unit_price)}
                onChange={(e) =>
                  handleUnitPriceChange(parseIDR(e.target.value))
                }
                required
                className="bg-background pl-9 font-mono"
              />
            </div>
            <InputError message={errors.unit_price} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total_price" className="text-xs font-semibold">
              Estimasi Total (Rp)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold">
                Rp
              </span>
              <Input
                id="total_price"
                name="total_price"
                type="text"
                value={formatIDR(data.total_price)}
                readOnly
                className="pl-9 font-mono font-bold"
                tabIndex={-1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
