import InputError from '@/components/input-error';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  organizationalUnits: { id: number; name: string }[];
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
    <div className="space-y-5 py-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="organizational_unit_id">Unit Kerja</Label>
          <Select
            value={data.organizational_unit_id}
            onValueChange={(v) => setData('organizational_unit_id', v)}
          >
            <SelectTrigger
              id="organizational_unit_id"
              className="w-full bg-muted/20 transition-colors hover:bg-muted/40"
            >
              <SelectValue placeholder="Pilih unit kerja" />
            </SelectTrigger>
            <SelectContent>
              {organizationalUnits.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InputError message={errors.organizational_unit_id} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="need_type_id">Kategori Kebutuhan</Label>
          <Select
            value={data.need_type_id}
            onValueChange={(v) => setData('need_type_id', v)}
          >
            <SelectTrigger
              id="need_type_id"
              className="w-full bg-muted/20 transition-colors hover:bg-muted/40"
            >
              <SelectValue placeholder="Pilih kategori kebutuhan" />
            </SelectTrigger>
            <SelectContent>
              {needTypes.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InputError message={errors.need_type_id} />
        </div>
      </div>

      <div className="flex flex-col items-start gap-5 md:flex-row">
        <div className="w-full shrink-0 space-y-1.5 md:w-32">
          <Label htmlFor="year">Tahun</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min="2000"
            max="2100"
            value={data.year}
            onChange={(e) => setData('year', e.target.value)}
            required
            className="bg-muted/20"
          />
          <InputError message={errors.year} />
        </div>

        <div className="w-full flex-1 space-y-1.5">
          <Label htmlFor="title">Judul Usulan</Label>
          <Input
            id="title"
            name="title"
            placeholder="Contoh: Pengadaan Komputer untuk Bidang A"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            required
            className="border-primary/20 bg-muted/20 shadow-xs transition-all focus:border-primary"
          />
          <InputError message={errors.title} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Detail Usulan</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Uraikan detail usulan kebutuhan..."
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
          rows={3}
          className="resize-none bg-muted/10"
        />
        <InputError message={errors.description} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="current_condition">Kondisi Saat Ini</Label>
          <Textarea
            id="current_condition"
            name="current_condition"
            placeholder="Apa kendala saat ini?"
            value={data.current_condition}
            onChange={(e) => setData('current_condition', e.target.value)}
            rows={2}
            className="resize-none bg-muted/5 text-sm"
          />
          <InputError message={errors.current_condition} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="required_condition">Kondisi Optimal</Label>
          <Textarea
            id="required_condition"
            name="required_condition"
            placeholder="Target yang diharapkan?"
            value={data.required_condition}
            onChange={(e) => setData('required_condition', e.target.value)}
            rows={2}
            className="resize-none bg-muted/5 text-sm"
          />
          <InputError message={errors.required_condition} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-tight text-muted-foreground uppercase">
            Satuan & Volume
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={data.unit}
              onValueChange={(v) => v && setData('unit', v)}
              variant="outline"
              className="flex-wrap items-center justify-start"
            >
              {UNIT_OPTIONS.map((u) => (
                <ToggleGroupItem
                  key={u}
                  value={u}
                  className="h-8 min-w-10 rounded-md border px-2.5 text-xs capitalize data-[state=on]:bg-foreground/30"
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
                placeholder="Volume"
                value={data.volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
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
            <Label
              htmlFor="total_price"
              className="text-xs font-semibold text-primary"
            >
              Estimasi Total (Rp)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-primary/70">
                Rp
              </span>
              <Input
                id="total_price"
                name="total_price"
                type="text"
                value={formatIDR(data.total_price)}
                readOnly
                className="border-primary/20 bg-primary/5 pl-9 font-mono font-bold text-primary"
                tabIndex={-1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
